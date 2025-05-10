package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

// Book represents a book entity from the database
type Book struct {
	bookid       int
	title        string
	isbn         string
	authorid     int
	publisherid  int
	publish_year int
	categoryid   int
	quantity     int
	price        float64
}

// GetAllBooks fetches all books from the database
func GetAllBooks(db *sql.DB) ([]Book, error) {
	// Query to get all books
	rows, err := db.Query("SELECT bookid, title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price FROM book")
	if err != nil {
		return nil, fmt.Errorf("failed to query book: %v", err)
	}
	defer rows.Close()

	// Prepare slice to hold results
	var books []Book

	// Process each row
	for rows.Next() {
		var book Book
		err := rows.Scan(
			&book.bookid,
			&book.title,
			&book.isbn,
			&book.authorid,
			&book.publisherid,
			&book.publish_year,
			&book.categoryid,
			&book.quantity,
			&book.price,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan book row: %v", err)
		}
		books = append(books, book)
	}

	// Check for errors after iterating through rows
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during row iteration: %v", err)
	}

	return books, nil
}

// GetBookByID fetches a single book by its ID
func GetBookByID(db *sql.DB, id int) (*Book, error) {
	var book Book
	err := db.QueryRow("SELECT bookid, title, author, isbn, published_at, created_at, updated_at FROM book WHERE id = $1", id).
		Scan(&book.bookid, &book.title, &book.isbn, &book.authorid, &book.publisherid, &book.publish_year, &book.categoryid, &book.quantity, &book.price)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("book with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to query book: %v", err)
	}

	return &book, nil
}

// DisplayAllBooks fetches and prints all books to the terminal
func DisplayAllBooks(db *sql.DB) error {
	books, err := GetAllBooks(db)
	if err != nil {
		return err
	}

	if len(books) == 0 {
		fmt.Println("No books found in the database")
		return nil
	}

	fmt.Println("\n=== BOOK CATALOG ===")
	fmt.Println("ID\tTITLE\t\t\tISBN\t\t     AUTHORID\t  PUBLISHERID\t  PUBLISH_YEAR\t  CATEGORYID\t\tQUANTITY\tPRICE")
	fmt.Println("--------------------------------------------------------")

	for _, book := range books {
		// Format the title and author for better display
		title := book.title
		if len(title) > 20 {
			title = title[:17] + "..."
		}
		bookid := book.bookid
		author := book.authorid
		publiserid := book.publisherid
		publisher_year := book.publish_year
		categoryid := book.categoryid
		quantity := book.quantity
		price := book.price

		fmt.Printf("%d\t%-20s\t%s\t\t%d\t\t%d\t\t%d\t\t%d\t\t%d\t\t%.2f\n",
			bookid, title, book.isbn, author, publiserid, publisher_year, categoryid, quantity, price)
	}

	fmt.Println("--------------------------------------------------------")
	fmt.Printf("Total books: %d\n\n", len(books))

	return nil
}

// DisplayBookDetails displays detailed information about a single book
func DisplayBookDetails(db *sql.DB, id int) error {
	book, err := GetBookByID(db, id)
	if err != nil {
		return err
	}

	fmt.Println("\n=== BOOK DETAILS ===")
	fmt.Printf("ID:           %d\n", book.bookid)
	fmt.Printf("Title:        %s\n", book.title)
	fmt.Printf("ISBN:       %s\n", book.isbn)
	fmt.Printf("AuthorID:         %d\n", book.authorid)
	fmt.Printf("PublisherID:    %d\n", book.publisherid)
	fmt.Printf("Publisher_year:   %d\n", book.publish_year)
	fmt.Printf("CategoryID:   %d\n", book.categoryid)
	fmt.Printf("Quantity:   %d\n", book.quantity)
	fmt.Printf("Price:   %f\n", book.price)
	fmt.Println("===================")

	return nil
}

// &book.bookid,
// 			&book.title,
// 			&book.isbn,
// 			&book.authorid,
// 			&book.publisherid,
// 			&book.publish_year,
// 			&book.categoryid,
// 			&book.quantity,
// 			&book.price,
