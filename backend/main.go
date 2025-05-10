package main

import (
	"database/sql"
	// "fmt"
	"log"
	"os"
	// "time"

	backend_db "github.com/BankLSK/database_project/backend/db"
	"github.com/joho/godotenv"

	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load("backend/.env")
	if err != nil {
		log.Println("Warning: .env not loaded, falling back to OS environment")
	}

	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL not set")
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	database, err := backend_db.ConnectDB(connStr)
	if err != nil {
		log.Fatalf("Failed to connect DB: %v", err)
	}
	defer database.Close()

	var version string
	if err := database.QueryRow("SELECT version()").Scan(&version); err != nil {
		log.Fatalf("Failed to get DB version: %v", err)
	}
	log.Printf("Connected to: %s", version)

	//=============================customer testing==================================

	backend_db.GetAllCustomers()

	newCustomer := backend_db.Customer{
	    FirstName:  "Itachi_insert_test",
	    MiddleName: sql.NullString{String: "", Valid: false},
	    LastName:   "Uchiha",
	    Email:      "itachi_inserttest@konoha.jp",
	    Phone:      sql.NullString{String: "01155667788", Valid: true},
	    Address:    sql.NullString{String: "Uchiha District", Valid: true},
	    Username:   "itachi_uchiha_inserttest",
	    Password:   "sharingan123",
	}
	backend_db.InsertCustomer(newCustomer)

	customer, _ := backend_db.GetCustomerByID(203)
	customer.MiddleName = sql.NullString{String: "Middle Name", Valid: true}
	customer.Username = "gon_update"
	backend_db.UpdateCustomer(customer)

	backend_db.GetCustomerByID(203)

	backend_db.GetCustomerByID(3)

	backend_db.DeleteCustomer(28)

	// =============================order testing==================================
	// backend_db.GetAllOrders()
    // backend_db.GetOrderByID(1)

    // newOrder := backend_db.order{
    //     CustomerID:    1, // Use a valid existing customer ID
    //     OrderDate:     time.Now(),
    //     TotalAmount:   149.99,
    //     PaymentMethod: sql.NullString{String: "Credit Card", Valid: true},
    //     PaymentStatus: sql.NullString{String: "Paid", Valid: true},
    //     OrderStatus:   sql.NullString{String: "Shipped", Valid: true},
    // }

    // backend_db.InsertOrder(newOrder)


}
