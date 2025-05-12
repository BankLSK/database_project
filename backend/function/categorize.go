package function

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	backend_db "github.com/BankLSK/database_project/backend/db"
)

func HandleGetBooksByCategory(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	if strings.TrimSpace(category) == "" {
		http.Error(w, "Missing category parameter", http.StatusBadRequest)
		return
	}

	books, err := backend_db.GetBooksByCategoryName(db, category)
	if err != nil {
		http.Error(w, "Failed to fetch books: "+err.Error(), http.StatusInternalServerError)
		log.Printf("Error fetching books by category %s: %v", category, err) // Log error
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}
