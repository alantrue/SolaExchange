if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var provider = new ethers.providers.JsonRpcProvider('https://kovan.infura.io', true, 42);
var adminPrivateKey = "0x70394e1a35f52536a07c3dc8dbc3b8f9219511130d8bfaa48518dc497ab00bd8";
var adminWallet = new ethers.Wallet(adminPrivateKey, provider);
var userWallet, userRefreshTimer;


var sttw = new web3.eth.Contract(sttwABI, sttwAddress);
var sntw1 = new web3.eth.Contract(sntwABI, sntwAddress1);
var sntw2 = new web3.eth.Contract(sntwABI, sntwAddress2);
var sntw3 = new web3.eth.Contract(sntwABI, sntwAddress3);
var solaExchange = new web3.eth.Contract(solaExchangeABI, solaExchangeAddress);

$(function() {

    login("admin", "1234");

    bindAll();

    /*
    for (var i = 0; i < 20; ++i) {
        $(".historyTable").append("<tr><td>BID</td><td>Completed</td><td>2017/11/11 11:11:11</td><td>SNTW</td><td>123.99</td><td>12,399</td></tr>");
    }
    */

    $("#menuDashboard").trigger("click");
});

function login(username, password) {
    var privateKey = getPrivateKey(username, password);
    if (privateKey) {
        loadUserWallet(username, privateKey);
        return true;
    }
    return false;
}

function getPrivateKey(username, password) {
    var privateKey;
    $.ajax({
        url: "/signIn",
        type: "post",
        dataType: "html",
        data: {
            username: username,
            password: password
        },
        async: false,
        success: function(r) {
            if (r == "false") {
                alert("no this user or password is wrong");
            } else {
                privateKey = r;
            }
        },
    });

    return privateKey;
}

function loadUserWallet(username, privateKey) {
    userWallet = new ethers.Wallet(privateKey, provider);
    console.log(userWallet);
    $("#username").text(sprintf("Hi, %s", username));
    //$("#userAccount").text(sprintf("Account: %s", userWallet.address));

    if (userRefreshTimer) {
        clearInterval(userRefreshTimer);
    }
    userRefreshTimer = setInterval(function() {
        /*
        userWallet.getBalance().then(function(balance) {
            console.log(sprintf("ETH in wallet: %s", ethers.utils.formatEther(balance)));
        });

        sttw.methods.balanceOf(userWallet.address).call().then(function(r) {
            console.log(sprintf("STTW in wallet: %s", web3.utils.fromWei(r, 'ether')));
        });

        sntw1.methods.balanceOf(userWallet.address).call().then(function(r) {
            console.log(sprintf("SNTW1 in wallet: %s", web3.utils.fromWei(r, 'ether')));
        });

        sntw2.methods.balanceOf(userWallet.address).call().then(function(r) {
            console.log(sprintf("SNTW2 in wallet: %s", web3.utils.fromWei(r, 'ether')));
        });

        sntw3.methods.balanceOf(userWallet.address).call().then(function(r) {
            console.log(sprintf("SNTW3 in wallet: %s", web3.utils.fromWei(r, 'ether')));
        });
        */

        solaExchange.methods.balanceOf(sttwAddress, userWallet.address).call().then(function(r) {
            $("#balanceSttw").text(web3.utils.fromWei(r, 'ether'));
        });

        solaExchange.methods.balanceOf(sntwAddress1, userWallet.address).call().then(function(r) {
            $("#balanceSntw1").text(web3.utils.fromWei(r, 'ether'));
        });

        solaExchange.methods.balanceOf(sntwAddress2, userWallet.address).call().then(function(r) {
            $("#balanceSntw2").text(web3.utils.fromWei(r, 'ether'));
        });

        solaExchange.methods.balanceOf(sntwAddress3, userWallet.address).call().then(function(r) {
            $("#balanceSntw3").text(web3.utils.fromWei(r, 'ether'));
        });

        $("#balanceTwd").text(calTotalBalance());

    	refreshHistory(1510647400);
    }, 3000);

    $("#loginMask").hide();
}

function calTotalBalance() {
    var sttwValue = parseFloat($("#balanceSttw").text());
    var sntwValue1 = parseFloat($("#balanceSntw1").text());
    var sntwValue2 = parseFloat($("#balanceSntw2").text());
    var sntwValue3 = parseFloat($("#balanceSntw3").text());

    //TODO: /乘上各自匯率
    return sttwValue + 10 * (sntwValue1 + sntwValue2 + sntwValue3);
}

function refreshHistory(start) {
    $(".historyTable tr:gt(0)").remove();
    $.ajax({
        url: "/getTrade",
        type: "post",
        dataType: "html",
        data: {
            timestamp: start
        },
        success: function(r) {
            console.log(r);
            var trades = JSON.parse(r);
            console.log(trades);

            var data = [];

            for (var i = 0; i < trades.length; i++) {
                var t = trades[i];
                if (t.get == userWallet.address || t.give == userWallet.address) {
                    var order, rate, sntw, sntwAddress, sttw;
                    if (sttwAddress == t.tokenGive) {
                        order = (t.get == userWallet.address) ? "BID" : "ASK";
                        sntwAddress = t.tokenGet;
                        sntw = web3.utils.fromWei(t.amountGet, 'ether');
                        sttw = web3.utils.fromWei(t.amountGive, 'ether');
                        rate = sttw / sntw;
                    } else {
                        order = (t.give == userWallet.address) ? "BID" : "ASK";
                        sntwAddress = t.tokenGive;
                        sntw = web3.utils.fromWei(t.amountGive, 'ether');
                        sttw = web3.utils.fromWei(t.amountGet, 'ether');
                        rate = sttw / sntw;
                    }

                    var date = new Date();
                    date.setTime(t.timestamp * 1000);
                    var dateStr = timeForamt(date);

                    $(".historyTable tr:last").after(sprintf("<tr><td>%s</td><td>Completed</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>", order, dateStr, getTokenName(sntwAddress), sntw, sttw));
                }
            }
        }
    });
}

function getTokenName(address) {
    switch (address) {
        case sttwAddress:
            return "STTW";
        case sntwAddress1:
            return "SNTW1";
        case sntwAddress2:
            return "SNTW2";
        case sntwAddress3:
            return "SNTW3";
        default:
            alert("unknown token type");
            return "unknown";
    }
}

function toLocalTimestamp(timestamp) {
    var d = new Date();
    return timestamp;
}

function timeForamt(date) {
    function pad2(n) { // always returns a string
        return (n < 10 ? '0' : '') + n;
    }

    return sprintf("%s/%s/%s %s:%s:%s",
        date.getFullYear(),
        pad2(date.getMonth() + 1),
        pad2(date.getDate()),
        pad2(date.getHours()),
        pad2(date.getMinutes()),
        pad2(date.getSeconds()));
}

function bindAll() {
    $("#menuDashboard").click(function() {
        $(".mainBody").children().hide();
        $("#dashboard").show();
    });

    $("#menuWallet").click(function() {
        $(".mainBody").children().hide();
        $("#wallet").show();
    });

    $("#menuTrade").click(function() {
        $(".mainBody").children().hide();
        $("#trade").show();
    });

    $("#menuLogout").click(function() {

    });
}