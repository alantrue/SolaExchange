if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

web3.eth.getAccounts().then(function(r) {
    account = r[0];
    $("#userAccount").text(account);
});

var startBlock = 1510129795;
var feeRate = 0.005;
var account;
var dataInitialized = false;
var currentBlock;
var allPackage, myBar;
var eventList = {};
var orderBook = {};
var myOrders = {};

var sttw = new web3.eth.Contract(sttwABI, sttwAddress);
var sntw1 = new web3.eth.Contract(sntwABI, sntwAddress1);
var sntw2 = new web3.eth.Contract(sntwABI, sntwAddress2);
var sntw3 = new web3.eth.Contract(sntwABI, sntwAddress3);
var solaExchange = new web3.eth.Contract(solaExchangeABI, solaExchangeAddress);

$(function() {
    bindAll();
    setInterval(function() {
        web3.eth.getAccounts().then(function(r) {
            if (account == r[0]) {
                return;
            }

            account = r[0];
            $("#userAccount").text(account);
            dataInitialized = false;
        });

        if (account) {
            web3.eth.getBlockNumber().then(function(r) {
                currentBlock = r;
                $("#currentBlock").text(currentBlock);
                if (!dataInitialized) {
                    dataInitialized = true;
                    refreshPairs();
                    refreshTrade();
                } else {
                    refreshExpires();
                }
            });

            web3.eth.getBalance(account).then(function(r) {
                $("#walletETH").text(formatWeiValue(r));
            });

            sttw.methods.balanceOf(account).call().then(function(r) {
                $("#walletSTTW").text(formatWeiValue(r));
            });

            sntw1.methods.balanceOf(account).call().then(function(r) {
                $("#walletSNTW1").text(formatWeiValue(r));
            });

            sntw2.methods.balanceOf(account).call().then(function(r) {
                $("#walletSNTW2").text(formatWeiValue(r));
            });

            sntw3.methods.balanceOf(account).call().then(function(r) {
                $("#walletSNTW3").text(formatWeiValue(r));
            });

            solaExchange.methods.balanceOf(sttwAddress, account).call().then(function(r) {
                $("#balanceSTTW").text(formatWeiValue(r));
            });

            solaExchange.methods.balanceOf(sntwAddress1, account).call().then(function(r) {
                $("#balanceSNTW1").text(formatWeiValue(r));
            });

            solaExchange.methods.balanceOf(sntwAddress2, account).call().then(function(r) {
                $("#balanceSNTW2").text(formatWeiValue(r));
            });

            solaExchange.methods.balanceOf(sntwAddress3, account).call().then(function(r) {
                $("#balanceSNTW3").text(formatWeiValue(r));
            });
        }
    }, 1000);
});

function formatWeiValue(v, precision) {
    return formatValue(parseFloat(web3.utils.fromWei(v, 'ether')), precision);
}

function formatValue(v, precision) {
    if (!precision) {
        precision = 6;
    }
    var precision = Math.pow(10, precision);
    return Math.floor(v*precision)/precision;    
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

function refreshPairs() {
    $("#pairs .row").remove();

    $.getJSON("https://sola-api.herokuapp.com/api/v1/projects", function(allProject) {
        allPackage = []
        console.log(allProject);
        var testType = 0;

        //包成package
        allProject.forEach(function(project, index) {
            var id = project.id.slice(0, 3);
            var package = allPackage.find(function(a) { return a.id == id; });
            if (!package) {
                package = { id: id, date: "", capacity: 0, decay: 0, projects: [], values: [] };
                allPackage.push(package);
            }

            package.projects.push(project);
        });

        //計算package的值
        allPackage.forEach(function(package, index) {
            var date = "",
                totalCapacity = 0,
                totalDecay = 0;
            package.projects.forEach(function(project, index) {
                date = project.date;
                totalCapacity += project.capacity;
                totalDecay += project.decay;
            });

            package.date = date;
            package.capacity = totalCapacity;
            package.decay = totalDecay / package.projects.length;
        });

        console.log(allPackage);
        var testType = 0;
        allPackage.forEach(function(item, index) {
            var pair = $(sprintf("<div data-id='%s' title='click to select %s' class='row pair clickable selectable'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", item.id, "SNTW" + (++testType), "SNTW" + testType, item.date.slice(0, 10), item.capacity.toFixed(2)+"(kW)", (item.decay*100).toFixed(2)+"%", "100%"));
            $("#pairs").append(pair);
        });

        $.getJSON("https://sola-api.herokuapp.com/api/v1/values", function(json) {
            console.log(json);
            json.forEach(function(item, index) {
                var p = allPackage.find(function(a) {
                    return a.id == item.id.slice(0, 3);
                });

                var dt = item.dt.slice(0, 10);
                var v = p.values[dt];
                if (v) {
                    v += item.value;
                    p.values[dt] = v;
                } else {
                    p.values[dt] = item.value;
                }
            });
            console.log(allPackage);
            $("#pairs .row").first().trigger("click");
        });
    });
}

function refreshTrade() {
    solaExchange.getPastEvents('Trade', {
            //filter: { myIndexedParam: [20, 23], myOtherIndexedParam: '0x123456789...' }, // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
            toBlock: 'latest'
        })
        .then(function(trades) {
            $("#myTrades .row").remove();

            for (var i = 0; i < trades.length; i++) {
                var rv = trades[i].returnValues;
                if (rv.get == account || rv.give == account) {
                    var order, rate, sntw, sntwAddress, sttw;
                    if (sttwAddress == rv.tokenGive) {
                        order = (rv.get == account) ? "BUY" : "SELL";
                        sntwAddress = rv.tokenGet;
                        sntw = web3.utils.fromWei(rv.amountGet, 'ether');
                        sttw = web3.utils.fromWei(rv.amountGive, 'ether');
                        rate = sttw / sntw;
                    } else {
                        order = (rv.give == account) ? "BUY" : "SELL";
                        sntwAddress = rv.tokenGive;
                        sntw = web3.utils.fromWei(rv.amountGive, 'ether');
                        sttw = web3.utils.fromWei(rv.amountGet, 'ether');
                        rate = sttw / sntw;
                    }

                    $("#myTrades .rowHead:last").after(sprintf("<div class='row %s'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", order.toLowerCase(), order, getTokenName(sntwAddress), formatValue(rate, 3), sntw));
                }
            }
        });
}

function refreshOrder(selectedSntw) {
    solaExchange.getPastEvents('Order', {
            //filter: { myIndexedParam: [20, 23], myOtherIndexedParam: '0x123456789...' }, // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
            toBlock: 'latest'
        })
        .then(function(events) {
            orderBook = { count: 0, orders: {} };
            myOrders = { count: 0, orders: {} };

            for (var i = 0; i < events.length; ++i) {
                var e = events[i];
                var rv = e.returnValues;
                //console.log(e);
                var order, rate, sntw, sntwAddress, sttw, remained;
                if (sttwAddress == rv.tokenGive) {
                    order = "BUY";
                    sntwAddress = rv.tokenGet;
                    sntw = web3.utils.fromWei(rv.amountGet, 'ether');
                    sttw = web3.utils.fromWei(rv.amountGive, 'ether');
                    rate = sttw / sntw;
                } else {
                    order = "SELL";
                    sntwAddress = rv.tokenGive;
                    sntw = web3.utils.fromWei(rv.amountGive, 'ether');
                    sttw = web3.utils.fromWei(rv.amountGet, 'ether');
                    rate = sttw / sntw;
                }

                if (sntwAddress != selectedSntw) {
                    continue;
                }

                var expires = (rv.expires > currentBlock) ? rv.expires - currentBlock : 0;
                if (expires == 0) {
                    continue;
                }

                orderBook.count += 1;
                orderBook.orders[e.id] = { logId: e.id, order: order, sntw: sntw, sntwAddress: sntwAddress, sttw: sttw, rate: rate, nonce: rv.nonce, expires: expires };

                if (rv.user == account) {
                    myOrders.count += 1;
                    myOrders.orders[e.id] = { logId: e.id, order: order, sntw: sntw, sntwAddress: sntwAddress, sttw: sttw, rate: rate, nonce: rv.nonce, expires: expires };
                }

                eventList[e.id] = e;
                (function(event) {
                    solaExchange.methods.amountFilled(rv.tokenGet, rv.amountGet, rv.tokenGive, rv.amountGive, rv.expires, rv.nonce, rv.user, 0, "0x0", "0x0").call()
                        .then(function(filled) {
                            var need1 = updateOrderData(orderBook, event.id, filled);
                            var need2 = updateOrderData(myOrders, event.id, filled);
                            if (!(need1 || need2)) {
                                delete eventList[event.id];
                            }

                            if (orderBook.count == 0) {
                                var sortBuys = sortForOrderBook(orderBook.orders, "BUY");
                                var sortSells = sortForOrderBook(orderBook.orders, "SELL");

                                $("#orderBookBuy .row").remove();
                                for (var s in sortBuys) {
                                    var o = sortBuys[s][0];
                                    var order = $(sprintf("<div id='o_%s' title='click to trade.' data-logid='%s' class='row clickable selectable'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", o.nonce, o.logId, formatValue(o.rate, 3), o.sntw, o.remained));
                                    $("#orderBookBuy").append(order);
                                }

                                $("#orderBookSell .row").remove();
                                for (var s in sortSells) {
                                    var o = sortSells[s][0];
                                    var order = $(sprintf("<div id='o_%s' title='click to trade.' data-logid='%s' class='row clickable selectable'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", o.nonce, o.logId, formatValue(o.rate, 3), o.sntw, o.remained));
                                    $("#orderBookSell").append(order);
                                }
                            }

                            if (myOrders.count == 0) {
                                $("#myOrders .row").remove();
                                for (var id in myOrders.orders) {
                                    var o = myOrders.orders[id];
                                    var order = $(sprintf("<div id='mo_%s' title='click to cancel.' data-logid='%s' class='row clickable selectable %s'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", o.nonce, o.logId, o.order.toLowerCase(), o.order, getTokenName(o.sntwAddress), formatValue(o.rate, 3), o.sntw, o.remained, o.expires))
                                    $("#myOrders").append(order);
                                }
                            }
                        });
                })(e);
            }
        });
}

function refreshExpires() {
    $("#orderBookBuy .row").each(function() {
        var logId = $(this).data("logid");
        if (logId) {
            var e = eventList[logId];
            var rv = e.returnValues;
            var expires = (rv.expires > currentBlock) ? rv.expires - currentBlock : 0;

            if (expires == 0) {
                $(this).hide();
            }
        }
    });

    $("#orderBookSell .row").each(function() {
        var logId = $(this).data("logid");
        if (logId) {
            var e = eventList[logId];
            var rv = e.returnValues;
            var expires = (rv.expires > currentBlock) ? rv.expires - currentBlock : 0;

            if (expires == 0) {
                $(this).hide();
            }
        }
    });


    $("#myOrders .row").each(function() {
        var logId = $(this).data("logid");
        if (logId) {
            var e = eventList[logId];
            var rv = e.returnValues;
            var expires = (rv.expires > currentBlock) ? rv.expires - currentBlock : 0;

            $(this).find('.cell:last-child').text(expires);
            if (expires == 0) {
                $(this).hide();
            }
        }
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

function sortForOrderBook(orders, type) {
    var sortable = [];
    for (var id in orders) {
        var o = orders[id];
        if (o.order == type) {
            sortable.push([o, o.order, o.rate]);
        }
    }

    sortable.sort(function(a, b) {
        if (a[1] == "BUY") {
            return b[2] - a[2];
        } else {
            return a[2] - b[2];
        }
    });

    return sortable;
}

function refreshPriceChart(sntwAddress, start) {
    $.ajax({
        url: "/getTrade",
        type: "post",
        dataType: "html",
        data: {
            timestamp: start
        },
        async: false,
        success: function(r) {
            console.log(r);
            var trades = JSON.parse(r);
            console.log(trades);

            var data = [];

            for (var i = 0; i < trades.length; i++) {
                var t = trades[i];
                var address, amount, price;
                if (sttwAddress == t.tokenGive) {
                    address = t.tokenGet;
                    amount = web3.utils.fromWei(t.amountGet, 'ether');
                    price = web3.utils.fromWei(t.amountGive, 'ether');
                } else {
                    address = t.tokenGive;
                    amount = web3.utils.fromWei(t.amountGive, 'ether');
                    price = web3.utils.fromWei(t.amountGet, 'ether');
                }

                if (address != sntwAddress) {
                    continue;
                }

                var rate = price / amount;

                var timeIndex = Math.floor(t.timestamp / 300) * 300 * 1000;
                if (data.length == 0 || data[data.length - 1][0] != toLocalTimestamp(timeIndex)) {
                    data.push([toLocalTimestamp(timeIndex), rate, rate, rate, rate]);
                } else {
                    var stick = data[data.length - 1];
                    if (rate > stick[2]) {
                        stick[2] = rate;
                    }
                    if (rate < stick[3]) {
                        stick[3] = rate;
                    }
                    stick[4] = rate;
                }
            }
            // create the chart
            Highcharts.setOptions(Highcharts.theme);
            Highcharts.stockChart('container', {
                rangeSelector: {
                    selected: 1
                },
                series: [{
                    type: 'candlestick',
                    name: 'Price',
                    data: data
                }],
                navigator: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                }
            });
        },
    });
}

function toLocalTimestamp(timestamp) {
    var d = new Date();
    return timestamp - d.getTimezoneOffset() * 60 * 1000;
}

function openBalanceDialog(tokenAddress, operation) {
    var tokenName = getTokenName(tokenAddress);

    $("#balanceDialogAmountLabel").text(tokenName);
    $("#balanceDialogAmount").val(0);
    $("#balanceConfirm").text(operation);

    $("#balanceMask").show();
}

function openTradeDialog(logId) {
    var e = eventList[logId];
    var rv = e.returnValues;

    var type, sntw, sttw, rate, sntwAddress;
    if (sttwAddress == rv.tokenGive) {
        type = "Sell";
        sntwAddress = rv.tokenGet;
        sntw = web3.utils.fromWei(rv.amountGet, 'ether');
        sttw = web3.utils.fromWei(rv.amountGive, 'ether');
        rate = sttw / sntw;
    } else {
        type = "Buy";
        sntwAddress = rv.tokenGive;
        sntw = web3.utils.fromWei(rv.amountGive, 'ether');
        sttw = web3.utils.fromWei(rv.amountGet, 'ether');
        rate = sttw / sntw;
    }

    var tokenName = getTokenName(sntwAddress);

    $("#tradeDialogTradeType").text(type);
    $("#tradeDialogDescription").html(sprintf("Order <br/> %s %s @ %s %s/STTW <br/> Expires in %s blocks", sntw, tokenName, rate, tokenName, rv.expires));
    $("#tradeDialogAmountLabel").text(tokenName);
    $("#tradeDialogAmount").val(sntw);
    $("#tradeDialogSTTW").val(sttw);
    $("#tradeDialogFee").val(sttw * feeRate);

    $("#tradeDialog").data("logId", logId);
    $("#tradeDialog").data("rate", rate);

    $("#tradeMask").show();
}

function calcOrder() {
    var sttw = $("#orderPrice").val() * $("#orderAmount").val();
    $("#orderSubtotal").text(sttw);
    $("#orderFee").text(sttw * feeRate);
    $("#orderTotal").text(sttw + sttw * feeRate);
}

function bindAll() {
    $("#approveSTTW").click(function() {
        openBalanceDialog(sttwAddress, "Approve");
    });

    $("#approveSNTW1").click(function() {
        openBalanceDialog(sntwAddress1, "Approve");
    });

    $("#approveSNTW2").click(function() {
        openBalanceDialog(sntwAddress2, "Approve");
    });

    $("#approveSNTW3").click(function() {
        openBalanceDialog(sntwAddress3, "Approve");
    });

    $("#depositSTTW").click(function() {
        openBalanceDialog(sttwAddress, "Deposit");
    });

    $("#depositSNTW1").click(function() {
        openBalanceDialog(sntwAddress1, "Deposit");
    });

    $("#depositSNTW2").click(function() {
        openBalanceDialog(sntwAddress2, "Deposit");
    });

    $("#depositSNTW3").click(function() {
        openBalanceDialog(sntwAddress3, "Deposit");
    });

    $("#withdrawSTTW").click(function() {
        openBalanceDialog(sttwAddress, "Withdraw");
    });

    $("#withdrawSNTW1").click(function() {
        openBalanceDialog(sntwAddress1, "Withdraw");
    });

    $("#withdrawSNTW2").click(function() {
        openBalanceDialog(sntwAddress2, "Withdraw");
    });

    $("#withdrawSNTW3").click(function() {
        openBalanceDialog(sntwAddress3, "Withdraw");
    });

    $("#pairs").on("click", ".row", function() {
        $("#pairs .row").removeClass("selected");
        $(this).addClass("selected");
        var pair = $(this).children().first().text();
        var sntwAddress;
        switch (pair) {
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

        $("#orderToken").text(pair);

        refreshOrder(sntwAddress);
        refreshPriceChart(sntwAddress, startBlock);

        var id = $(this).data("id");
        var p = allPackage.find(function(a) {
            return a.id == id;
        });

        var map = new GMaps({
            div: '#map',
            lat: p.projects[0].coord.lat,
            lng: p.projects[0].coord.lng,
            zoom: 7,
            mapTypeId: 'satellite',
            options: {
                styles: mapStyle,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false
            }
        });

        p.projects.forEach(function(project, index) {
            var m = map.addMarker({
                lat: project.coord.lat,
                lng: project.coord.lng,
                title: project.name,
                infoWindow: {
                    content: sprintf('<h8>%s</h8><div>裝置容量: %s(kW)</div><div>發電年衰減率: %s</div>', project.name, project.capacity, (project.decay*100).toFixed(2)+"%"),
                    maxWidth: 300
                }
            });
        });

        console.log(p.values);

        var values = [];
        for (var dt in p.values) {
            values.push({ date: dt, value: p.values[dt] });
        }

        values.sort(function(a, b) {
            if (a.date < b.date) {
                return -1;
            } else if (a.date > b.date) {
                return 1;
            } else {
                return 0;
            }
        });

        var lables = [];
        var datas = [];
        values.forEach(function(item, index) {
            lables.push(item.date);
            datas.push(item.value);
        });

        var ctx = $("#chart-area");
        ctx.empty;

        if (myBar) {
            myBar.destroy();
        }
        myBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: lables,
                datasets: [{
                    label: sprintf('%s - 日發電量(kW)', p.name),
                    data: datas,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }

            }
        });
    });

    $("#myOrders").on('click', ".row", function() {
        var logId = $(this).data("logid");
        if (logId) {
            var e = eventList[logId];
            var rv = e.returnValues;

            var r = e.signature.slice(0, 34);
            var s = '0x' + e.signature.slice(34, 66);
            var v = '0x' + e.signature.slice(66, 68);
            v = web3.utils.toDecimal(v) + 27;

            var sntwAddress = (sttwAddress == rv.tokenGet) ? rv.tokenGive : rv.tokenGet;

            solaExchange.methods.cancelOrder(rv.tokenGet, rv.amountGet, rv.tokenGive, rv.amountGive, rv.expires, rv.nonce, v, r, s).send({ from: account })
                .then(function(r) {
                    console.log(r);
                    refreshOrder(sntwAddress);
                });
        }
    });

    $("#orderBookBuy").on('click', ".row", function() {
        var logId = $(this).data("logid");
        if (logId) {
            openTradeDialog(logId);
        }
    });

    $("#orderBookSell").on('click', ".row", function() {
        var logId = $(this).data("logid");
        if (logId) {
            openTradeDialog(logId);
        }
    });

    $("#balanceConfirm").click(function() {
        var token = $("#balanceDialogAmountLabel").text();
        var tokenContract, tokenAddress;
        switch (token) {
            case "STTW":
                tokenContract = sttw;
                tokenAddress = sttwAddress;
                break;
            case "SNTW1":
                tokenContract = sntw1;
                tokenAddress = sntwAddress1;
                break;
            case "SNTW2":
                tokenContract = sntw2;
                tokenAddress = sntwAddress2;
                break;
            case "SNTW3":
                tokenContract = sntw3;
                tokenAddress = sntwAddress3;
                break;
        }

        var v = $("#balanceDialogAmount").val();

        var operation = $(this).text();
        switch (operation) {
            case "Approve":
                tokenContract.methods.approve(solaExchangeAddress, web3.utils.toWei(v, 'ether')).send({ from: account }).then(function(result) {
                    tokenContract.methods.allowance(account, solaExchangeAddress).call().then(function(r) {
                        alert(sprintf("you can deposit %s (%s)", web3.utils.fromWei(r, 'ether') , getTokenName(tokenAddress)));
                    });
                    console.log(result);
                });
                break;
            case "Deposit":
                solaExchange.methods.depositToken(tokenAddress, web3.utils.toWei(v, 'ether')).send({ from: account }).then(console.log);
                break;
            case "Withdraw":
                solaExchange.methods.withdrawToken(tokenAddress, web3.utils.toWei(v, 'ether')).send({ from: account }).then(console.log);
                break;
        }

        $("#balanceMask").hide();
    });

    $("#tradeConfirm").click(function() {
        var logId = $("#tradeDialog").data("logId");
        var e = eventList[logId];
        var rv = e.returnValues;

        var r = e.signature.slice(0, 34);
        var s = '0x' + e.signature.slice(34, 66);
        var v = '0x' + e.signature.slice(66, 68);
        v = web3.utils.toDecimal(v) + 27;

        var amountGet, sntwAddress;
        if (sttwAddress == rv.tokenGive) {
            sntwAddress = rv.tokenGet;
            amountGet = web3.utils.toWei($("#tradeDialogAmount").val(), 'ether');
        } else {
            sntwAddress = rv.tokenGive;
            amountGet = web3.utils.toWei($("#tradeDialogSTTW").val(), 'ether');
        }

        solaExchange.methods.trade(rv.tokenGet, rv.amountGet, rv.tokenGive, rv.amountGive, rv.expires, rv.nonce, rv.user, v, r, s, amountGet).send({ from: account })
            .then(function(r) {
                console.log(r);
                refreshOrder(sntwAddress);
                refreshTrade();
                refreshPriceChart(sntwAddress, startBlock);
            });

        $("#tradeMask").hide();
    });

    $("#tradeDialogAmount").bind('keyup mouseup', function() {
        var sttw = $("#tradeDialog").data("rate") * $("#tradeDialogAmount").val();
        $("#tradeDialogSTTW").val(sttw);
        $("#tradeDialogFee").val(sttw * feeRate);
    });

    $("#orderAmount").bind('keyup mouseup', function() {
        calcOrder();
    });

    $("#orderPrice").bind('keyup mouseup', function() {
        calcOrder();
    });

    $("#orderBuy").click(function() {
        var token = $("#orderToken").text();
        var sntwAddress;
        switch (token) {
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

        var get = $("#orderAmount").val();
        var give = $("#orderSubtotal").text();
        var expires = parseInt($('#orderExpires').val()) + currentBlock;
        var nonce = Date.now();
        solaExchange.methods.order(sntwAddress, web3.utils.toWei(get, 'ether'), sttwAddress, web3.utils.toWei(give, 'ether'), expires, nonce).send({ from: account })
            .then(function(r) {
                console.log(r);
                refreshOrder(sntwAddress);
            });
    });

    $("#orderSell").click(function() {
        var token = $("#orderToken").text();
        var sntwAddress;
        switch (token) {
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

        var get = $("#orderSubtotal").text();
        var give = $("#orderAmount").val();
        var expires = parseInt($('#orderExpires').val()) + currentBlock;
        var nonce = Date.now();
        solaExchange.methods.order(sttwAddress, web3.utils.toWei(get, 'ether'), sntwAddress, web3.utils.toWei(give, 'ether'), expires, nonce).send({ from: account })
            .then(function(r) {
                console.log(r);
                refreshOrder(sntwAddress);
            });
    });
}