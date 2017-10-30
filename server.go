package main

import (
	"html/template"
	"log"
	"net/http"
	"time"
)

func main() {
	log.Println("server starting")

	http.HandleFunc("/demo", handlerDemo)

	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", http.StripPrefix("/", fs))

	http.ListenAndServe(":9100", nil)
}

func handlerDemo(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("view/demo.html")
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
