package function

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	backend_db "github.com/BankLSK/database_project/backend/db"
)

type PurchaseRequest struct {
	CustomerID    int64                         `json:"customerid"`
	OrderID       int64                         `json:"orderid"`
	Items         []backend_db.OrderDetailsItem `json:"items"`
	PaymentMethod string                        `json:"paymentmethod"` // add the payment method
}

func ConfirmPurchaseHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	fmt.Println("ConfirmPurchaseHandler triggered")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")

	// Handle preflight request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PurchaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("Decode error:", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Check if customer exists in the customers table
	var exists bool
	query := "SELECT EXISTS(SELECT 1 FROM customer WHERE customerid = $1)"
	err := backend_db.DB.QueryRow(query, req.CustomerID).Scan(&exists)
	if err != nil || !exists {
		fmt.Println("Invalid customerid:", req.CustomerID)
		http.Error(w, "Invalid customerid", http.StatusBadRequest)
		return
	}

	// set default (Credit Card, PayPal)
	paymentMethod := req.PaymentMethod
	if paymentMethod == "" {
		paymentMethod = "Credit Card" // default value
	}

	// Create the order first and get the OrderID
	orderData := backend_db.Ordersss{
		CustomerID:    req.CustomerID,
		OrderDate:     time.Now(), // Add order date as current time
		TotalAmount:   0,          // Initial value, will update after adding items
		PaymentMethod: sql.NullString{String: paymentMethod, Valid: true},
	}

	order, err := backend_db.InsertOrder(orderData) // Insert the main order first
	if err != nil {
		fmt.Println("Error inserting order:", err)
		http.Error(w, "Failed to create order", http.StatusInternalServerError)
		return
	}

	// Initialize a variable to calculate the total amount of the order
	var totalAmount float64

	// Insert each item into the order_details table
	for _, item := range req.Items {
		// Validate if the book exists in the book table
		var exists bool
		query := "SELECT EXISTS(SELECT 1 FROM book WHERE bookid = $1)"
		err := backend_db.DB.QueryRow(query, item.BookID).Scan(&exists)
		if err != nil || !exists {
			fmt.Println("Invalid bookid:", item.BookID)
			http.Error(w, "Invalid bookid", http.StatusBadRequest)
			return
		}

		// Fetch current quantity of the book
		var currentQuantity int
		err = backend_db.DB.QueryRow("SELECT quantity FROM book WHERE bookid = $1", item.BookID).Scan(&currentQuantity)
		if err != nil {
			fmt.Println("Failed to fetch book quantity:", err)
			http.Error(w, "Failed to fetch book quantity", http.StatusInternalServerError)
			return
		}

		// Check if enough stock is available
		if int64(currentQuantity) < item.Quantity {
			http.Error(w, "Not enough stock available for book ID "+fmt.Sprintf("%d", item.BookID), http.StatusBadRequest)
			return
		}

		// Update the book quantity in the database
		_, err = backend_db.DB.Exec(`
			UPDATE book
			SET quantity = quantity - $1
			WHERE bookid = $2
		`, item.Quantity, item.BookID)
		if err != nil {
			fmt.Println("Failed to update book quantity:", err)
			http.Error(w, "Failed to update book quantity", http.StatusInternalServerError)
			return
		}

		// Create the order details entry
		orderDetail := backend_db.OrdersDetails{
			CustomerID: req.CustomerID,
			OrderID:    order.OrderID, // Use the order ID from the main order
			BookID:     item.BookID,
			Quantity:   item.Quantity,
			UnitPrice:  item.UnitPrice,
			SubTotal:   float64(item.Quantity) * item.UnitPrice,
		}

		// Insert the order details into the database
		_, err = backend_db.InsertOrderDetails(orderDetail)
		if err != nil {
			fmt.Println("InsertOrderDetails error:", err)
			http.Error(w, "Failed to insert order detail", http.StatusInternalServerError)
			return
		}

		// Add the item subtotal to the total amount
		totalAmount += orderDetail.SubTotal
	}

	// After inserting all items, update the total amount in the main order
	order.TotalAmount = totalAmount
	_, err = backend_db.UpdateOrderTotalAmount(order)
	if err != nil {
		fmt.Println("Failed to update order total:", err)
		http.Error(w, "Failed to update order total", http.StatusInternalServerError)
		return
	}

	// After inserting the items and updating the total, return the successful response
	w.WriteHeader(http.StatusCreated)
	fmt.Println("Order confirmed successfully!")
}
