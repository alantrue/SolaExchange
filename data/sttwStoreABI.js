var sttwStoreAddress = "0x4c02AdA41679B8382bcc9C06BbFa727CF464E909";
var sttwStoreABI = [{
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
        "inputs": [],
        "name": "kill",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "newRetailer",
            "type": "address"
        }],
        "name": "changeRetailer",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "retailer",
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
                "name": "owner",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "buyToken",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "owner",
            "type": "address"
        }],
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
                "name": "owner",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "sellToken",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "tc",
        "outputs": [{
            "name": "",
            "type": "address"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "token",
        "outputs": [{
            "name": "",
            "type": "address"
        }],
        "payable": false,
        "type": "function"
    },
    {
        "inputs": [{
                "name": "_tokenController",
                "type": "address"
            },
            {
                "name": "_token",
                "type": "address"
            },
            {
                "name": "_retailer",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": false,
                "name": "owner",
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
        "name": "BuyToken",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": false,
                "name": "owner",
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
        "name": "SellToken",
        "type": "event"
    }
];