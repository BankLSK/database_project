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
	languageid   int
}

// GetAllBooks fetches all books from the database
func GetAllBooks(db *sql.DB) ([]Book, error) {
	// Query to get all books
	rows, err := db.Query("SELECT bookid, title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price, languageid FROM book")
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
			&book.languageid,
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
	err := db.QueryRow("SELECT bookid, title, author, isbn, published_at, created_at, updated_at, language FROM book WHERE id = $1", id).
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
	fmt.Println("ID\tTITLE\t\t\tISBN\t\t     AUTHORID\t  PUBLISHERID\t  PUBLISH_YEAR\t  CATEGORYID\t\tQUANTITY\tPRICE\tlanguage")
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
		language := book.languageid

		fmt.Printf("%d\t%-20s\t%s\t\t%d\t\t%d\t\t%d\t\t%d\t\t%d\t\t%.2f\t\t%d\n",
			bookid, title, book.isbn, author, publiserid, publisher_year, categoryid, quantity, price, language)
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
	fmt.Printf("Language:   %d\n", book.languageid)
	fmt.Println("===================")

	return nil
}

func getOrCreateAuthorID(db *sql.DB, name string) (int, error) {
	var id int
	err := db.QueryRow("SELECT authorid FROM author WHERE authorname = $1", name).Scan(&id)
	if err == sql.ErrNoRows {
		// Insert new author
		err = db.QueryRow("INSERT INTO author (authorname) VALUES ($1) RETURNING authorid", name).Scan(&id)
	}
	return id, err
}

func getOrCreateCategoryID(db *sql.DB, name string) (int, error) {
	var id int
	err := db.QueryRow("SELECT categoryid FROM category WHERE categoryname = $1", name).Scan(&id)
	if err == sql.ErrNoRows {
		err = db.QueryRow("INSERT INTO category (categoryname) VALUES ($1) RETURNING categoryid", name).Scan(&id)
	}
	return id, err
}

func getOrCreatePublisherID(db *sql.DB, name string) (int, error) {
	var id int
	err := db.QueryRow("SELECT publisherid FROM publisher WHERE publishername = $1", name).Scan(&id)
	if err == sql.ErrNoRows {
		err = db.QueryRow("INSERT INTO publisher (publishername) VALUES ($1) RETURNING publisherid", name).Scan(&id)
	}
	return id, err
}

func getOrCreateLanguageID(db *sql.DB, lang string) (int, error) {
	var id int
	err := db.QueryRow("SELECT languageid FROM language WHERE languagename = $1", lang).Scan(&id)
	if err == sql.ErrNoRows {
		err = db.QueryRow("INSERT INTO language (languagename) VALUES ($1) RETURNING languageid", lang).Scan(&id)
	}
	return id, err
}

// AddBook adds a new book to the database
func AddBookWithNames(
	db *sql.DB,
	title, isbn, authorName, publisherName, categoryName, languageName string,
	publishYear, quantity int,
	price float64,
) (Book, error) {
	var book Book

	// Resolve foreign keys
	authorID, err := getOrCreateAuthorID(db, authorName)
	if err != nil {
		return book, fmt.Errorf("error getting author ID: %v", err)
	}
	publisherID, err := getOrCreatePublisherID(db, publisherName)
	if err != nil {
		return book, fmt.Errorf("error getting publisher ID: %v", err)
	}
	categoryID, err := getOrCreateCategoryID(db, categoryName)
	if err != nil {
		return book, fmt.Errorf("error getting category ID: %v", err)
	}
	languageID, err := getOrCreateLanguageID(db, languageName)
	if err != nil {
		return book, fmt.Errorf("error getting language ID: %v", err)
	}

	// Check if a book with the same title already exists
	row := db.QueryRow(`
		SELECT bookid, quantity FROM book
		WHERE title = $1 AND authorid = $2 AND publisherid = $3 AND categoryid = $4 AND languageid = $5 AND publish_year = $6
	`, title, authorID, publisherID, categoryID, languageID, publishYear)

	var existingBookID int
	var existingQuantity int

	err = row.Scan(&existingBookID, &existingQuantity)
	if err == nil {
		// Book exists -> update quantity
		newQuantity := existingQuantity + quantity
		_, err := db.Exec(`UPDATE book SET quantity = $1 WHERE bookid = $2`, newQuantity, existingBookID)
		fmt.Println("Complete update book quantity")
		if err != nil {
			fmt.Println("failed to update quantity")
			return book, fmt.Errorf("failed to update quantity: %v", err)
		}

		// Return the updated book
		err = db.QueryRow(`
			SELECT bookid, title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price, languageid
			FROM book WHERE bookid = $1
		`, existingBookID).Scan(
			&book.bookid,
			&book.title,
			&book.isbn,
			&book.authorid,
			&book.publisherid,
			&book.publish_year,
			&book.categoryid,
			&book.quantity,
			&book.price,
			&book.languageid,
		)
		if err != nil {
			fmt.Println("failed to fetch updated book")
			return book, fmt.Errorf("failed to fetch updated book: %v", err)
		}

		return book, nil
	} else if err != sql.ErrNoRows {
		fmt.Println("failed to check existing book")
		return book, fmt.Errorf("failed to check existing book: %v", err)
	}

	// Book doesn't exist -> insert a new one
	err = db.QueryRow(`
		INSERT INTO book (title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price, languageid)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING bookid, title, isbn, authorid, publisherid, publish_year, categoryid, quantity, price, languageid
	`, title, isbn, authorID, publisherID, publishYear, categoryID, quantity, price, languageID).Scan(
		&book.bookid,
		&book.title,
		&book.isbn,
		&book.authorid,
		&book.publisherid,
		&book.publish_year,
		&book.categoryid,
		&book.quantity,
		&book.price,
		&book.languageid,
	)
	fmt.Println("Complete inserting book")

	if err != nil {
		fmt.Println("error inserting book")
		return book, fmt.Errorf("error inserting book: %v", err)
	}

	return book, nil
}
