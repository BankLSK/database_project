package function

import (
	"encoding/json"
	"fmt"
	"net/http"

	backend_db "github.com/BankLSK/database_project/backend/db"
)

// Request body for adding a new book
type AddBookRequest struct {
	Title       string  `json:"title"`
	ISBN        string  `json:"isbn"`
	AuthorName  string  `json:"author"`
	Publisher   string  `json:"publisher"`
	Category    string  `json:"category"`
	Language    string  `json:"language"`
	PublishYear int     `json:"publish_year"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
}

// AddBookHandler handles adding a new book via HTTP POST
func AddBookHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("AddBookHandler triggered")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AddBookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	book, err := backend_db.AddBookWithNames(
		backend_db.DB,
		req.Title,
		req.ISBN,
		req.AuthorName,
		req.Publisher,
		req.Category,
		req.Language,
		req.PublishYear,
		req.Quantity,
		req.Price,
	)

	if err != nil {
		fmt.Println("Failed to add book:", err)
		http.Error(w, "Failed to add book", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(book)
}
