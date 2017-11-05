pragma solidity ^0.4.15;

import "./Ownable.sol";
import "./SafeMath.sol";

interface TokenController {
  function generateTokens(address token, address owner, uint amount);
  function destroyTokens(address token, address owner, uint amount);
}

interface ERC20Token {
  /// @return total amount of tokens
  function totalSupply() constant returns (uint);

  /// @param _owner The address from which the balance will be retrieved
  /// @return The balance
  function balanceOf(address _owner) constant returns (uint256 balance);

  /// @notice send `_value` token to `_to` from `msg.sender`
  /// @param _to The address of the recipient
  /// @param _amount The amount of token to be transferred
  /// @return Whether the transfer was successful or not
  function transfer(address _to, uint256 _amount) returns (bool success);

  /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
  /// @param _from The address of the sender
  /// @param _to The address of the recipient
  /// @param _amount The amount of token to be transferred
  /// @return Whether the transfer was successful or not
  function transferFrom(address _from, address _to, uint256 _amount) returns (bool success);
}

contract SttwStore is Ownable {
  using SafeMath for int;

  TokenController public tc;
  address public token;
  address public retailer;

  event BuyToken(address owner, uint amount, uint balance);
  event SellToken(address owner, uint amount, uint balance);

  modifier onlyRetailer(address x) {
    require(x == retailer);
    _;
  }

  function SttwStore(address _tokenController, address _token, address _retailer) {
    require(_tokenController != 0x0);
    require(_token != 0x0);
    tc = TokenController(_tokenController);
    token = _token;
    retailer = _retailer;
  }

  function changeRetailer(address newRetailer) public onlyOwner {
    retailer = newRetailer;
  }

  function buyToken(address owner, uint amount) public onlyRetailer(msg.sender) {
    uint256 balance = ERC20Token(token).balanceOf(this);
    if (balance >= amount) {
      if (!ERC20Token(token).transfer(owner, amount)) revert();
    } else {
      tc.generateTokens(token, owner, amount);
      // if (balance > 0) {
      //   if (!ERC20Token(token).transfer(owner, balance)) revert();
      //   uint remaining = amount - balance;
      //   tc.generateTokens(token, owner, remaining);
      // } else {
      //   tc.generateTokens(token, owner, amount);
      // }
    }
    BuyToken(owner, amount, balanceOf(owner));
  }

  function sellToken(address owner, uint amount) public onlyRetailer(msg.sender) {
    //remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.
    if (!ERC20Token(token).transferFrom(owner, this, amount)) revert();
    SellToken(owner, amount, balanceOf(owner));
  }

  function totalSupply() constant returns(uint) {
    return ERC20Token(token).totalSupply();
  }

  function balanceOf(address owner) constant returns(uint256) {
    return ERC20Token(token).balanceOf(owner);
  }

  function kill() public onlyOwner {
    selfdestruct(owner);
  }

}