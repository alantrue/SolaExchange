pragma solidity ^0.4.15;

import "./MiniMeToken.sol";

contract SNTW is MiniMeToken {
  function SNTW(address _tokenFactory) MiniMeToken(
      _tokenFactory,
      0x0,
      0,
      "Solar Notw Taiwan",
      18,
      "SNTW",
      true
    ){}
}
