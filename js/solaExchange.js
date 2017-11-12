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

var account;
var dataInitialized = false;
var currentBlock;
var allProject, myBar;
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
                    refreshTrade();
                    //refreshTransfer();
                } else {
                    //refreshExpires();
                }
            });

            web3.eth.getBalance(account).then(function(r) {
                $("#walletETH").text(web3.utils.fromWei(r, 'ether'));
            });

            sttw.methods.balanceOf(account).call().then(function(r) {
                $("#walletSTTW").text(web3.utils.fromWei(r, 'ether'));
            });

            sntw1.methods.balanceOf(account).call().then(function(r) {
                $("#walletSNTW1").text(web3.utils.fromWei(r, 'ether'));
            });

            sntw2.methods.balanceOf(account).call().then(function(r) {
                $("#walletSNTW2").text(web3.utils.fromWei(r, 'ether'));
            });

            sntw3.methods.balanceOf(account).call().then(function(r) {
                $("#walletSNTW3").text(web3.utils.fromWei(r, 'ether'));
            });

            solaExchange.methods.balanceOf(sttwAddress, account).call().then(function(r) {
                $("#balanceSTTW").text(web3.utils.fromWei(r, 'ether'));
            });

            solaExchange.methods.balanceOf(sntwAddress1, account).call().then(function(r) {
                $("#balanceSNTW1").text(web3.utils.fromWei(r, 'ether'));
            });

            solaExchange.methods.balanceOf(sntwAddress2, account).call().then(function(r) {
                $("#balanceSNTW2").text(web3.utils.fromWei(r, 'ether'));
            });

            solaExchange.methods.balanceOf(sntwAddress3, account).call().then(function(r) {
                $("#balanceSNTW3").text(web3.utils.fromWei(r, 'ether'));
            });
        }
    }, 1000);

    $.getJSON("https://sola-api.herokuapp.com/api/v1/projects", function(data) {
        allProject = data;
        var testType = 0;
        allProject.forEach(function(item, index) {
            var pair = $(sprintf("<div data-id='%s' class='row pair clickable'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", item.id, "SNTW" + (++testType), item.name, item.date.slice(0, 10), item.capacity, item.decay, "TODO"));
            if (index < 3) {
                $("#pairs").append(pair);
            }

            var p = allProject.find(function(a) {
                return a.id == item.id;
            });
            p.values = {};
        });
    });

    $.getJSON("https://sola-api.herokuapp.com/api/v1/values", function(json) {
        console.log(json);
        json.forEach(function(item, index) {
            var p = allProject.find(function(a) {
                return a.id == item.id;
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
        console.log(allProject);
    });
});

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

                    $("#myTrades .rowHead:last").after(sprintf("<div class='row %s'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", order.toLowerCase(), order, getTokenName(sntwAddress), rate, sntw));
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
                    color = "lightgreen";
                } else {
                    order = "SELL";
                    sntwAddress = rv.tokenGive;
                    sntw = web3.utils.fromWei(rv.amountGive, 'ether');
                    sttw = web3.utils.fromWei(rv.amountGet, 'ether');
                    rate = sttw / sntw;
                    color = "red";
                }

                if (sntwAddress != selectedSntw) {
                    continue;
                }

                var expires = (rv.expires > currentBlock) ? rv.expires - currentBlock : 0;

                if (expires > 0) {
                    orderBook.count += 1;
                    orderBook.orders[e.id] = { logId: e.id, order: order, sntw: sntw, sntwAddress: sntwAddress, sttw: sttw, rate: rate, nonce: rv.nonce, expires: expires };
                }

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
                                    var order = $(sprintf("<div id='o_%s' title='click to trade.' data-logid='%s' class='row'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", o.nonce, o.logId, "TODO", o.remained, o.rate));
                                    $("#orderBookBuy").append(order);
                                }

                                $("#orderBookSell .row").remove();
                                for (var s in sortSells) {
                                    var o = sortSells[s][0];
                                    var order = $(sprintf("<div id='o_%s' title='click to trade.' data-logid='%s' class='row'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", o.nonce, o.logId, o.rate, o.remained, "TODO"));
                                    $("#orderBookSell").append(order);
                                }
                            }

                            if (myOrders.count == 0) {
                                $("#myOrders .row").remove();
                                for (var id in myOrders.orders) {
                                    var o = myOrders.orders[id];
                                    var order = $(sprintf("<div id='mo_%s' title='click to cancel.' data-logid='%s' class='row %s'><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div><div class='cell'>%s</div></div>", o.nonce, o.logId, o.order.toLowerCase(), o.order, getTokenName(o.sntwAddress), o.rate, o.remained, o.sntw, (o.expires > 0 ? 'alive' : 'expired')))
                                    $("#myOrders").append(order);
                                }
                            }
                        });
                })(e);
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

function refreshPriceChart(sntwAddress, today) {
    $.ajax({
        url: "/getTrade",
        type: "post",
        dataType: "html",
        data: {
            timestamp: today
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
                    name: 'SNTW Price',
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

function bindAll() {
    $("#approveSTTW").click(function() {
        console.log("approveSTTW");
    });

    $("#approveSNTW1").click(function() {
        console.log("approveSNTW1");
    });

    $("#approveSNTW2").click(function() {
        console.log("approveSNTW2");
    });

    $("#approveSNTW3").click(function() {
        console.log("approveSNTW3");
    });

    $("#depositSTTW").click(function() {
        console.log("depositSTTW");
    });

    $("#depositSNTW1").click(function() {
        console.log("depositSNTW1");
    });

    $("#depositSNTW2").click(function() {
        console.log("depositSNTW2");
    });

    $("#depositSNTW3").click(function() {
        console.log("depositSNTW3");
    });

    $("#withdrawSTTW").click(function() {
        console.log("withdrawSTTW");
    });

    $("#withdrawSNTW1").click(function() {
        console.log("withdrawSNTW1");
    });

    $("#withdrawSNTW2").click(function() {
        console.log("withdrawSNTW2");
    });

    $("#withdrawSNTW3").click(function() {
        console.log("withdrawSNTW3");
    });

    $("#pairs").on("click", ".row", function() {
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
        refreshOrder(sntwAddress);
        refreshPriceChart(sntwAddress, 1510129795);

        var id = $(this).data("id");
        var p = allProject.find(function(a) {
            return a.id == id;
        });

        var map = new GMaps({
            div: '#map',
            lat: p.coord.lat,
            lng: p.coord.lng,
            zoom: 7,
            mapTypeId: 'satellite',
            options: {
                styles: mapStyle,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false
            }
        });

        var m = map.addMarker({
            lat: p.coord.lat,
            lng: p.coord.lng,
            title: p.name,
            infoWindow: {
                content: sprintf('<h8>%s</h8><div>裝置容量: %s(kW)</div>', p.name, p.capacity),
                maxWidth: 100
            }
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
}