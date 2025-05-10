package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

// DB connection instance
var DB *sql.DB

// User represents a user in our system
type User struct {
	ID        int64
	Name      string
	Email     string
	CreatedAt time.Time
}

// ConnectDB establishes connection to the Supabase PostgreSQL database
func ConnectDB(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Test the connection
	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to the database: %v", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	DB = db
	return db, nil
}

// CreateUsersTable creates a new users table if it doesn't exist
func CreateUsersTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	)`

	_, err := DB.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create users table: %v", err)
	}

	log.Println("Users table created or already exists")
	return nil
}

// InsertUser adds a new user to the database
func InsertUser(name, email string) (User, error) {
	var user User
	
	query := `
	INSERT INTO users (name, email)
	VALUES ($1, $2)
	RETURNING id, name, email, created_at`

	err := DB.QueryRow(query, name, email).Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt)
	if err != nil {
		return User{}, fmt.Errorf("failed to insert user: %v", err)
	}

	return user, nil
}

// GetUserByID retrieves a user by their ID
func GetUserByID(id int64) (User, error) {
	var user User
	
	query := `SELECT id, name, email, created_at FROM users WHERE id = $1`
	
	err := DB.QueryRow(query, id).Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return User{}, fmt.Errorf("no user found with id %d", id)
		}
		return User{}, fmt.Errorf("failed to query user: %v", err)
	}
	
	return user, nil
}

// GetAllUsers retrieves all users from the database
func GetAllUsers() ([]User, error) {
	var users []User
	
	query := `SELECT id, name, email, created_at FROM users ORDER BY id`
	
	rows, err := DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %v", err)
	}
	defer rows.Close()
	
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan user row: %v", err)
		}
		users = append(users, user)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %v", err)
	}
	
	return users, nil
}