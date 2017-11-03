package main

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"crypto/sha256"
	"time"
)

func main() {
	form := url.Values{}

	id := time.Now().Format("20060102150405")
	date := time.Now().Format("2006/01/02 15:04:05")

	form.Add("MerchantID", "2000132")                                                             //MerchantID 商店代號
	form.Add("MerchantTradeNo", id)                                           //MerchantTradeNo 商店交易編號
	form.Add("MerchantTradeDate", date)                                          //MerchantTradeDate 商店交易時間
	form.Add("PaymentType", "aio")                                                                //PaymentType 交易類型
	form.Add("TotalAmount", "5")                                                                  //TotalAmount 交易金額
	form.Add("TradeDesc", "建立信用卡測試訂單")                                                            //TradeDesc 交易描述
	form.Add("ItemName", "MacBook 30元X2#iPhone6s 40元X1")                                          //ItemName 商品名稱
	form.Add("ReturnURL", "https://developers.allpay.com.tw/AioMock/MerchantReturnUrl")           //ReturnURL 付款完成通知回傳網址
	form.Add("ChoosePayment", "Credit")                                                           //ChoosePayment 預設付款方式
	form.Add("StoreID", "")                                                                       //會員商店代碼
	form.Add("ClientBackURL", "https://developers.allpay.com.tw/AioMock/MerchantClientBackUrl")   //ClientBackURL Client端返回廠商網址
	form.Add("CreditInstallment", "")                                                             //CreditInstallment 刷卡分期期數
	form.Add("InstallmentAmount", "")                                                             //InstallmentAmount 使用刷卡分期的付款金額
	form.Add("Redeem", "")                                                                        //Redeem 信用卡是否使用紅利折抵
	form.Add("EncryptType", "1")                                                                  //CheckMacValue 簽章類型

	chk := getCheckMacValue(form)
	form.Add("CheckMacValue", chk) //CheckMacValue 檢查碼

	resp, err := http.PostForm("https://payment-stage.allpay.com.tw/Cashier/AioCheckOut/V4", form)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(resp)
	}
}

func getCheckMacValue(form url.Values) string {
	fmt.Println(form)
	fmt.Println()
	v := "HashKey=5294y06JbISpM5x9&" + form.Encode() + "&HashIV=v77hoKGq4kWxNNIS"
	v = strings.ToLower(v)
	fmt.Println(v)
	fmt.Println()

	encodeTokens := map[string] string {		
		"&": "%26",
		"~": "%7e",
		"@": "%40",
		"#": "%23",
		"$": "%24",
		"^": "%5e",
		"=": "%3d",
		"+": "%2b",
		";": "%3b",
		"?": "%3f",
		"/": "%2f",
		"\\": "%5c",
		">": "%3e",
		"<": "%3c",
		"`": "%60",
		"[": "%5b",
		"]": "%5d",
		"{": "%7b",
		"}": "%7d",
		":": "%3a",
		"'": "%27",
		"\"": "%22",
		",": "%2c",
		"|": "%7c",
	}

	for key, value := range encodeTokens {
		v = strings.Replace(v, key, value, -1)
	}
	fmt.Println(v)
	fmt.Println()

	replaceTokens := map[string] string {
		"%2d": "-",
		"%5f": "_",
		"%2e": ".",
		"%21": "!",
		"%2a": "*",
		"%28": "(",
		"%29": ")",
		"%2b": "+",
	}

	for key, value := range replaceTokens {
		v = strings.Replace(v, key, value, -1)
	}
	fmt.Println(v)
	fmt.Println()

	b := sha256.Sum256([]byte(v))

	v = fmt.Sprintf("%x\n", b)
	v = strings.ToUpper(v)

	return v
}
