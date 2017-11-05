pragma solidity ^0.4.15;

import "./MiniMeToken.sol";

contract SNTW2 is MiniMeToken {
  function SNTW2(address _tokenFactory) MiniMeToken(
      _tokenFactory,
      0x0,
      0,
      "Solar Notw Taiwan 2",
      18,
      "SNTW2",
      true
    ){}
}
