if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var provider = new ethers.providers.JsonRpcProvider('https://kovan.infura.io', true, 42);
var adminPrivateKey = "0x70394e1a35f52536a07c3dc8dbc3b8f9219511130d8bfaa48518dc497ab00bd8";
var adminWallet = new ethers.Wallet(adminPrivateKey, provider);
var userWallet, userRefreshTimer, userId;

var sttw = new web3.eth.Contract(sttwABI, sttwAddress);
var sntw1 = new web3.eth.Contract(sntwABI, sntwAddress1);
var sntw2 = new web3.eth.Contract(sntwABI, sntwAddress2);
var sntw3 = new web3.eth.Contract(sntwABI, sntwAddress3);
var solaExchange = new web3.eth.Contract(solaExchangeABI, solaExchangeAddress);

var prepareBuy;
var prepareSell;
var orderBook = {};
var eventList = {};
var currentBlock;
var dataInitialized = false;

$(function() {
    connectToServer();

    login("admin", "1234");

    bindAll();

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
        web3.eth.getBlockNumber().then(function(r) {
            currentBlock = r;
            if (!dataInitialized) {
                dataInitialized = true;
                refreshHistory(1510647400);
                setInterval(function() {
                    refreshHistory(1510647400);
                }, 30000);
            } else {
                refreshOrder();
            }
        });
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
            $("#balanceSttw").text(formatValue(web3.utils.fromWei(r, 'ether')));
        });

        solaExchange.methods.balanceOf(sntwAddress1, userWallet.address).call().then(function(r) {
            $("#balanceSntw1").text(formatValue(web3.utils.fromWei(r, 'ether')));
        });

        solaExchange.methods.balanceOf(sntwAddress2, userWallet.address).call().then(function(r) {
            $("#balanceSntw2").text(formatValue(web3.utils.fromWei(r, 'ether')));
        });

        solaExchange.methods.balanceOf(sntwAddress3, userWallet.address).call().then(function(r) {
            $("#balanceSntw3").text(formatValue(web3.utils.fromWei(r, 'ether')));
        });

        var twd = formatValue(calTotalBalance());
        $("#balanceTwd").html(isNaN(twd) ? "<div class='loader'></div>" : twd);

    }, 3000);

    $("#loginMask").hide();
}

function calTotalBalance() {
    var sttwValue = parseFloat($("#balanceSttw").text());
    var sntwValue1 = parseFloat($("#balanceSntw1").text());
    var sntwValue2 = parseFloat($("#balanceSntw2").text());
    var sntwValue3 = parseFloat($("#balanceSntw3").text());

    var lastSntwAsk1 = parseFloat($("#sntwAsk1").text());
    var lastSntwAsk2 = parseFloat($("#sntwAsk2").text());
    var lastSntwAsk3 = parseFloat($("#sntwAsk3").text());

    return sttwValue + sntwValue1 * lastSntwAsk1 + sntwValue2 * lastSntwAsk2 + sntwValue3 * lastSntwAsk3;
}

function refreshHistory(start) {
    $(".historyTable tr:gt(0)").remove();
    $("#historyLoader").show();
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

            $("#historyLoader").hide();
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

                    $(".historyTable tr:last").after(sprintf("<tr><td>%s</td><td>Completed</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>", order, dateStr, getTokenName(sntwAddress), sntw, formatValue(sttw)));
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

function buy(wallet, amount) {
    var contract = new ethers.Contract(sttwStoreAddress, sttwStoreABI, adminWallet);
    var txid;
    contract.buyToken(wallet.address, ethers.utils.parseEther(amount)).then((transaction) => {
        console.log("buy");
        console.log(transaction);
        txid = transaction.hash;
        return adminWallet.provider.waitForTransaction(txid)
    }).then((transaction) => {
        console.log('Transaction Minded: ' + transaction.hash);
        console.log(transaction);
        return adminWallet.provider.getTransaction(txid);
    }).then((transaction) => {
        console.log(transaction);
        return contract.balanceOf(wallet.address);
    }).then((result) => {
        console.log(result);
        approve(wallet, amount);
    });
}

function approve(wallet, amount) {
    var contract = new ethers.Contract(sttwAddress, sttwABI, wallet);
    var txid;
    contract.approve(solaExchangeAddress, ethers.utils.parseEther(amount)).then((transaction) => {
        console.log("approve");
        console.log(transaction);
        txid = transaction.hash;
        return wallet.provider.waitForTransaction(txid)
    }).then((transaction) => {
        console.log('Transaction Minded: ' + transaction.hash);
        console.log(transaction);
        return wallet.provider.getTransaction(txid);
    }).then((transaction) => {
        console.log(transaction);
        return contract.balanceOf(wallet.address);
    }).then((result) => {
        console.log(result);
        deposit(wallet, amount);
    });
}

function deposit(wallet, amount) {
    var contract = new ethers.Contract(solaExchangeAddress, solaExchangeABI, wallet);
    var txid;
    contract.depositToken(sttwAddress, ethers.utils.parseEther(amount)).then((transaction) => {
        console.log("deposit");
        console.log(transaction);
        txid = transaction.hash;
        return wallet.provider.waitForTransaction(txid)
    }).then((transaction) => {
        console.log('Transaction Minded: ' + transaction.hash);
        console.log(transaction);
        return wallet.provider.getTransaction(txid);
    }).then((transaction) => {
        console.log(transaction);
        return contract.balanceOf(sttwAddress, wallet.address);
    }).then((result) => {
        console.log(result);
    });
}

function serialTradeSNTW(prepare) {
    if (prepare.length == 0) {
        refreshOrder();
        return;
    }

    var item = prepare.shift();
    var e = eventList[item.order.logId];
    var rv = e.returnValues;

    var r = e.signature.slice(0, 34);
    var s = '0x' + e.signature.slice(34, 66);
    var v = '0x' + e.signature.slice(66, 68);
    v = web3.utils.toDecimal(v) + 27;

    var contract = new ethers.Contract(solaExchangeAddress, solaExchangeABI, userWallet);
    var txid;
    contract.trade(rv.tokenGet, rv.amountGet, rv.tokenGive, rv.amountGive, rv.expires, rv.nonce, rv.user, v, r, s, ethers.utils.parseEther(item.amountGive.toString())).then((transaction) => {
        console.log(transaction);
        txid = transaction.hash;
        return userWallet.provider.waitForTransaction(txid)
    }).then((transaction) => {
        console.log('Transaction Minded: ' + transaction.hash);
        console.log(transaction);
        serialTradeSNTW(prepare);
        setTimeout(function() {
            refreshHistory(1510647400);
        }, 3000);
    });
}

function refreshOrder() {
    solaExchange.getPastEvents('Order', {
            //filter: { myIndexedParam: [20, 23], myOtherIndexedParam: '0x123456789...' }, // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
            toBlock: 'latest'
        })
        .then(function(events) {
            orderBook = { count: 0, orders: {} };
            console.log("events");

            var sntwBid1, sntwBid2, sntwBid3;
            var sntwAsk1, sntwAsk2, sntwAsk3;
            for (var i = 0; i < events.length; ++i) {
                var e = events[i];
                var rv = e.returnValues;

                if (rv.expires < currentBlock) {
                    continue;
                }

                var order, rate, sntw, sntwAddress, sttw, remained;
                if (sttwAddress == rv.tokenGive) {
                    order = "BUY";
                    sntwAddress = rv.tokenGet;
                    sntw = web3.utils.fromWei(rv.amountGet, 'ether');
                    sttw = web3.utils.fromWei(rv.amountGive, 'ether');
                    rate = sttw / sntw;
                    color = "lightgreen";
                } else {
                    order = "SELL";
                    sntwAddress = rv.tokenGive;
                    sntw = web3.utils.fromWei(rv.amountGive, 'ether');
                    sttw = web3.utils.fromWei(rv.amountGet, 'ether');
                    rate = sttw / sntw;
                    color = "red";
                }

                switch (sntwAddress) {
                    case sntwAddress1:
                        if (order == "BUY") {
                            if (!sntwAsk1 || (sntwAsk1 < rate)) {
                                sntwAsk1 = rate;
                            }
                        } else if (order == "SELL") {
                            if (!sntwBid1 || (sntwBid1 > rate)) {
                                sntwBid1 = rate;
                            }
                        }
                        break;
                    case sntwAddress2:
                        if (order == "BUY") {
                            if (!sntwAsk2 || (sntwAsk2 < rate)) {
                                sntwAsk2 = rate;
                            }
                        } else if (order == "SELL") {
                            if (!sntwBid2 || (sntwBid2 > rate)) {
                                sntwBid2 = rate;
                            }
                        }
                        break;
                    case sntwAddress3:
                        if (order == "BUY") {
                            if (!sntwAsk3 || (sntwAsk3 < rate)) {
                                sntwAsk3 = rate;
                            }
                        } else if (order == "SELL") {
                            if (!sntwBid3 || (sntwBid3 > rate)) {
                                sntwBid3 = rate;
                            }
                        }
                        break;
                }

                var expires = (rv.expires > currentBlock) ? rv.expires - currentBlock : 0;
                orderBook.count += 1;
                orderBook.orders[e.id] = { logId: e.id, order: order, sntw: sntw, sntwAddress: sntwAddress, sttw: sttw, rate: rate, color: color, nonce: rv.nonce, expires: expires };

                eventList[e.id] = e;
                (function(event) {
                    solaExchange.methods.amountFilled(rv.tokenGet, rv.amountGet, rv.tokenGive, rv.amountGive, rv.expires, rv.nonce, rv.user, 0, "0x0", "0x0").call()
                        .then(function(filled) {
                            var need = updateOrderData(orderBook, event.id, filled);
                            if (!need) {
                                delete eventList[event.id];
                            }
                        });
                })(e);
            }

            $(".priceValue").show();
            $(".valueLoader").hide();

            $("#sntwBid1").text(sntwBid1);
            $("#sntwBid2").text(sntwBid2);
            $("#sntwBid3").text(sntwBid3);
            $("#sntwAsk1").text(sntwAsk1);
            $("#sntwAsk2").text(sntwAsk2);
            $("#sntwAsk3").text(sntwAsk3);
        });
}

function updateOrderData(orderData, eventId, filled) {
    if (orderData.orders[eventId]) {
        orderData.count -= 1;

        var o = orderData.orders[eventId];
        if (o.order == "BUY") {
            filled = web3.utils.fromWei(filled);
            o.remained = o.sntw - filled;
        } else {
            filled = web3.utils.fromWei(filled);
            o.remained = (o.sttw - filled) * o.sntw / o.sttw;
        }

        if (o.remained == 0) {
            delete orderData.orders[eventId];
        } else {
            return true; //需要保留event log
        }
    }

    return false;
}

function sortForOrderBook(orders) {
    var sortable = [];
    for (var id in orders) {
        var o = orders[id];
        sortable.push([o, o.order, o.rate, o.sntwAddress]);
    }

    sortable.sort(function(a, b) {
        if (a[1] != b[1]) {
            return (a[1] < b[1]) ? 1 : -1;
        } else {
            return b[2] - a[2];
        }
    });

    return sortable;
}

function doPrepareBuy() {
    prepareBuy = [];

    var sntwAddress;
    switch ($("#sntwTokenBuy option:selected").text()) {
        case "SNTW1":
            sntwAddress = sntwAddress1;
            break;
        case "SNTW2":
            sntwAddress = sntwAddress2;
            break;
        case "SNTW3":
            sntwAddress = sntwAddress3;
            break;
    }

    var totalPay = parseFloat($("#sttwAmountPay").val());
    var sortable = sortForOrderBook(orderBook.orders);
    console.log(sortable);
    var sellOrders = sortable.filter(function(o) {
        return o[1] == "SELL" && o[3] == sntwAddress;
    });

    console.log(sellOrders);

    var totalGet = 0;
    var realPay = 0;
    var bestRate;
    for (var i = sellOrders.length; i--;) {
        var o = sellOrders[i][0];
        if (!bestRate) {
            bestRate = o.rate;
        }
        if (o.remained * o.rate <= totalPay) {
            totalGet += o.remained;
            realPay += o.remained * o.rate;
            totalPay -= o.remained * o.rate;
            prepareBuy.push({ order: o, amountGet: o.remained, amountGive: o.remained * o.rate });
        } else if (totalPay > 0) {
            var rest = totalPay / o.rate;
            totalGet += rest;
            realPay += totalPay;
            prepareBuy.push({ order: o, amountGet: rest, amountGive: totalPay });
            totalPay = 0;
        } else {
            break;
        }
    }
    if (totalPay > 0) {
        $("#sttwAmountRest").text(sprintf("(剩餘STTW:%s)", totalPay));
    }
    $("#sntwAmountGet").text(sprintf("%s (pay STTW: %s, avg:%s, lowest:%s)", formatValue(totalGet), formatValue(realPay), formatValue(realPay / totalGet), formatValue(bestRate)));
    console.log(prepareBuy);
}

function doPrepareSell() {
    prepareSell = [];

    var sntwAddress;
    switch ($("#sntwTokenSell option:selected").text()) {
        case "SNTW1":
            sntwAddress = sntwAddress1;
            break;
        case "SNTW2":
            sntwAddress = sntwAddress2;
            break;
        case "SNTW3":
            sntwAddress = sntwAddress3;
            break;
    }

    var totalPay = parseFloat($("#sntwAmountPay").val());
    var sortable = sortForOrderBook(orderBook.orders);
    console.log(sortable);
    var buyOrders = sortable.filter(function(o) {
        return o[1] == "BUY" && o[3] == sntwAddress;
    });

    console.log(buyOrders);

    var totalGet = 0;
    var realPay = 0;
    var bestRate;
    for (var i = 0; i < buyOrders.length; i++) {
        var o = buyOrders[i][0];
        if (!bestRate) {
            bestRate = o.rate;
        }
        if (o.remained <= totalPay) {
            totalGet += o.remained * o.rate;
            realPay += o.remained;
            totalPay -= o.remained;
            prepareSell.push({ order: o, amountGet: o.remained * o.rate, amountGive: o.remained });
        } else if (totalPay > 0) {
            var rest = totalPay * o.rate;
            totalGet += rest;
            realPay += totalPay;
            prepareSell.push({ order: o, amountGet: rest, amountGive: totalPay });
            totalPay = 0;
        } else {
            break;
        }
    }
    if (totalPay > 0) {
        $("#sntwAmountRest").text(sprintf("(剩餘SNTW:%s)", totalPay));
    }
    $("#sttwAmountGet").text(sprintf("%s (pay %s: %s, avg:%s, higtest:%s)", formatValue(totalGet), getTokenName(sntwAddress), formatValue(realPay), formatValue(totalGet / realPay), formatValue(bestRate)));
    console.log(prepareSell);
}

function formatValue(v, precision) {
    if (!precision) {
        precision = 6;
    }
    var precision = Math.pow(10, precision);
    return Math.round(v * precision) / precision;
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

    $("#buySTTW").click(function() {
        if (!userWallet) {
            alert("no user login");
            return;
        }

        var amount = $("#twdDepositAmount").val();
        if (!amount) {
            alert("amount can't be 0");
            return;
        }

        console.log("buy", $("#twdDepositAmount").val());

        $.ajax({
            url: "/buy",
            type: "post",
            dataType: "html",
            data: {
                userId: userId,
                amount: amount
            },
            success: function(result) {
                var data = JSON.parse(result);
                console.log(data);
                for (var name in data) {
                    $(sprintf("input[name='%s']", name)).val(data[name]);
                }

                $("#formCreditCard").submit();
            },
        });
    });

    $("#buySNTW").click(function() {
        alert("Buy SNTW: " + $("#sttwAmountPay").val());
        serialTradeSNTW(prepareBuy);
    });

    $("#sellSNTW").click(function() {
        alert("Sell SNTW: " + $("#sntwAmountPay").val());
        serialTradeSNTW(prepareSell);
    });

    $("#twdDepositAmount").bind('keyup mouseup', function() {
        $("#sttwEstimatedAmount").text($(this).val());
    });

    $("#sttwAmountPay").bind('keyup mouseup', function() {
        doPrepareBuy();
    });

    $("#sntwTokenBuy").change(function() {
        doPrepareBuy();
    });

    $("#sntwAmountPay").bind('keyup mouseup', function() {
        doPrepareSell();
    });

    $("#sntwTokenSell").change(function() {
        doPrepareSell();
    });
}