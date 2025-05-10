package db

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"
)

// Order represents the order entity.
type order struct {
	OrderID       int64
	OrderDate     time.Time
	CustomerID    int64
	TotalAmount   float64
	PaymentMethod sql.NullString
	PaymentStatus sql.NullString
	OrderStatus   sql.NullString
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// // CreateOrderTable creates the orders table if it doesn't exist.
// func CreateOrderTable() error {
// 	query := `
// 	CREATE TABLE IF NOT EXISTS "order" (
// 		orderid SERIAL PRIMARY KEY,
// 		orderdate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
// 		customerid INT NOT NULL REFERENCES customer(customerid) ON DELETE CASCADE,
// 		totalamount NUMERIC(10,2) NOT NULL,
// 		paymentmethod VARCHAR(50),
// 		paymentstatus VARCHAR(50),
// 		orderstatus VARCHAR(50),
// 		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
// 		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
// 	)`
// 	_, err := DB.Exec(query)
// 	if err != nil {
// 		return fmt.Errorf("failed to create orders table: %w", err)
// 	}
// 	log.Println("✅ Orders table created (with FK to customer)")
// 	return nil
// }

// InsertOrder inserts a new order into the database.
func InsertOrder(o order) (order, error) {
	query := `
	INSERT INTO orders (customerid, orderdate, paymentmethod, paymentstatus, orderstatus, totalamount)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING orderid, customerid, orderdate, paymentmethod, paymentstatus, orderstatus, totalamount, created_at, updated_at`

	err := DB.QueryRow(query,
		o.CustomerID, o.OrderDate, o.PaymentMethod, o.PaymentStatus, o.OrderStatus, o.TotalAmount,
	).Scan(
		&o.OrderID, &o.CustomerID, &o.OrderDate, &o.PaymentMethod, &o.PaymentStatus, &o.OrderStatus,
		&o.TotalAmount, &o.CreatedAt, &o.UpdatedAt,
	)

	if err != nil {
		log.Printf("Failed to insert order: %v", err)
		return order{}, fmt.Errorf("failed to insert order: %w", err)
	}
	log.Printf("Inserted order ID %d for customer %d", o.OrderID, o.CustomerID)
	return o, nil
}

// GetOrderByID
func GetOrderByID(id int64) (order, error) {
	var o order
	query :=`
	SELECT orderid, customerid, orderdate, paymentmethod, paymentstatus, orderstatus, totalamount, created_at, updated_at
	FROM "order" WHERE orderid = $1`

	err := DB.QueryRow(query, id).Scan(
		&o.OrderID, &o.CustomerID, &o.OrderDate,
		&o.PaymentMethod, &o.PaymentStatus, &o.OrderStatus,
		&o.TotalAmount, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No order found with ID %d", id)
			return order{}, fmt.Errorf("no order found with id %d", id)
		}
		log.Printf("Failed to fetch order ID %d: %v", id, err)
		return order{}, fmt.Errorf("failed to query order: %w", err)
	}

	fmt.Println("\n🧾 Order Details")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("ID            : %d\n", o.OrderID)
	fmt.Printf("Customer ID   : %d\n", o.CustomerID)
	fmt.Printf("Order Date    : %s\n", o.OrderDate.Format("2006-01-02 15:04"))
	fmt.Printf("Payment Method: %s\n", NullToDash(o.PaymentMethod))
	fmt.Printf("Payment Status: %s\n", NullToDash(o.PaymentStatus))
	fmt.Printf("Order Status  : %s\n", NullToDash(o.OrderStatus))
	fmt.Printf("Total Amount  : %.2f\n", o.TotalAmount)
	fmt.Printf("Created At    : %s\n", o.CreatedAt.Format("2006-01-02 15:04"))
	fmt.Printf("Updated At    : %s\n", o.UpdatedAt.Format("2006-01-02 15:04"))
	fmt.Println(strings.Repeat("=", 60))

	log.Printf("Retrieved order ID %d", id)
	return o, nil
}

// GetAllOrder
func GetAllOrders() ([]order, error) {
	query := `
	SELECT orderid, customerid, orderdate, paymentmethod, paymentstatus, orderstatus, totalamount, created_at, updated_at
	FROM "order" ORDER BY orderid`

	rows, err := DB.Query(query)
	if err != nil {
		log.Printf("Failed to query orders: %v", err)
		return nil, fmt.Errorf("failed to query orders: %w", err)
	}
	defer rows.Close()

	var orders []order
	for rows.Next() {
		var o order
		if err := rows.Scan(
			&o.OrderID, &o.CustomerID, &o.OrderDate,
			&o.PaymentMethod, &o.PaymentStatus, &o.OrderStatus,
			&o.TotalAmount, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			log.Printf("Failed to scan order row: %v", err)
			return nil, fmt.Errorf("failed to scan order row: %w", err)
		}
		orders = append(orders, o)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error iterating orders: %v", err)
		return nil, fmt.Errorf("error iterating orders: %w", err)
	}

	// 🖨️ Pretty output
	fmt.Println("\n📦 All Orders:")
	fmt.Println(strings.Repeat("=", 140))
	fmt.Printf("%-5s %-10s %-20s %-20s %-15s %-15s %-12s %-20s %-20s\n",
		"ID", "Cust.ID", "Order Date", "Pay Method", "Pay Status", "Order Status", "Amount", "Created At", "Updated At")
	fmt.Println(strings.Repeat("-", 140))

	for _, o := range orders {
		fmt.Printf("%-5d %-10d %-20s %-20s %-15s %-15s %-12.2f %-20s %-20s\n",
			o.OrderID,
			o.CustomerID,
			o.OrderDate.Format("2006-01-02 15:04"),
			NullToDash(o.PaymentMethod),
			NullToDash(o.PaymentStatus),
			NullToDash(o.OrderStatus),
			o.TotalAmount,
			o.CreatedAt.Format("2006-01-02 15:04"),
			o.UpdatedAt.Format("2006-01-02 15:04"))
	}
	fmt.Println(strings.Repeat("=", 140))

	log.Printf("Retrieved %d order(s) successfully", len(orders))
	return orders, nil
}

// // UpdateOrder updates an existing order's details.
// func UpdateOrder(o Order) error {
// 	query := 
// 	UPDATE orders
// 	SET customerid = $1,
// 		orderdate = $2,
// 		paymentmethod = $3,
// 		paymentstatus = $4,
// 		orderstatus = $5,
// 		totalamount = $6,
// 		updated_at = CURRENT_TIMESTAMP
// 	WHERE orderid = $7

// 	res, err := DB.Exec(query,
// 		o.CustomerID, o.OrderDate, o.PaymentMethod,
// 		o.PaymentStatus, o.OrderStatus, o.TotalAmount, o.OrderID,
// 	)
// 	if err != nil {
// 		log.Printf("❌ Failed to update order ID %d: %v", o.OrderID, err)
// 		return fmt.Errorf("failed to update order: %w", err)
// 	}

// 	rowsAffected, _ := res.RowsAffected()
// 	if rowsAffected == 0 {
// 		log.Printf("⚠️  No order found with ID %d", o.OrderID)
// 		return fmt.Errorf("no order found with id %d", o.OrderID)
// 	}
// 	log.Printf("✅ Updated order ID %d", o.OrderID)
// 	return nil
// }

// // DeleteOrder deletes an order by its ID.
// func DeleteOrder(id int64) error {
// 	query := DELETE FROM orders WHERE orderid = $1
// 	res, err := DB.Exec(query, id)
// 	if err != nil {
// 		log.Printf("❌ Failed to delete order ID %d: %v", id, err)
// 		return fmt.Errorf("failed to delete order: %w", err)
// 	}

// 	rowsAffected, _ := res.RowsAffected()
// 	if rowsAffected == 0 {
// 		log.Printf("⚠️  No order found with ID %d", id)
// 		return fmt.Errorf("no order found with id %d", id)
// 	}

// 	log.Printf("✅ Deleted order ID %d", id)
// 	return nil
// }