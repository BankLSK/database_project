package db

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"
)

type Customer struct {
	CustomerID int64
	FirstName  string
	MiddleName sql.NullString
	LastName   string
	Email      string
	Phone      sql.NullString
	Address    sql.NullString
	Username   string
	Password   string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// // CREATE
// func CreateCustomerTable() error {
// 	query := `
// 	CREATE TABLE IF NOT EXISTS customer (
// 		customerid SERIAL PRIMARY KEY,
// 		firstname VARCHAR(255) NOT NULL,
// 		middlename VARCHAR(255),
// 		lastname VARCHAR(255) NOT NULL,
// 		email VARCHAR(255) NOT NULL,
// 		phone VARCHAR(50),
// 		address TEXT,
// 		username VARCHAR(255) NOT NULL,
// 		password VARCHAR(255) NOT NULL,
// 		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
// 		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
// 	)`
// 	_, err := DB.Exec(query)
// 	if err != nil {
// 		log.Printf("Failed to create customer table: %v", err)
// 		return fmt.Errorf("failed to create customer table: %w", err)
// 	}
// 	log.Println("Customer table created or already exists")
// 	return nil
// }

// INSERT
func InsertCustomer(c Customer) (Customer, error) {
	query := `
	INSERT INTO customer (
		firstname, middlename, lastname, email, phone, address, username, password
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING customerid, firstname, middlename, lastname, email, phone, address, username, password, created_at, updated_at`

	err := DB.QueryRow(query,
		c.FirstName, c.MiddleName, c.LastName, c.Email,
		c.Phone, c.Address, c.Username, c.Password,
	).Scan(
		&c.CustomerID, &c.FirstName, &c.MiddleName, &c.LastName, &c.Email,
		&c.Phone, &c.Address, &c.Username, &c.Password,
		&c.CreatedAt, &c.UpdatedAt,
	)

	if err != nil {
		log.Printf("Failed to insert customer %s %s: %v", c.FirstName, c.LastName, err)
		return Customer{}, fmt.Errorf("failed to insert customer: %w", err)
	}
	log.Printf("Inserted customer: ID=%d, Username=%s", c.CustomerID, c.Username)
	return c, nil
}

// READ by ID
func GetCustomerByID(id int64) (Customer, error) {
	var c Customer
	query := `
	SELECT customerid, firstname, middlename, lastname, email, phone, address, username, password, created_at, updated_at
	FROM customer WHERE customerid = $1`

	err := DB.QueryRow(query, id).Scan(
		&c.CustomerID, &c.FirstName, &c.MiddleName, &c.LastName, &c.Email,
		&c.Phone, &c.Address, &c.Username, &c.Password,
		&c.CreatedAt, &c.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No customer found with ID %d", id)
			return Customer{}, fmt.Errorf("no customer found with id %d", id)
		}
		log.Printf("Failed to query customer ID %d: %v", id, err)
		return Customer{}, fmt.Errorf("failed to query customer: %w", err)
	}

	// Pretty print manually
	fmt.Println("\nCustomer Details")
	fmt.Println(strings.Repeat("=", 50))
	fmt.Printf("ID          : %d\n", c.CustomerID)
	fmt.Printf("First Name  : %s\n", c.FirstName)
	fmt.Printf("Middle Name : %s\n", NullToDash(c.MiddleName))
	fmt.Printf("Last Name   : %s\n", c.LastName)
	fmt.Printf("Email       : %s\n", c.Email)
	fmt.Printf("Phone       : %s\n", NullToDash(c.Phone))
	fmt.Printf("Address     : %s\n", NullToDash(c.Address))
	fmt.Printf("Username    : %s\n", c.Username)
	fmt.Printf("Created At  : %s\n", c.CreatedAt.Format("2006-01-02 15:04"))
	fmt.Printf("Updated At  : %s\n", c.UpdatedAt.Format("2006-01-02 15:04"))
	fmt.Println(strings.Repeat("=", 50))
	log.Printf("Read ID: %d successfully", id)
	return c, nil
}

// READ all
func GetAllCustomers() ([]Customer, error) {
	query := `
	SELECT customerid, firstname, middlename, lastname, email, phone, address, username, password, created_at, updated_at
	FROM customer ORDER BY customerid`

	rows, err := DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query customers: %w", err)
	}
	defer rows.Close()

	var customers []Customer
	for rows.Next() {
		var c Customer
		if err := rows.Scan(
			&c.CustomerID, &c.FirstName, &c.MiddleName, &c.LastName, &c.Email,
			&c.Phone, &c.Address, &c.Username, &c.Password,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			log.Printf("Failed to scan customer row: %v", err)
			return nil, fmt.Errorf("failed to scan customer row: %w", err)
		}
		customers = append(customers, c)
	}
	if err := rows.Err(); err != nil {
		log.Printf("Error iterating customers: %v", err)
		return nil, fmt.Errorf("error iterating customers: %w", err)
	}
	log.Printf("Retrieved %d customer(s)", len(customers))
	// Pretty output
	fmt.Println("\nAll Customer Details:")
	fmt.Println(strings.Repeat("=", 160))
	fmt.Printf("%-5s %-12s %-15s %-15s %-25s %-15s %-25s %-15s %-20s %-20s\n",
		"ID", "First", "Middle", "Last", "Email", "Phone", "Address", "Username", "Created At", "Updated At")
	fmt.Println(strings.Repeat("-", 160))

	for _, c := range customers {
		middle := "-"
		if c.MiddleName.Valid {
			middle = c.MiddleName.String
		}
		phone := "-"
		if c.Phone.Valid {
			phone = c.Phone.String
		}
		address := "-"
		if c.Address.Valid {
			address = c.Address.String
		}

		fmt.Printf("%-5d %-12s %-15s %-15s %-25s %-15s %-25s %-15s %-20s %-20s\n",
			c.CustomerID, c.FirstName, middle, c.LastName,
			c.Email, phone, address, c.Username,
			c.CreatedAt.Format("2006-01-02 15:04"), c.UpdatedAt.Format("2006-01-02 15:04"))
	}
	fmt.Println(strings.Repeat("=", 160))
	log.Printf("Read all successfully")
	return customers, nil
}

// UPDATE
func UpdateCustomer(c Customer) error {
	query := `
	UPDATE customer
	SET firstname = $1, middlename = $2, lastname = $3, email = $4,
		phone = $5, address = $6, username = $7, password = $8,
		updated_at = CURRENT_TIMESTAMP
	WHERE customerid = $9`

	res, err := DB.Exec(query,
		c.FirstName, c.MiddleName, c.LastName, c.Email,
		c.Phone, c.Address, c.Username, c.Password,
		c.CustomerID,
	)
	if err != nil {
		log.Printf("Failed to update customer ID %d: %v", c.CustomerID, err)
		return fmt.Errorf("failed to update customer: %w", err)
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		log.Printf("No customer found with ID %d to update", c.CustomerID)
		return fmt.Errorf("no customer found with id %d", c.CustomerID)
	}
	log.Printf("Updated customer ID %d (%s)", c.CustomerID, c.Username)
	return nil
}

// DELETE
func DeleteCustomer(id int64) error {
	query := `DELETE FROM customer WHERE customerid = $1`
	res, err := DB.Exec(query, id)
	if err != nil {
		log.Printf("Failed to delete customer ID %d: %v", id, err)
		return fmt.Errorf("failed to delete customer: %w", err)
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		log.Printf("No customer found with ID %d to delete", id)
		return fmt.Errorf("no customer found with id %d", id)
	}
	log.Printf("Delete ID: %d successfully", id)
	return nil
}

// Helper to show "-" if NullString is not valid
func NullToDash(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return "-"
}
