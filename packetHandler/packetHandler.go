package packetHandler

import (
	"encoding/json"
	"fmt"
	"log"

	simplejson "github.com/bitly/go-simplejson"
	"github.com/gorilla/websocket"
)

type packet struct {
	Opcode  string `json:"opcode"`
	Content string `json:"content"`
}

type client struct {
	ID     string
	Conn   *websocket.Conn
	Trades map[string]bool
}

type notify struct {
	ID     string
	Result []byte
}

type trade struct {
	ID      string
	TradeNo string
}

var allClient = map[string]client{}
var joins = make(chan client)
var leaves = make(chan string)
var notifys = make(chan notify)
var trades = make(chan trade)
var tradeComplete = make(chan string)

func Join(id string, c *websocket.Conn) {
	joins <- client{ID: id, Conn: c, Trades: map[string]bool{}}
}

func Leave(id string) {
	leaves <- id
}

func Notify(id string, result []byte) {
	notifys <- notify{ID: id, Result: result}
}

func Trade(id, tradeNo string) {
	trades <- trade{ID: id, TradeNo: tradeNo}
}

func TradeComplete(tradeNo string) {
	tradeComplete <- tradeNo
}

func Do() {
	go func() {
		for {
			select {
			case join := <-joins:
				fmt.Println("join", join.ID)
				allClient[join.ID] = join
				p := packet{Opcode: "OP_INIT", Content: fmt.Sprintf(`{"userID": "%s"}`, join.ID)}

				b, err := json.Marshal(p)
				if err != nil {
					log.Println(err)
					return
				}
				join.Conn.WriteMessage(websocket.TextMessage, b)

			case leave := <-leaves:
				fmt.Println("leave", leave)
				delete(allClient, leave)

			case notify := <-notifys:
				if client, ok := allClient[notify.ID]; ok {
					client.Conn.WriteMessage(websocket.TextMessage, notify.Result)
				}
			case trade := <-trades:
				if client, ok := allClient[trade.ID]; ok {
					client.Trades[trade.TradeNo] = false
				}
			case tradeNo := <-tradeComplete:
				for _, client := range allClient {
					if result, ok := client.Trades[tradeNo]; ok {
						if result == false {
							client.Trades[tradeNo] = true

							p := packet{Opcode: "OP_TRADE_OK", Content: `{"msg": "交易成功"}`}

							b, err := json.Marshal(p)
							if err != nil {
								log.Println(err)
								return
							}
							client.Conn.WriteMessage(websocket.TextMessage, b)
						} else {
							fmt.Println("complete again")
						}
					}
				}
			}
		}
	}()
}

//HandlePacket ...
func HandlePacket(c *websocket.Conn, mt int, js *simplejson.Json) {
	opcode, err := js.Get("opcode").String()
	if err != nil {
		log.Println(err.Error())
		return
	}

	_, err = js.Get("content").Encode()
	if err != nil {
		log.Println(err.Error())
		return
	}

	switch opcode {
	default:
		log.Printf("handle packet: unknown opcode: " + opcode)
	}
}
