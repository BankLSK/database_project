package main

import (
	"fmt"
	"log"
	"os"

	"github.com/BankLSK/database_project/backend/db"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load("backend/.env")
	if err != nil {
		log.Println("Warning: Error loading .env file, using environment variables")
	}

	// Get database connection string from environment variables
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	// Connect to the database
	database, err := db.ConnectDB(connStr)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer database.Close()

	// Print database version to verify connection
	var version string
	err = database.QueryRow("SELECT version()").Scan(&version)
	if err != nil {
		log.Fatalf("Failed to query database version: %v", err)
	}
	log.Printf("Connected to: %s", version)

	// Create the users table
	err = db.CreateUsersTable()
	if err != nil {
		log.Fatalf("Failed to create users table: %v", err)
	}

	// Insert some sample users
	users := []struct {
		name  string
		email string
	}{
		{"John Doe", "john@example.com"},
		{"Jane Smith", "jane@example.com"},
	}

	for _, u := range users {
		user, err := db.InsertUser(u.name, u.email)
		if err != nil {
			log.Printf("Failed to insert user %s: %v", u.name, err)
			continue
		}
		log.Printf("Inserted user: ID=%d, Name=%s, Email=%s, CreatedAt=%v",
			user.ID, user.Name, user.Email, user.CreatedAt)
	}

	// Retrieve all users
	allUsers, err := db.GetAllUsers()
	if err != nil {
		log.Fatalf("Failed to retrieve users: %v", err)
	}

	fmt.Println("\nAll Users:")
	for _, user := range allUsers {
		fmt.Printf("ID: %d, Name: %s, Email: %s, Created: %v\n",
			user.ID, user.Name, user.Email, user.CreatedAt)
	}
}
