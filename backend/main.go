package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/BankLSK/database_project/backend/db"
	"github.com/BankLSK/database_project/backend/function"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("backend/.env")

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL not set")
	}

	database, err := db.ConnectDB(dsn)
	if err != nil {
		log.Fatalf("DB connect error: %v", err)
	}
	defer database.Close()

	// Register routes
	http.HandleFunc("/signup", function.SignupHandler)
	http.HandleFunc("/login", function.LoginHandler) // (optional for future)

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
