package main

import (
	"crypto/sha256"
	"database/sql"
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
	_ "github.com/mattn/go-sqlite3"
)

type order struct {
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

type tradeInfo struct {
	Hash       string `json:"hash"`
	BN         uint32 `json:"bn"`
	Timestamp  uint32 `json:"timestamp"`
	AmountGet  string `json:"amountGet"`
	AmountGive string `json:"amountGive"`
	TokenGet   string `json:"tokenGet"`
	TokenGive  string `json:"tokenGive"`
	Get        string `json:"get"`
	Give       string `json:"give"`
}

var gPort = "80"
var gDb *sql.DB

func main() {
	log.Println("server starting")
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	var err error
	gDb, err = sql.Open("sqlite3", "solaExchange.db")
	defer gDb.Close()
	checkErr(err)

	go packetHandler.Do()

	http.HandleFunc("/WS", handlerWS)
	http.HandleFunc("/SolaExchange", handlerSolaExchange)
	http.HandleFunc("/SolaEasy", handlerSolaEasy)
	http.HandleFunc("/demo", handlerDemo)
	http.HandleFunc("/buy", handlerBuy)
	http.HandleFunc("/test", handlerTest)
	http.HandleFunc("/orderComplete", handlerOrderComplete)
	http.HandleFunc("/checkUsername", handlerCheckUsername)
	http.HandleFunc("/signUp", handlerSignUp)
	http.HandleFunc("/signIn", handlerSignIn)
	http.HandleFunc("/gatherAgent", handlerGatherAgent)
	http.HandleFunc("/gatherAgent/logTrade", handlerLogTrade)
	http.HandleFunc("/gatherAgent/getLastTrade", handlerGetLastTrade)
	http.HandleFunc("/gatherAgent/logBlockNumber", handlerLogBlockNumber)
	http.HandleFunc("/getTrade", handlerGetTrade)

	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", http.StripPrefix("/", fs))

	http.ListenAndServe(":"+gPort, nil)
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
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
		log.Println(id, tradeNo, tradeAmount)

		packetHandler.TradeComplete(id)
	} else {
		log.Println(r.Form)
	}

}

func handlerSolaExchange(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("view/solaExchange.html")
	if err != nil {
		log.Fatal(err)
	}

	data := struct {
		IP      string
		Port    string
		Uncache string
	}{
		IP:      "alantrue.ddns.net",
		Port:    gPort,
		Uncache: time.Now().Format("20060102150405"),
	}

	err = t.Execute(w, data)
	if err != nil {
		log.Fatal(err)
	}
}

func handlerSolaEasy(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("view/solaEasy.html")
	if err != nil {
		log.Fatal(err)
	}

	data := struct {
		IP      string
		Port    string
		Uncache string
	}{
		IP:      "alantrue.ddns.net",
		Port:    gPort,
		Uncache: time.Now().Format("20060102150405"),
	}

	err = t.Execute(w, data)
	if err != nil {
		log.Fatal(err)
	}
}

func handlerDemo(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("view/demo.html")
	if err != nil {
		log.Fatal(err)
	}

	data := struct {
		IP      string
		Port    string
		Uncache string
	}{
		IP:      "localhost", //"alantrue.ddns.net",
		Port:    gPort,
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

func handlerGatherAgent(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("view/gatherAgent.html")
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

func handlerLogTrade(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	info := []tradeInfo{}
	err := decoder.Decode(&info)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()
	log.Println(info)

	for _, v := range info {
		sqlCmd := fmt.Sprintf(`INSERT OR IGNORE INTO trade VALUES ('%v', %v, '%v', '%v', '%v', '%v', '%v', '%v');`,
			v.Hash, v.BN, v.TokenGet, v.TokenGive, v.AmountGet, v.AmountGive, v.Get, v.Give)

		_, err := gDb.Exec(sqlCmd)
		if err != nil {
			log.Println("handlerLogTrade Exec Error", err)
		}
	}

	w.Write([]byte("ok"))
}

func handlerGetLastTrade(w http.ResponseWriter, r *http.Request) {
	var blockNumber sql.NullInt64
	err := gDb.QueryRow("SELECT MAX(block_number) FROM trade").Scan(&blockNumber)
	switch {
	case err == sql.ErrNoRows:
		log.Fatal(err)
	case err != nil:
		log.Fatal(err)
	default:
		if blockNumber.Valid {
			w.Write([]byte(fmt.Sprintf(`{"blockNumber": %v}`, blockNumber.Int64)))
		} else {
			w.Write([]byte(`{"blockNumber": 0}`))
		}
	}
}

func handlerLogBlockNumber(w http.ResponseWriter, r *http.Request) {
	blockNumber := r.FormValue("blockNumber")
	timestamp := r.FormValue("timestamp")
	log.Println(blockNumber, timestamp)

	sqlCmd := fmt.Sprintf(`INSERT OR IGNORE INTO block VALUES (%v, %v);`, blockNumber, timestamp)

	_, err := gDb.Exec(sqlCmd)
	if err != nil {
		log.Println("handlerLogBlockNumber Exec Error", err)
	}

	w.Write([]byte("ok"))
}

func handlerGetTrade(w http.ResponseWriter, r *http.Request) {
	timestamp := r.FormValue("timestamp")

	rows, err := gDb.Query(fmt.Sprintf(
		`SELECT B.timestamp, A.transaction_hash, A.token_get, A.token_give, A.amount_get, A.amount_give, A.get, A.give FROM trade A 
	    LEFT JOIN block B ON A.block_number = B.number
	    WHERE B.timestamp IS NOT NULL AND timestamp > %v 
	    ORDER BY B.timestamp;`, timestamp))

	if err != nil {
		log.Println("Query Error", err)
	}
	defer rows.Close()

	trades := []tradeInfo{}
	for rows.Next() {
		var t tradeInfo
		if err := rows.Scan(&t.Timestamp, &t.Hash, &t.TokenGet, &t.TokenGive, &t.AmountGet, &t.AmountGive, &t.Get, &t.Give); err == nil {
			trades = append(trades, t)
		} else {
			log.Println("Scan Error", err)
		}
	}
	b, err := json.Marshal(trades)
	if err != nil {
		log.Println("Marshal Error", err)
	}

	w.Write(b)
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
	returnURL := "http://alantrue.ddns.net/orderComplete"
	clientBackURL := "http://alantrue.ddns.net/demo"
	itemName := "100 STTW"
	price := "100"

	chk := createCheck(id, date, returnURL, clientBackURL, itemName, price)

	o := order{
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
		log.Println(err)
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

func handlerCheckUsername(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")

	sqlCmd := fmt.Sprintf(`SELECT COUNT(username) FROM account WHERE username = '%[1]v'`, username)

	var count int64
	err := gDb.QueryRow(sqlCmd).Scan(&count)
	switch {
	case err == sql.ErrNoRows:
		log.Fatal(err)
	case err != nil:
		log.Fatal(err)
	default:
		if count == 0 {
			w.Write([]byte("true"))
		} else {
			w.Write([]byte("false"))
		}
	}
}

func handlerSignUp(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")
	password := r.FormValue("password")
	address := r.FormValue("address")
	privateKey := r.FormValue("privateKey")

	sqlCmd := fmt.Sprintf(`INSERT INTO account (username, password, address, private_key) VALUES ('%v', '%v', '%v', '%v');`, username, password, address, privateKey)

	_, err := gDb.Exec(sqlCmd)
	if err != nil {
		log.Println("handlerSignUp Exec Error", err)
		w.Write([]byte("false"))
	} else {
		w.Write([]byte("true"))
	}
}

func handlerSignIn(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")
	password := r.FormValue("password")

	sqlCmd := fmt.Sprintf(`SELECT private_key FROM account WHERE username = '%[1]v' AND password = '%[2]v'`, username, password)

	var privateKey string
	err := gDb.QueryRow(sqlCmd).Scan(&privateKey)
	switch {
	case err == sql.ErrNoRows:
		w.Write([]byte("false"))
	case err != nil:
		log.Fatal(err)
	default:
		w.Write([]byte(privateKey))
	}
}
