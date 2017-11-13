var solaExchangeAddress = '0xe566dd550b19a3508A81c8Db58ceb1d8080fAeE2';
var solaExchangeABI = [{
        "constant": false,
        "inputs": [{
                "name": "tokenGet",
                "type": "address"
            },
            {
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "name": "tokenGive",
                "type": "address"
            },
            {
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "name": "expires",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            },
            {
                "name": "user",
                "type": "address"
            },
            {
                "name": "v",
                "type": "uint8"
            },
            {
                "name": "r",
                "type": "bytes32"
            },
            {
                "name": "s",
                "type": "bytes32"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "trade",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "tokenGet",
                "type": "address"
            },
            {
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "name": "tokenGive",
                "type": "address"
            },
            {
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "name": "expires",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            }
        ],
        "name": "order",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "basicToken",
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
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "orderFills",
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
                "name": "tokenGet",
                "type": "address"
            },
            {
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "name": "tokenGive",
                "type": "address"
            },
            {
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "name": "expires",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            },
            {
                "name": "v",
                "type": "uint8"
            },
            {
                "name": "r",
                "type": "bytes32"
            },
            {
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "cancelOrder",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "amount",
            "type": "uint256"
        }],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "token",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "depositToken",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "kill",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
                "name": "tokenGet",
                "type": "address"
            },
            {
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "name": "tokenGive",
                "type": "address"
            },
            {
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "name": "expires",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            },
            {
                "name": "user",
                "type": "address"
            },
            {
                "name": "v",
                "type": "uint8"
            },
            {
                "name": "r",
                "type": "bytes32"
            },
            {
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "amountFilled",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "tokens",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "token",
            "type": "address"
        }],
        "name": "tokenAllowed",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "token",
            "type": "address"
        }],
        "name": "removeToken",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "feeAccount",
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
                "name": "tokenGet",
                "type": "address"
            },
            {
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "name": "tokenGive",
                "type": "address"
            },
            {
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "name": "expires",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            },
            {
                "name": "user",
                "type": "address"
            },
            {
                "name": "v",
                "type": "uint8"
            },
            {
                "name": "r",
                "type": "bytes32"
            },
            {
                "name": "s",
                "type": "bytes32"
            },
            {
                "name": "amount",
                "type": "uint256"
            },
            {
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "testTrade",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "_newFeeAccount",
            "type": "address"
        }],
        "name": "changeFeeAccount",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "_newFeeTake",
            "type": "uint256"
        }],
        "name": "changeFeeTake",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
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
                "name": "token",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawToken",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "amount",
                "type": "uint256"
            },
            {
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "transfer",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "orders",
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
        "name": "feeTake",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "payable": true,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "token",
            "type": "address"
        }],
        "name": "addToken",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "",
            "type": "address"
        }],
        "name": "tokensAllowed",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "newOwner",
            "type": "address"
        }],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "token",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            },
            {
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "transferToken",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
                "name": "token",
                "type": "address"
            },
            {
                "name": "user",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
                "name": "tokenGet",
                "type": "address"
            },
            {
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "name": "tokenGive",
                "type": "address"
            },
            {
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "name": "expires",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            },
            {
                "name": "user",
                "type": "address"
            },
            {
                "name": "v",
                "type": "uint8"
            },
            {
                "name": "r",
                "type": "bytes32"
            },
            {
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "availableVolume",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "inputs": [{
                "name": "_basicToken",
                "type": "address"
            },
            {
                "name": "_feeAccount",
                "type": "address"
            },
            {
                "name": "_feeTake",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "constructor"
    },
    {
        "payable": false,
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "tokenGet",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "tokenGive",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "expires",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "nonce",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "user",
                "type": "address"
            }
        ],
        "name": "Order",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "tokenGet",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "tokenGive",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "expires",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "nonce",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "v",
                "type": "uint8"
            },
            {
                "indexed": false,
                "name": "r",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "Cancel",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "tokenGet",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amountGet",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "tokenGive",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amountGive",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "get",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "give",
                "type": "address"
            }
        ],
        "name": "Trade",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "token",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "balance",
                "type": "uint256"
            }
        ],
        "name": "Deposit",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "token",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "balance",
                "type": "uint256"
            }
        ],
        "name": "Withdraw",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "balance",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
];