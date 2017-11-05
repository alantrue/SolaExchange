var sntwAddress1 = "0x032Ba156F7C33a9673075A42A82e798F84165ce1";
var sntwAddress2 = "0xa562E45EBD26c46Ca8b81242a57910C8B086E4D2";
var sntwAddress3 = "0x7eCd0De9C6caa29Bd5F66F54385ecda12c4ddC63";
var sntwABI = [{
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{
            "name": "",
            "type": "string"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [{
            "name": "success",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "creationBlock",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [{
            "name": "success",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{
            "name": "",
            "type": "uint8"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "_newController",
            "type": "address"
        }],
        "name": "changeController",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_blockNumber",
                "type": "uint256"
            }
        ],
        "name": "balanceOfAt",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "version",
        "outputs": [{
            "name": "",
            "type": "string"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "_cloneTokenName",
                "type": "string"
            },
            {
                "name": "_cloneDecimalUnits",
                "type": "uint8"
            },
            {
                "name": "_cloneTokenSymbol",
                "type": "string"
            },
            {
                "name": "_snapshotBlock",
                "type": "uint256"
            },
            {
                "name": "_transfersEnabled",
                "type": "bool"
            }
        ],
        "name": "createCloneToken",
        "outputs": [{
            "name": "",
            "type": "address"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "_owner",
            "type": "address"
        }],
        "name": "balanceOf",
        "outputs": [{
            "name": "balance",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "parentToken",
        "outputs": [{
            "name": "",
            "type": "address"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "generateTokens",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{
            "name": "",
            "type": "string"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "_blockNumber",
            "type": "uint256"
        }],
        "name": "totalSupplyAt",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [{
            "name": "success",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "transfersEnabled",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "parentSnapShotBlock",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            },
            {
                "name": "_extraData",
                "type": "bytes"
            }
        ],
        "name": "approveAndCall",
        "outputs": [{
            "name": "success",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "destroyTokens",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [{
            "name": "remaining",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "_token",
            "type": "address"
        }],
        "name": "claimTokens",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "tokenFactory",
        "outputs": [{
            "name": "",
            "type": "address"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "_transfersEnabled",
            "type": "bool"
        }],
        "name": "enableTransfers",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "controller",
        "outputs": [{
            "name": "",
            "type": "address"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "inputs": [{
            "name": "_tokenFactory",
            "type": "address"
        }],
        "payable": false,
        "type": "constructor"
    },
    {
        "payable": true,
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "_token",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_controller",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "ClaimedTokens",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "_cloneToken",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_snapshotBlock",
                "type": "uint256"
            }
        ],
        "name": "NewCloneToken",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    }
];