pragma solidity ^0.4.15;

import "./SNTW.sol";
import "./STTW.sol";
import "./SafeMath.sol";
import "./Ownable.sol";

contract ProfitSharing is TokenController, Ownable {
  using SafeMath for uint;

  // The token used to calculate dividend amount 
  SNTW public token;
  // The token used to be dividend
  STTW public rewardToken;

  struct Dividend {
    uint256 blockNumber;
    uint256 timestamp;
    uint256 amount;
    uint256 claimedAmount;
    uint256 totalSupply;
    mapping(address => bool) claimed;
  }

  Dividend[] public dividends;

  event DividendDeposited(address indexed _depositor, uint256 _blockNumber, uint256 _amount, uint256 _totalSupply, uint256 _dividendIndex);
  event DividendClaimed(address indexed _claimer, uint256 _dividendIndex, uint256 _claim);

  function ProfitSharing(address _SNTW, address _STTW) 
    nonZeroAddress(_SNTW) 
    nonZeroAddress(_STTW)
  {
    token = SNTW(_SNTW);
    rewardToken = STTW(_STTW);
  }

  function depositDividend(uint256 _amount) onlyOwner {
    uint256 currentSupply = token.totalSupplyAt(getBlockNumber());
    uint256 dividendIndex = dividends.length;
    uint256 blockNumber = getBlockNumber().sub(1);
    dividends.push(
      Dividend(
        blockNumber,
        getNow(),
        _amount,
        0,
        currentSupply
      )
    );

    DividendDeposited(msg.sender, blockNumber, _amount, currentSupply, dividendIndex);
  }

  function claimDividend(uint256 _dividendIndex) public validDividendIndex(_dividendIndex) {
    Dividend storage dividend = dividends[_dividendIndex];
    require(dividend.claimed[msg.sender] == false);

    uint256 balance = token.balanceOfAt(msg.sender, dividend.blockNumber);
    uint256 amount = balance.mul(dividend.amount).div(dividend.totalSupply);
    dividend.claimed[msg.sender] = true;
    dividend.claimedAmount = dividend.claimedAmount.add(amount);
    if (amount > 0) {
      assert(rewardToken.generateTokens(msg.sender, amount));
      DividendClaimed(msg.sender, _dividendIndex, amount);
    }
  }

  function getBlockNumber() internal constant returns(uint) {
    return block.number;
  }

  function getNow() internal constant returns(uint) {
    return now;
  }

/////////////////
// Controller interface
/////////////////
  function proxyPayment(address _owner) payable public returns (bool) {
    revert();
    return false;
  }

  function onTransfer(address _from, address _to, uint _amount) public returns (bool) {
    return true;
  }

  function onApprove(address _owner, address _spender, uint _amount) public returns (bool) {
    return true;
  }

  function changeSNTWController(address _controller) public onlyOwner nonZeroAddress(_controller) {
    token.changeController(_controller);
    selfdestruct(_controller);
  }

  function changeSTTWController(address _controller) public onlyOwner nonZeroAddress(_controller) {
    rewardToken.changeController(_controller);
    selfdestruct(_controller);
  }

  modifier nonZeroAddress(address x) {
    require(x != 0x0);
    _;
  }

  modifier validDividendIndex(uint256 _dividendIndex) {
    require(_dividendIndex < dividends.length);
    _;
  }
}