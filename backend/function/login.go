package function

import (
	"database/sql"
	"encoding/json"
	"net/http"

	backend_db "github.com/BankLSK/database_project/backend/db"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

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

	// Parse credentials from request body
	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Query database for user
	var user struct {
		ID       int    `json:"customerid"`
		Username string `json:"username"`
		Password string `json:"password"`
		UserType string `json:"userType"` // Added to determine if admin or regular user
	}

	// Query Supabase to check credentials
	err := backend_db.DB.QueryRow(`
		SELECT customerid, username, password, 
		CASE WHEN email = 'admin@gmail.com' THEN 'admin' ELSE 'user' END as userType 
		FROM customer WHERE email = $1 AND password = $2`,
		creds.Email, creds.Password).Scan(&user.ID, &user.Username, &user.Password, &user.UserType)

	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email not found"})
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error: " + err.Error()})
		return
	}

	// Check password
	if user.Password != creds.Password {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Incorrect password"})
		return
	}

	// Return user info on successful login
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Login successful",
		"user": map[string]interface{}{
			"customerid": user.ID,
			"username":   user.Username,
			"userType":   user.UserType,
		},
	})
}
