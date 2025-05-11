package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	// "time"

	"github.com/joho/godotenv"

	backend_db "github.com/BankLSK/database_project/backend/db"

	_ "github.com/lib/pq"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

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

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Connected to Supabase DB via connection pooler!")

	err = backend_db.DisplayAllBooks(db)
	if err != nil {
		log.Fatalf("Error displaying books: %v", err)
	}

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
