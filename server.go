package main

import (
	"fmt"
	"html/template"
	"net/http"
)

func main() {
	fmt.Println("server starting")

	http.HandleFunc("/demo", handlerDemo)

	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", http.StripPrefix("/", fs))

	http.ListenAndServe(":9100", nil)
}

func handlerDemo(w http.ResponseWriter, r *http.Request) {
	t, _ := template.ParseFiles("view/demo.html")
	t.Execute(w, nil)
}
