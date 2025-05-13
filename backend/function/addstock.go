package function

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	backend_db "github.com/BankLSK/database_project/backend/db"
)

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

func AddBookHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("AddBookHandler triggered")
	setCORSHeaders(w, "POST, OPTIONS")

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
		http.Error(w, `{"error":"Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	book, err := backend_db.AddBookWithNames(
		backend_db.DB,
		req.Title, req.ISBN, req.AuthorName,
		req.Publisher, req.Category, req.Language,
		req.PublishYear, req.Quantity, req.Price,
	)
	if err != nil {
		fmt.Println("Failed to add book:", err)
		http.Error(w, `{"error": "Failed to add book"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(book)
}

// func GetBooksByTitleHandler(w http.ResponseWriter, r *http.Request) {
// 	fmt.Println("GetBooksByTitleHandler triggered")
// 	setCORSHeaders(w, "GET, OPTIONS")

// 	if r.Method == http.MethodOptions {
// 		w.WriteHeader(http.StatusOK)
// 		return
// 	}

// 	if r.Method != http.MethodGet {
// 		http.Error(w, "Only GET allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	title := r.URL.Query().Get("title")
// 	if title == "" {
// 		http.Error(w, `{"error":"Missing title parameter"}`, http.StatusBadRequest)
// 		return
// 	}

// 	books, err := backend_db.GetBooksByTitle(backend_db.DB, title)
// 	if err != nil {
// 		http.Error(w, `{"error":"Failed to fetch books"}`, http.StatusInternalServerError)
// 		return
// 	}

// 	json.NewEncoder(w).Encode(books)
// }

type UpdateBookRequest struct {
	BookID      int     `json:"bookid"`
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

func UpdateBookHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("UpdateBookHandler triggered")
	setCORSHeaders(w, "PUT, OPTIONS")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPut {
		http.Error(w, "Only PUT allowed", http.StatusMethodNotAllowed)
		return
	}

	var book UpdateBookRequest
	if err := json.NewDecoder(r.Body).Decode(&book); err != nil {
		fmt.Println("Error decoding request body:", err)
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if book.BookID == 0 {
		http.Error(w, `{"error":"Book ID is required"}`, http.StatusBadRequest)
		return
	}

	fmt.Printf("Attempting to update book ID %d\n", book.BookID)

	updatedBook, err := backend_db.UpdateBook(
		backend_db.DB,
		book.BookID,
		book.Title,
		book.ISBN,
		book.AuthorName,
		book.Publisher,
		book.Category,
		book.Language,
		book.PublishYear,
		book.Quantity,
		book.Price,
	)

	if err != nil {
		// Handle no book updated (custom error string check from db logic)
		if err.Error() == fmt.Sprintf("no book updated (possibly wrong bookid: %d)", book.BookID) {
			fmt.Println("No book found to update")
			http.Error(w, `{"error":"Book not found"}`, http.StatusNotFound)
			return
		}

		// Any other database error
		fmt.Println("Error updating book in database:", err)
		http.Error(w, `{"error":"Failed to update book"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedBook)
}

func DeleteBookHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("DeleteBookHandler triggered")
	setCORSHeaders(w, "DELETE, OPTIONS")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodDelete {
		http.Error(w, "Only DELETE allowed", http.StatusMethodNotAllowed)
		return
	}

	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, `{"error":"Missing book ID"}`, http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"Invalid book ID"}`, http.StatusBadRequest)
		return
	}

	if err := backend_db.DeleteBook(backend_db.DB, id); err != nil {
		http.Error(w, `{"error":"Failed to delete book"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": fmt.Sprintf("Book with ID %d deleted successfully", id)})
}

// Utility function to set common CORS headers
func setCORSHeaders(w http.ResponseWriter, methods string) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", methods)
	w.Header().Set("Content-Type", "application/json")
}
