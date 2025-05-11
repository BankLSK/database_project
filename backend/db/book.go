package db

import (
	"database/sql"
	"fmt"
	"log"
	"strings"

	_ "github.com/lib/pq"
)

// Book represents a book entity from the database
type Book struct {
	BookID       int
	Title        string
	ISBN         string
	AuthorID     int
	PublisherID  int
	PublishYear  int
	CategoryID   int
	Quantity     int
	Price        float64
	LanguageID   int
}

// INSERT
func InsertBook(db *sql.DB, b Book) (Book, error) {
	query := `
	INSERT INTO book (title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price, languageid)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	RETURNING bookid, title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price, languageid`

	err := db.QueryRow(query,
		b.Title, b.ISBN, b.AuthorID, b.PublisherID, b.PublishYear,
		b.CategoryID, b.Quantity, b.Price, b.LanguageID,
	).Scan(
		&b.BookID, &b.Title, &b.ISBN, &b.AuthorID, &b.PublisherID, &b.PublishYear,
		&b.CategoryID, &b.Quantity, &b.Price, &b.LanguageID,
	)

	if err != nil {
		log.Printf("Failed to insert book '%s': %v", b.Title, err)
		return Book{}, fmt.Errorf("failed to insert book: %w", err)
	}
	log.Printf("Inserted book ID=%d | Title=%s | Price=%.2f", b.BookID, b.Title, b.Price)
	return b, nil
}


// GetAllBooks
func GetAllBooks(db *sql.DB) ([]Book, error) {
	rows, err := db.Query(`
		SELECT bookid, title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price, languageid
		FROM book`)
	if err != nil {
		return nil, fmt.Errorf("failed to query books: %w", err)
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var b Book
		err := rows.Scan(&b.BookID, &b.Title, &b.ISBN, &b.AuthorID, &b.PublisherID,
			&b.PublishYear, &b.CategoryID, &b.Quantity, &b.Price, &b.LanguageID)
		if err != nil {
			return nil, fmt.Errorf("failed to scan book: %w", err)
		}
		books = append(books, b)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error after iterating rows: %w", err)
	}

	fmt.Println("\nBOOK CATALOG")
	fmt.Println(strings.Repeat("=", 130))
	fmt.Printf("%-5s %-25s %-15s %-10s %-12s %-14s %-12s %-10s %-10s %-10s\n",
		"ID", "Title", "ISBN", "AuthorID", "PublisherID", "Year", "CategoryID", "Qty", "Price", "LangID")
	fmt.Println(strings.Repeat("-", 130))

	for _, b := range books {
		title := b.Title
		if len(title) > 24 {
			title = title[:21] + "..."
		}
		fmt.Printf("%-5d %-25s %-15s %-10d %-12d %-14d %-12d %-10d %-10.2f %-10d\n",
			b.BookID, title, b.ISBN, b.AuthorID, b.PublisherID, b.PublishYear,
			b.CategoryID, b.Quantity, b.Price, b.LanguageID)
	}
	fmt.Println(strings.Repeat("=", 130))
	fmt.Printf("Total books retrieved: %d\n\n", len(books))

	log.Printf("Retrieved %d book(s) from the database", len(books))
	return books, nil
}

// GetBookByID
func GetBookByID(db *sql.DB, id int) (Book, error) {
	var b Book
	query := `
		SELECT bookid, title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price, languageid
		FROM book WHERE bookid = $1`

	err := db.QueryRow(query, id).Scan(
		&b.BookID, &b.Title, &b.ISBN, &b.AuthorID, &b.PublisherID,
		&b.PublishYear, &b.CategoryID, &b.Quantity, &b.Price, &b.LanguageID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No book found with ID %d", id)
			return Book{}, fmt.Errorf("book with ID %d not found", id)
		}
		log.Printf("Failed to fetch book ID %d: %v", id, err)
		return Book{}, fmt.Errorf("failed to get book: %w", err)
	}

	fmt.Println("\nBook Details")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("ID          : %d\n", b.BookID)
	fmt.Printf("Title       : %s\n", b.Title)
	fmt.Printf("ISBN        : %s\n", b.ISBN)
	fmt.Printf("Author ID   : %d\n", b.AuthorID)
	fmt.Printf("Publisher ID: %d\n", b.PublisherID)
	fmt.Printf("Publish Year: %d\n", b.PublishYear)
	fmt.Printf("Category ID : %d\n", b.CategoryID)
	fmt.Printf("Quantity    : %d\n", b.Quantity)
	fmt.Printf("Price       : %.2f\n", b.Price)
	fmt.Printf("Language ID : %d\n", b.LanguageID)
	fmt.Println(strings.Repeat("=", 60))

	log.Printf("Book ID %d fetched successfully", id)
	return b, nil
}

// UPDATE
func UpdateBook(db *sql.DB, b Book) error {
	query := `
		UPDATE book
		SET title = $1, isbn = $2, authorid = $3, publisherid = $4,
		    publish_year = $5, categoryid = $6, quantity = $7, price = $8, languageid = $9
		WHERE bookid = $10`

	res, err := db.Exec(query,
		b.Title, b.ISBN, b.AuthorID, b.PublisherID, b.PublishYear,
		b.CategoryID, b.Quantity, b.Price, b.LanguageID, b.BookID,
	)
	if err != nil {
		log.Printf("Failed to update book ID %d: %v", b.BookID, err)
		return fmt.Errorf("failed to update book: %w", err)
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		log.Printf("No book found with ID %d to update", b.BookID)
		return fmt.Errorf("no book with ID %d to update", b.BookID)
	}

	log.Printf("Book ID %d updated successfully", b.BookID)
	return nil
}

// DELETE
func DeleteBook(db *sql.DB, id int) error {
	res, err := db.Exec("DELETE FROM book WHERE bookid = $1", id)
	if err != nil {
		log.Printf("Failed to delete book ID %d: %v", id, err)
		return fmt.Errorf("failed to delete book: %w", err)
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		log.Printf("No book found with ID %d to delete", id)
		return fmt.Errorf("no book with ID %d to delete", id)
	}

	log.Printf("Book ID %d deleted successfully", id)
	return nil
}
