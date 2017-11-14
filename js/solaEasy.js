$(function() {

	bindAll();
	
    for (var i = 0; i < 20; ++i) {
        $(".historyTable").append("<tr><td>BID</td><td>Completed</td><td>2017/11/11 11:11:11</td><td>SNTW</td><td>123.99</td><td>12,399</td></tr>");
    }

    $("#menuTrade").trigger("click");
});

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