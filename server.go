package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"./packetHandler"
	simplejson "github.com/bitly/go-simplejson"
	"github.com/gorilla/websocket"
)

type Order struct {
	MerchantID        string `json:"MerchantID"`
	MerchantTradeNo   string `json:"MerchantTradeNo"`
	MerchantTradeDate string `json:"MerchantTradeDate"`
	PaymentType       string `json:"PaymentType"`
	TotalAmount       string `json:"TotalAmount"`
	TradeDesc         string `json:"TradeDesc"`
	ItemName          string `json:"ItemName"`
	ReturnURL         string `json:"ReturnURL"`
	ChoosePayment     string `json:"ChoosePayment"`
	StoreID           string `json:"StoreID"`
	ClientBackURL     string `json:"ClientBackURL"`
	CreditInstallment string `json:"CreditInstallment"`
	InstallmentAmount string `json:"InstallmentAmount"`
	Redeem            string `json:"Redeem"`
	EncryptType       string `json:"EncryptType"`
	CheckMacValue     string `json:"CheckMacValue"`
}

func main() {
	log.Println("server starting")

	go packetHandler.Do()

	http.HandleFunc("/WS", handlerWS)
	http.HandleFunc("/demo", handlerDemo)
	http.HandleFunc("/buy", handlerBuy)
	http.HandleFunc("/test", handlerTest)
	http.HandleFunc("/OrderComplete", handlerOrderComplete)

	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", http.StripPrefix("/", fs))

	http.ListenAndServe(":80", nil)
}

func handlerWS(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Upgrade(w, r, w.Header(), 1024, 1024)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()

	tempID := time.Now().Format("20060102_150405")
	packetHandler.Join(tempID, c)

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			packetHandler.Leave(tempID)
			break
		}
		log.Printf("recv: %s", message)

		js, err := simplejson.NewJson([]byte(message))
		if err != nil {
			panic("json format error")
		}

		opcode, err := js.Get("opcode").String()

		log.Printf(opcode)

		packetHandler.HandlePacket(c, mt, js)
	}
}

func handlerOrderComplete(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()

	if r.Form["RtnCode"][0] == "1" { //交易成功
		id := r.Form["MerchantTradeNo"][0]
		tradeNo := r.Form["TradeNo"][0]
		tradeAmount := r.Form["TradeAmt"][0]
		fmt.Println(id, tradeNo, tradeAmount)

		packetHandler.TradeComplete(id)
	} else {
		fmt.Println(r.Form)
	}

}

func handlerDemo(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("view/demo.html")
	if err != nil {
		log.Fatal(err)
	}

	data := struct {
		IP      string
		Uncache string
	}{
		IP:      "alantrue.ddns.net",
		Uncache: time.Now().Format("20060102150405"),
	}

	err = t.Execute(w, data)
	if err != nil {
		log.Fatal(err)
	}
}

func handlerTest(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("view/test.html")
	if err != nil {
		log.Fatal(err)
	}

	data := struct {
		Uncache string
	}{
		Uncache: time.Now().Format("20060102150405"),
	}

	err = t.Execute(w, data)
	if err != nil {
		log.Fatal(err)
	}
}

func createCheck(id, date, returnURL, clientBackURL, itemName, price string) string {
	form := url.Values{}

	form.Add("MerchantID", "2000132")        //MerchantID 商店代號
	form.Add("MerchantTradeNo", id)          //MerchantTradeNo 商店交易編號
	form.Add("MerchantTradeDate", date)      //MerchantTradeDate 商店交易時間
	form.Add("PaymentType", "aio")           //PaymentType 交易類型
	form.Add("TotalAmount", price)           //TotalAmount 交易金額
	form.Add("TradeDesc", "建立信用卡測試訂單")       //TradeDesc 交易描述
	form.Add("ItemName", itemName)           //ItemName 商品名稱
	form.Add("ReturnURL", returnURL)         //ReturnURL 付款完成通知回傳網址
	form.Add("ChoosePayment", "Credit")      //ChoosePayment 預設付款方式
	form.Add("StoreID", "")                  //會員商店代碼
	form.Add("ClientBackURL", clientBackURL) //ClientBackURL Client端返回廠商網址
	form.Add("CreditInstallment", "")        //CreditInstallment 刷卡分期期數
	form.Add("InstallmentAmount", "")        //InstallmentAmount 使用刷卡分期的付款金額
	form.Add("Redeem", "")                   //Redeem 信用卡是否使用紅利折抵
	form.Add("EncryptType", "1")             //CheckMacValue 簽章類型

	chk := getCheckMacValue(form)
	return chk
}

func handlerBuy(w http.ResponseWriter, r *http.Request) {
	id := time.Now().Format("20060102150405")
	date := time.Now().Format("2006/01/02 15:04:05")
	returnURL := "http://alantrue.ddns.net/OrderComplete"
	clientBackURL := "http://alantrue.ddns.net/demo"
	itemName := "100 STTW"
	price := "100"

	chk := createCheck(id, date, returnURL, clientBackURL, itemName, price)

	o := Order{
		MerchantID:        "2000132",
		MerchantTradeNo:   id,
		MerchantTradeDate: date,
		PaymentType:       "aio",
		TotalAmount:       price,
		TradeDesc:         "建立信用卡測試訂單",
		ItemName:          itemName,
		ReturnURL:         returnURL,
		ChoosePayment:     "Credit",
		StoreID:           "",
		ClientBackURL:     clientBackURL,
		CreditInstallment: "",
		InstallmentAmount: "",
		Redeem:            "",
		EncryptType:       "1",
		CheckMacValue:     chk,
	}

	b, err := json.Marshal(o)
	if err != nil {
		fmt.Println(err)
		return
	}

	w.Write(b)

	userID := r.FormValue("userId")
	packetHandler.Trade(userID, id)
}

/*
func handlerTest(w http.ResponseWriter, r *http.Request) {
	form := url.Values{}

	//id := time.Now().Format("20060102150405")
	//date := time.Now().Format("2006/01/02 15:04:05")

	form.Add("MerchantID", "2000132")                                                           //MerchantID 商店代號
	form.Add("MerchantTradeNo", "DX2017110400492145b7")                                         //MerchantTradeNo 商店交易編號
	form.Add("MerchantTradeDate", "2017/11/04 00:49:21")                                        //MerchantTradeDate 商店交易時間
	form.Add("PaymentType", "aio")                                                              //PaymentType 交易類型
	form.Add("TotalAmount", "5")                                                                //TotalAmount 交易金額
	form.Add("TradeDesc", "建立信用卡測試訂單")                                                          //TradeDesc 交易描述
	form.Add("ItemName", "MacBook 30元X2#iPhone6s 40元X1")                                        //ItemName 商品名稱
	form.Add("ReturnURL", "https://developers.allpay.com.tw/AioMock/MerchantReturnUrl")         //ReturnURL 付款完成通知回傳網址
	form.Add("ChoosePayment", "Credit")                                                         //ChoosePayment 預設付款方式
	form.Add("StoreID", "")                                                                     //會員商店代碼
	form.Add("ClientBackURL", "https://developers.allpay.com.tw/AioMock/MerchantClientBackUrl") //ClientBackURL Client端返回廠商網址
	form.Add("CreditInstallment", "")                                                           //CreditInstallment 刷卡分期期數
	form.Add("InstallmentAmount", "")                                                           //InstallmentAmount 使用刷卡分期的付款金額
	form.Add("Redeem", "")                                                                      //Redeem 信用卡是否使用紅利折抵
	form.Add("EncryptType", "1")                                                                //CheckMacValue 簽章類型

	chk := getCheckMacValue(form)
	form.Add("CheckMacValue", chk) //CheckMacValue 檢查碼

	resp, err := http.PostForm("https://payment-stage.allpay.com.tw/Cashier/AioCheckOut/V4", form)
	if err != nil {
		fmt.Println(err)
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}
	//fmt.Printf("%s", body)

	w.Write(body)

}
*/
func getCheckMacValue(form url.Values) string {
	v := "HashKey=5294y06JbISpM5x9&" + form.Encode() + "&HashIV=v77hoKGq4kWxNNIS"
	v = strings.ToLower(v)

	encodeTokens := map[string]string{
		"&":  "%26",
		"~":  "%7e",
		"@":  "%40",
		"#":  "%23",
		"$":  "%24",
		"^":  "%5e",
		"=":  "%3d",
		"+":  "%2b",
		";":  "%3b",
		"?":  "%3f",
		"/":  "%2f",
		"\\": "%5c",
		">":  "%3e",
		"<":  "%3c",
		"`":  "%60",
		"[":  "%5b",
		"]":  "%5d",
		"{":  "%7b",
		"}":  "%7d",
		":":  "%3a",
		"'":  "%27",
		"\"": "%22",
		",":  "%2c",
		"|":  "%7c",
	}

	for key, value := range encodeTokens {
		v = strings.Replace(v, key, value, -1)
	}

	replaceTokens := map[string]string{
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

	b := sha256.Sum256([]byte(v))

	v = fmt.Sprintf("%x\n", b)
	v = strings.ToUpper(v)

	fmt.Println(v)
	fmt.Println()

	return v
}
