pragma solidity ^0.4.15;

import "./Ownable.sol";
import "./SafeMath.sol";

interface MiniMeToken {
  function generateTokens(address _owner, uint _amount) returns (bool);
  function destroyTokens(address _owner, uint _amount) returns (bool);
  function enableTransfers(bool _transfersEnabled);
  function claimTokens(address _token);
  function changeController(address _newController);
}

contract TokenController is Ownable {
  using SafeMath for int;

  mapping(address => bool) public managers;

  event GenerateToken(address token, address owner, uint amount);
  event DestroyToken(address token, address owner, uint amount);

  modifier nonZeroAddress(address x) {
    require(x != 0x0);
    _;
  }

  modifier onlyManager(address x) {
    require(managers[x]);
    _;
  }

  modifier nonZero(uint x) {
    require(x > 0);
    _;
  }

  function TokenController() {

  }

  function addManager(address manager) public onlyOwner nonZeroAddress(manager) {
    require(!managers[manager]);
    managers[manager] = true;
  }

  function removeManager(address manager) public onlyOwner nonZeroAddress(manager) {
    require(managers[manager]);
    managers[manager] = false;
  }

  function generateTokens(address token, address owner, uint amount) 
    public 
    onlyManager(msg.sender)
    nonZeroAddress(token)
    nonZeroAddress(owner)
    nonZero(amount)
  {
    if(!MiniMeToken(token).generateTokens(owner, amount)) revert();
    GenerateToken(token, owner, amount);
  }

  function destroyTokens(address token, address owner, uint amount) 
    public 
    onlyManager(msg.sender)
    nonZeroAddress(token)
    nonZeroAddress(owner)
    nonZero(amount)
  {
    if(!MiniMeToken(token).destroyTokens(owner, amount)) revert();
    DestroyToken(token, owner, amount);
  }

  function enableTransfers(address token, bool transfersEnabled) 
    public onlyManager(msg.sender) nonZeroAddress(token) 
  {
    MiniMeToken(token).enableTransfers(transfersEnabled);
  }

  function changeController(address token, address newController) 
    public
    onlyOwner
    nonZeroAddress(token)
    nonZeroAddress(newController)
  {
    MiniMeToken(token).changeController(newController);
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

  function () {
    revert();
  }
}