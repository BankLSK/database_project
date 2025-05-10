package function

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/BankLSK/database_project/backend/db"
)

func SignupHandler(w http.ResponseWriter, r *http.Request) {
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
		return
	}

	customer := db.Customer{
		FirstName:  input.FirstName,
		MiddleName: sql.NullString{String: input.MiddleName, Valid: input.MiddleName != ""},
		LastName:   input.LastName,
		Email:      input.Email,
		Phone:      input.Phone,
		Address:    input.Address,
		Username:   input.Username,
		Password:   input.Password,
	}

	if _, err := db.InsertCustomer(customer); err != nil {
		http.Error(w, "Failed to create customer: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Customer signed up successfully")
}

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

// }
