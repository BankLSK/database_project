package function

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

type Book struct {
	ID            int    `json:"id"`
	Title         string `json:"title"`
	ISBN          string `json:"isbn"`
	PublishedYear int    `json:"published_year"`
	Author        string `json:"author"`
	Publisher     string `json:"publisher"`
	Category      string `json:"category"`
	Language      string `json:"language"`
}

func GetBooksWithDetailsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		query := `
		SELECT
  		b.bookid,
  		b.title,
  		b.isbn,
  		b.publish_year,
  		a.authorname AS author,
  		p.publishername AS publisher,
  		c.categoryname AS category,
  		l.languagename AS language
		FROM book b
		JOIN author a ON b.authorid = a.authorid
		JOIN publisher p ON b.publisherid = p.publisherid
		JOIN category c ON b.categoryid = c.categoryid
		JOIN language l ON b.languageid = l.languageid;
		`

		rows, err := db.QueryContext(r.Context(), query)
		if err != nil {
			log.Printf("Database query error: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var books []Book
		for rows.Next() {
			var b Book
			if err := rows.Scan(&b.ID, &b.Title, &b.ISBN, &b.PublishedYear, &b.Author, &b.Publisher, &b.Category, &b.Language); err != nil {
				http.Error(w, "Scan error", http.StatusInternalServerError)
				return
			}
			books = append(books, b)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(books)
	}
}
