pragma solidity ^0.4.15;

import "./Ownable.sol";

contract ContractManager is Ownable {
  mapping(string => address) contracts;

  event AddContract(string indexed name, address indexed contractAddress);
  event RemoveContract(string indexed name);
  event UpdateContract(string indexed name, address indexed contractAddress);

  function addContract(string _name, address _contractAddress) public onlyOwner {
    require(contracts[_name] == 0);
    require(_contractAddress != 0x0);
    contracts[_name] = _contractAddress;
    AddContract(_name, _contractAddress);
	}

	function removeContract(string _name) public onlyOwner {
		require(contracts[_name] != 0);
		contracts[_name] = 0;
    RemoveContract(_name);
	}

	function updateContract(string _name, address _contractAddress) public onlyOwner {
		require(contracts[_name] != 0);
    require(_contractAddress != 0x0);
		contracts[_name] = _contractAddress;
    UpdateContract(_name, _contractAddress);
	}

	function getContract(string _name) public constant returns (address _contractAddress) {
		require(contracts[_name] != 0);
		_contractAddress = contracts[_name];
	}
}

