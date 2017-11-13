pragma solidity ^0.4.11;

import "./Ownable.sol";
import "./oraclizeAPI.sol";

contract EthUsdPrice is Ownable, usingOraclize {

  string public ETHUSD;
  uint public frequency; // seconds
  
  event updatedPrice(string price);
  event newOraclizeQuery(string description);

  function EthUsdPrice() payable {
    frequency = 60;
    updatePrice();
  }

  function __callback(bytes32 myid, string result) {
    require(msg.sender == oraclize_cbAddress());
    ETHUSD = result; // vulnerability here
    updatedPrice(result);
    updatePrice();
  }

  function updatePrice() payable {
    if (oraclize_getPrice("URL") > this.balance) {
      newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
    } else {
      newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
      oraclize_query(frequency, "URL", "json(http://coincap.io/page/ETH).price_usd");
    }
  }

  function updateFrequency(uint _frequency) public onlyOwner {
    require(_frequency > 0);
    frequency = _frequency;
  }

  function getPrice(uint decimal) public constant returns(uint) {
    return parseInt(ETHUSD, decimal);
  }

  // todo: remove this
  function kill() public onlyOwner {
    selfdestruct(owner);
  }
}