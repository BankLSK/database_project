package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	// "time"

	"github.com/joho/godotenv"

	backend_db "github.com/BankLSK/database_project/backend/db"

	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load("backend/.env") // or simply godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Assign DB to global DB object in db package
	backend_db.DB = db
	http.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {
		// CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
			return
		}

		// Step 1: Decode into raw struct
		var input struct {
			FirstName  string `json:"firstname"`
			MiddleName string `json:"middlename"`
			LastName   string `json:"lastname"`
			Email      string `json:"email"`
			Phone      string `json:"phone"`
			Address    string `json:"address"`
			Username   string `json:"username"`
			Password   string `json:"password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			fmt.Println("JSON decode error:", err)
			return
		}

		// Step 2: Convert to DB struct
		customer := backend_db.Customer{
			FirstName:  input.FirstName,
			MiddleName: sql.NullString{String: input.MiddleName, Valid: input.MiddleName != ""},
			LastName:   input.LastName,
			Email:      input.Email,
			Phone:      input.Phone,
			Address:    input.Address,
			Username:   input.Username,
			Password:   input.Password,
		}

		// Insert into DB
		_, err := backend_db.InsertCustomer(customer)
		if err != nil {
			http.Error(w, "Error inserting customer: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		fmt.Fprintln(w, "Customer signed up successfully")

	})

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

	// err = backend_db.DisplayAllBooks(db)
	// if err != nil {
	// 	log.Fatalf("Error displaying books: %v", err)
	// }

	// //=============================customer testing==================================

	// backend_db.GetAllCustomers()

	// newCustomer := backend_db.Customer{
	//     FirstName:  "Itachi_insert_test",
	//     MiddleName: sql.NullString{String: "", Valid: false},
	//     LastName:   "Uchiha",
	//     Email:      "itachi_inserttest@konoha.jp",
	//     Phone:      sql.NullString{String: "01155667788", Valid: true},
	//     Address:    sql.NullString{String: "Uchiha District", Valid: true},
	//     Username:   "itachi_uchiha_inserttest",
	//     Password:   "sharingan123",
	// }
	// backend_db.InsertCustomer(newCustomer)

	// customer, _ := backend_db.GetCustomerByID(203)
	// customer.MiddleName = sql.NullString{String: "Middle Name", Valid: true}
	// customer.Username = "gon_update"
	// backend_db.UpdateCustomer(customer)

	// backend_db.GetCustomerByID(203)

	// backend_db.GetCustomerByID(3)

	// backend_db.DeleteCustomer(28)

	// // =============================order testing==================================
	// // backend_db.GetAllOrders()
	// // backend_db.GetOrderByID(1)

	// // newOrder := backend_db.ordersss{
	// //     CustomerID:    1, // Use a valid existing customer ID
	// //     OrderDate:     time.Now(),
	// //     TotalAmount:   149.99,
	// //     PaymentMethod: sql.NullString{String: "Credit Card", Valid: true},
	// //     PaymentStatus: sql.NullString{String: "Paid", Valid: true},
	// //     OrderStatus:   sql.NullString{String: "Shipped", Valid: true},
	// // }
	// // backend_db.InsertOrder(newOrder)

}
