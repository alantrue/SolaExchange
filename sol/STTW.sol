pragma solidity ^0.4.15;

import "./MiniMeToken.sol";

contract STTW is MiniMeToken {
  function STTW(address _tokenFactory) MiniMeToken(
      _tokenFactory,
      0x0,
      0,
      "Solar Token Taiwan",
      18,
      "STTW",
      true
    ){}
}
