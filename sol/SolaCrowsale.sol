pragma solidity ^0.4.15;

import "./SafeMath.sol";
import "./SNTW.sol";
import "./Ownable.sol";

contract SolaCrowsale is TokenController, Ownable {
  using SafeMath for uint256;

  // The token being sold
  SNTW public token;

  // start and end block where investments are allowed (both inclusive)
  uint256 public startBlock; 
  uint256 public endBlock;

  // address where funds are collected
  address public solaMultisig;
  
  // amount of raised money in wei
  uint256 public weiRaised = 0;

  // has the sale been finalized?
  bool public saleFinalized = false;
  address public profitSharing;

  // minimum investment
  uint256 constant public minInvestment = 0.5 ether;

  // cap
  uint256 public cap = 10000 ether;

  event NewPresaleAllocation(address indexed holder, uint256 antAmount);
  event NewBuyer(address indexed holder, uint256 sntwAmount, uint256 etherAmount);

  function SolaCrowsale (
    uint256 _startBlock,
    uint256 _endBlock,
    address _solaMultisig,
    address _tokenAddress,
    address _profitSharing
  ) 
    non_zero_address(_solaMultisig) non_zero_address(_tokenAddress) non_zero_address(_profitSharing) 
  {
    require(_startBlock >= getBlockNumber());
    require(_endBlock >= _startBlock);

    startBlock = _startBlock;
    endBlock = _endBlock;
    solaMultisig = _solaMultisig;
    token = SNTW(_tokenAddress);
    profitSharing = _profitSharing;
  }

  // fallback function can be used to buy tokens
  function () payable {
    require(msg.value >= minInvestment);
    doPayment(msg.sender);
  }

/////////////////
// Controller interface
/////////////////

/// @notice `proxyPayment()` allows the caller to send ether to the Token directly and
/// have the tokens created in an address of their choosing
/// @param _owner The address that will hold the newly created tokens
  function proxyPayment(address _owner) payable public returns (bool) {
    // not allow purchase from token contract directly during the sale
    revert();
    return false;
  }

/// @notice Notifies the controller about a transfer, for this sale all
///  transfers are allowed by default and no extra notifications are needed
/// @param _from The origin of the transfer
/// @param _to The destination of the transfer
/// @param _amount The amount of the transfer
/// @return False if the controller does not authorize the transfer
  function onTransfer(address _from, address _to, uint _amount) public returns (bool) {
    // Until the sale is finalized, only allows transfers originated by the sale contract.
    // When finalizeSale is called, this function will stop being called and will always be true.
    return _from == address(this);
  }

/// @notice Notifies the controller about an approval, for this sale all
///  approvals are allowed by default and no extra notifications are needed
/// @param _owner The address that calls `approve()`
/// @param _spender The spender in the `approve()` call
/// @param _amount The amount in the `approve()` call
/// @return False if the controller does not authorize the approval
  function onApprove(address _owner, address _spender, uint _amount) public returns (bool) {
    // No approve/transferFrom during the sale
    return false;
  }

/// @dev `doPayment()` is an internal function that sends the ether that this
///  contract receives to the solaMultisig and creates tokens in the address of the
  function doPayment(address _beneficiary) internal 
    non_zero_address(_beneficiary)
    only_during_sale_period
  {
    require(weiRaised + msg.value <= cap);
    
    // calculate how many tokens bought
    uint256 boughtTokens = msg.value.mul(getPrice(getBlockNumber()));

    solaMultisig.transfer(msg.value);

    if (!token.generateTokens(_beneficiary, boughtTokens)) {
      revert();
    }

    weiRaised = weiRaised.add(boughtTokens);

    NewBuyer(_beneficiary, boughtTokens, msg.value);
  }

  // @notice Finalizes sale generating the tokens for Aragon Dev.
  // @dev Transfers the token controller power to the ANPlaceholder.
  function finalizeSale()
           only_after_sale
           onlyOwner 
  {
    uint256 solaToken = token.totalSupply() / 9;
    if (!token.generateTokens(solaMultisig, solaToken)) {
      revert();
    }
    token.changeController(profitSharing); // Sale loses token controller power in favor of solaOwner
    saleFinalized = true;  // Set stop is true which will enable network deployment
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal constant returns (bool) {
    uint256 current = getBlockNumber();
    bool withinPeriod = current >= startBlock && current <= endBlock;
    bool nonZeroPurchase = msg.value != 0;
    return withinPeriod && nonZeroPurchase;
  }
  
  function getPrice(uint256 _blockNumber) constant returns (uint256) {
    if (_blockNumber < startBlock) {
      return 0;
    } else if (_blockNumber < (startBlock.add(getWeeks(1)))) {
      return 1000;
    } else if (_blockNumber < (startBlock.add(getWeeks(2)))) {
      return 943;
    } else if (_blockNumber < (startBlock.add(getWeeks(3)))) {
      return 900;
    } else if (_blockNumber < (startBlock.add(getWeeks(4)))) {
      return 854;
    } else {
      return 0;
    }
  }

  function getWeeks(uint256 _num) internal constant returns (uint256) {
    uint256 _averageBlocktime = 30;
    uint256 oneWeek = 60 * 60 * 24 * 7;
    return oneWeek.mul(_num).div(_averageBlocktime);
  }


  function getBlockNumber() internal constant returns (uint) {
    return block.number;
  }

  modifier only_during_sale_period {
    require(getBlockNumber() >= startBlock);
    require(getBlockNumber() <= endBlock);
    _;
  }

  modifier non_zero_address(address x) {
    require(x != 0x0);
    _;
  }

  modifier only_after_sale {
    require(getBlockNumber() > endBlock);
    _;
  }
}