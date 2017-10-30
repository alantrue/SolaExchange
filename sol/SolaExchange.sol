pragma solidity ^0.4.15;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./MiniMeToken.sol";

contract SolaExchange is Ownable {
  using SafeMath for uint;

  address public feeAccount; //the account that will receive fees
  uint public feeTake; // thousandth
  mapping(address => bool) public tokensAllowed; // tokens which can be trade here
  mapping (address => mapping (address => uint)) public tokens; //mapping of token addresses to mapping of account balances (token=0 means Ether)
  mapping (address => mapping (bytes32 => bool)) public orders; //mapping of user accounts to mapping of order hashes to booleans (true = submitted by user, equivalent to offchain signature)
  mapping (address => mapping (bytes32 => uint)) public orderFills; //mapping of user accounts to mapping of order hashes to uints (amount of order that has been filled)

  event Order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user);
  event Cancel(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s);
  event Trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, address get, address give);
  event Deposit(address token, address user, uint amount, uint balance);
  event Withdraw(address token, address user, uint amount, uint balance);
  event Transfer(address token, uint amount, address receiver, uint balance);

  modifier nonZeroAddress(address x) {
    require(x != 0x0);
    _;
  }

  modifier notZero(uint x) {
    require(x > 0);
    _;
  }

  modifier needTokenAllowed(address x) {
    require(tokensAllowed[x]);
    _;
  }

  function SolaExchange(address _feeAccount, uint _feeTake) nonZeroAddress(_feeAccount) {
    feeAccount = _feeAccount;
    feeTake = _feeTake;
    tokensAllowed[0] = true;
  }

  function() {
    revert();
  }

  function changeFeeAccount(address _newFeeAccount) onlyOwner nonZeroAddress(_newFeeAccount) {
    feeAccount = _newFeeAccount;
  }

  function changeFeeTake(uint _newFeeTake) onlyOwner {
    feeTake = _newFeeTake;
  }

  function addToken(address token) onlyOwner nonZeroAddress(token) {
    require(!tokensAllowed[token]);
    tokensAllowed[token] = true;
  }

  function removeToken(address token) onlyOwner nonZeroAddress(token) {
    require(tokensAllowed[token]);
    tokensAllowed[token] = false;
  }

  function deposit() payable {
    require(msg.value > 0);
    tokens[0][msg.sender] = tokens[0][msg.sender].add(msg.value);
    Deposit(0, msg.sender, msg.value, tokens[0][msg.sender]);
  }

  function withdraw(uint amount) notZero(amount) {
    require(tokens[0][msg.sender] >= amount);
    tokens[0][msg.sender] = tokens[0][msg.sender].sub(amount);
    msg.sender.transfer(amount);
    Withdraw(0, msg.sender, amount, tokens[0][msg.sender]);
  }

  function transfer(uint amount, address receiver) notZero(amount) {
    require(receiver != 0x0);
    require(tokens[0][msg.sender] >= amount);
    tokens[0][msg.sender] = tokens[0][msg.sender].sub(amount);
    tokens[0][receiver] = tokens[0][receiver].add(amount);
    Transfer(0, amount, receiver, tokens[0][msg.sender]);
  }

  function depositToken(address token, uint amount) nonZeroAddress(token) notZero(amount) needTokenAllowed(token) {
    //remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.
    if (!MiniMeToken(token).transferFrom(msg.sender, this, amount)) revert();
    tokens[token][msg.sender] = tokens[token][msg.sender].add(amount);
    Deposit(token, msg.sender, amount, tokens[token][msg.sender]);
  }

  function withdrawToken(address token, uint amount) nonZeroAddress(token) notZero(amount) needTokenAllowed(token) {
    require(tokens[token][msg.sender] >= amount);
    tokens[token][msg.sender] = tokens[token][msg.sender].sub(amount);
    if (!MiniMeToken(token).transfer(msg.sender, amount)) revert();
    Withdraw(token, msg.sender, amount, tokens[token][msg.sender]);
  }

  function transferToken(address token, uint amount, address receiver) needTokenAllowed(token) notZero(amount) {
    require(receiver != 0x0);
    require(tokens[token][msg.sender] >= amount);
    tokens[token][msg.sender] = tokens[token][msg.sender].sub(amount);
    tokens[token][receiver] = tokens[token][receiver].add(amount);
    Transfer(token, amount, receiver, tokens[token][msg.sender]);
  }

  function balanceOf(address token, address user) constant returns (uint) {
    return tokens[token][user];
  }

  function order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce)
    notZero(amountGet)
    needTokenAllowed(tokenGet)
    notZero(amountGive)
    needTokenAllowed(tokenGive)
  {
    require(expires > block.number);
    require(tokens[tokenGive][msg.sender] >= amountGive.add(amountGive.mul(feeTake)/1000));
    bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
    orders[msg.sender][hash] = true;
    Order(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, msg.sender);
  }

  function trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s, uint amount) {
    //amount is in amountGet terms
    bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
    if (!(
      (orders[user][hash] || ecrecover(sha3("\x19Ethereum Signed Message:\n32", hash),v,r,s) == user) &&
      block.number <= expires &&
      (orderFills[user][hash].add(amount)) <= amountGet
    )) revert();
    require(tokens[tokenGet][msg.sender] >= amount.add(amount.mul(feeTake)/1000));
    tradeBalances(tokenGet, amountGet, tokenGive, amountGive, user, amount);
    orderFills[user][hash] = orderFills[user][hash].add(amount);
    Trade(tokenGet, amount, tokenGive, amountGive * amount / amountGet, user, msg.sender);
  }

  function tradeBalances(address tokenGet, uint amountGet, address tokenGive, uint amountGive, address user, uint amount) private {
    uint feeTakeGet = amount.mul(feeTake) / 1000;
    uint feeTakeGive = (amountGive.mul(amount) / amountGet).mul(feeTake) / 1000;
    tokens[tokenGet][msg.sender] = tokens[tokenGet][msg.sender].sub(amount.add(feeTakeGet));
    tokens[tokenGet][user] = tokens[tokenGet][user].add(amount);
    tokens[tokenGet][feeAccount] = tokens[tokenGet][feeAccount].add(feeTakeGet);
    tokens[tokenGive][user] = tokens[tokenGive][user].sub((amountGive.mul(amount) / amountGet).add(feeTakeGive));
    tokens[tokenGive][msg.sender] = tokens[tokenGive][msg.sender].add((amountGive.mul(amount)) / amountGet);
    tokens[tokenGive][feeAccount] = tokens[tokenGive][feeAccount].add(feeTakeGive);
  }

  function testTrade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s, uint amount, address sender) constant returns(bool) {
    if (!(
      tokens[tokenGet][sender] >= amount &&
      availableVolume(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user, v, r, s) >= amount
    )) return false;
    return true;
  }

  function availableVolume(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s) constant returns(uint) {
    bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
    if (!(
      (orders[user][hash] || ecrecover(sha3("\x19Ethereum Signed Message:\n32", hash),v,r,s) == user) &&
      block.number <= expires
    )) return 0;
    uint available1 = amountGet.sub(orderFills[user][hash]);
    if ( available1 < (tokens[tokenGive][user].mul(amountGet) / amountGive))
      return available1;
    else
      return tokens[tokenGive][user].mul(amountGet) / amountGive;
  }

  function amountFilled(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s) constant returns(uint) {
    bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
    return orderFills[user][hash];
  }

  function cancelOrder(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint8 v, bytes32 r, bytes32 s) {
    bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
    if (!(orders[msg.sender][hash] || ecrecover(sha3("\x19Ethereum Signed Message:\n32", hash),v,r,s) == msg.sender)) revert();
    orderFills[msg.sender][hash] = amountGet;
    Cancel(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, msg.sender, v, r, s);
  }

  function tokenAllowed(address token) constant returns(bool) {
    return tokensAllowed[token];
  }

  // only for test, need to be removed in production
  function kill() public onlyOwner {
    selfdestruct(owner);
  }
}
