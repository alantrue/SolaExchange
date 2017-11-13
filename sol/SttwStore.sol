pragma solidity ^0.4.15;

import "./Ownable.sol";
import "./SafeMath.sol";

interface TokenController {
  function generateTokens(address token, address owner, uint amount);
  function destroyTokens(address token, address owner, uint amount);
}

interface EthUsdPrice {
  function getPrice(uint decimal) returns(uint);
}

interface UsdTwdPrice {
  function getPrice(uint decimal) returns(uint);
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
  using SafeMath for uint;

  TokenController public tc;
  address public token;
  address public retailer;

  EthUsdPrice public eth_usd;
  uint public eth_usd_decimal;
  UsdTwdPrice public usd_twd;
  uint public usd_twd_decimal;

  event BuyToken(address owner, uint amount, uint balance);
  event SellToken(address owner, uint amount, uint balance);

  modifier onlyRetailer(address x) {
    require(x == retailer);
    _;
  }

  function SttwStore(address _tokenController, address _token, address _retailer, address _ethUsd, address _usdTwd) {
    require(_tokenController != 0x0);
    require(_token != 0x0);
    require(_ethUsd != 0x0);
    require(_usdTwd != 0x0);
    tc = TokenController(_tokenController);
    token = _token;
    retailer = _retailer;
    eth_usd = EthUsdPrice(_ethUsd);
    eth_usd_decimal = 3;
    usd_twd = UsdTwdPrice(_usdTwd);
    usd_twd_decimal = 3;
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

  function buyTokenUsingEth() public payable {
    require(msg.value > 0);
    uint ethUsdPrice = eth_usd.getPrice(eth_usd_decimal);
    uint usdTwdPrice = usd_twd.getPrice(usd_twd_decimal);
    
    // price/eth = ethUsdPrice * usdTwdPrice
    // amount = msg.value * price / 10**decimal / 10**decimal
    uint amount = msg.value.mul(ethUsdPrice).mul(usdTwdPrice).div(10**eth_usd_decimal).div(10**usd_twd_decimal);
    assert(amount > 0);
    uint256 balance = ERC20Token(token).balanceOf(this);
    if (balance >= amount) {
      if (!ERC20Token(token).transfer(msg.sender, amount)) revert();
    } else {
      tc.generateTokens(token, msg.sender, amount);
    }

    BuyToken(msg.sender, amount, balanceOf(msg.sender));
  }

  function sellTokenForEth(uint amount) public {
    uint ethUsdPrice = eth_usd.getPrice(eth_usd_decimal);
    uint usdTwdPrice = usd_twd.getPrice(usd_twd_decimal);
    // uint price = ethUsdPrice * usdTwdPrice / 10**decimal
    uint price = ethUsdPrice.mul(usdTwdPrice);
    uint value = amount.div(price).mul(10 ** eth_usd_decimal).mul(10 ** usd_twd_decimal);
    assert(this.balance > value);

    //remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.
    if (!ERC20Token(token).transferFrom(msg.sender, this, amount)) revert();
    msg.sender.transfer(value);
    SellToken(msg.sender, amount, balanceOf(msg.sender));
  }

  function calculateBuyTokenUsingEth(uint weiAmount) public constant returns(uint) {
    uint ethUsdPrice = eth_usd.getPrice(eth_usd_decimal);
    uint usdTwdPrice = usd_twd.getPrice(usd_twd_decimal);
    
    // price/eth = ethUsdPrice * usdTwdPrice
    // amount = msg.value * price / 10**decimal / 10**decimal
    return weiAmount.mul(ethUsdPrice).mul(usdTwdPrice).div(10**eth_usd_decimal).div(10**usd_twd_decimal);
  }

  function calculateSellTokenForEth(uint tokenAmount) public constant returns(uint) {
    uint ethUsdPrice = eth_usd.getPrice(eth_usd_decimal);
    uint usdTwdPrice = usd_twd.getPrice(usd_twd_decimal);
    // uint price = ethUsdPrice * usdTwdPrice / 10**decimal
    uint price = ethUsdPrice.mul(usdTwdPrice);
    return tokenAmount.div(price).mul(10 ** eth_usd_decimal).mul(10 ** usd_twd_decimal);
  }

  function updateEthUsdPriceAddress(address ethUsd) public onlyOwner {
    require(ethUsd != 0x0);
    eth_usd = EthUsdPrice(ethUsd);
  }

  function updateEthUsdDecimal(uint decimal) public onlyOwner {
    eth_usd_decimal = decimal;
  }

  function updateUsdTwdPriceAddress(address usdTwd) public onlyOwner {
    require(usdTwd != 0x0);
    usd_twd = UsdTwdPrice(usdTwd);
  }

  function updateUsdTwdDecimal(uint decimal) public onlyOwner {
    usd_twd_decimal = decimal;
  }

  function getEthUsdPrice(uint decimal) public constant returns(uint) {
    return eth_usd.getPrice(decimal);
  }

  function getUsdTwdPrice(uint decimal) public constant returns(uint) {
    return usd_twd.getPrice(decimal);
  }

  function totalSupply() constant returns(uint) {
    return ERC20Token(token).totalSupply();
  }

  function balanceOf(address owner) constant returns(uint256) {
    return ERC20Token(token).balanceOf(owner);
  }

  // todo: remove this
  function kill() public onlyOwner {
    selfdestruct(owner);
  }

}