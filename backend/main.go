package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/BankLSK/database_project/backend/db"
	"github.com/BankLSK/database_project/backend/function"
	"github.com/gorilla/handlers"
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
	http.HandleFunc("/login", function.LoginHandler)
	http.HandleFunc("/confirmpurchase", function.ConfirmPurchaseHandler)
	http.HandleFunc("/addbook", function.AddBookHandler)
	http.HandleFunc("/api/admin/update-order-status", function.UpdateOrderStatusHandler)   //comfirm button on admin page
	http.HandleFunc("/api/admin/unprocessed-orders", function.GetUnprocessedOrdersHandler) // set latest order table
	http.HandleFunc("/getbooks", func(w http.ResponseWriter, r *http.Request) {
		function.HandleGetBooksByCategory(database, w, r)
	})
	http.HandleFunc("/books", function.GetBooksByTitleHandler)   // GET ?title=...
	http.HandleFunc("/books/update", function.UpdateBookHandler) // PUT
	http.HandleFunc("/books/delete", function.DeleteBookHandler) // DELETE ?id=...

	// Enable CORS
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}), // Allow all origins, adjust for security
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler(http.DefaultServeMux)))
}
