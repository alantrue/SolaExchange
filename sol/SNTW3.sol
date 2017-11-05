pragma solidity ^0.4.15;

import "./MiniMeToken.sol";

contract SNTW3 is MiniMeToken {
  function SNTW3(address _tokenFactory) MiniMeToken(
      _tokenFactory,
      0x0,
      0,
      "Solar Notw Taiwan 3",
      18,
      "SNTW3",
      true
    ){}
}
