package db

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
)

type Author struct {
	AuthorID   int
	AuthorName string
}

// INSERT
func InsertAuthor(db *sql.DB, a Author) (Author, error) {
	query := `
		INSERT INTO author (authorname)
		VALUES ($1)
		RETURNING authorid, authorname`

	err := db.QueryRow(query, a.AuthorName).Scan(&a.AuthorID, &a.AuthorName)
	if err != nil {
		log.Printf("Failed to insert author: %v", err)
		return Author{}, fmt.Errorf("failed to insert author: %w", err)
	}
	log.Printf("Inserted author ID %d: %s", a.AuthorID, a.AuthorName)
	return a, nil
}

// READ by ID
func GetAuthorByID(db *sql.DB, id int) (Author, error) {
	var a Author
	query := `SELECT authorid, authorname FROM author WHERE authorid = $1`

	err := db.QueryRow(query, id).Scan(&a.AuthorID, &a.AuthorName)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No author found with ID %d", id)
			return Author{}, fmt.Errorf("no author found with ID %d", id)
		}
		log.Printf("Failed to fetch author: %v", err)
		return Author{}, fmt.Errorf("failed to get author: %w", err)
	}

	fmt.Println("\nAuthor Details")
	fmt.Println(strings.Repeat("=", 30))
	fmt.Printf("ID   : %d\n", a.AuthorID)
	fmt.Printf("Name : %s\n", a.AuthorName)
	fmt.Println(strings.Repeat("=", 30))
	log.Printf("Retrieved author ID %d: %s", a.AuthorID, a.AuthorName)
	return a, nil
}

// READ all
func GetAllAuthors(db *sql.DB) ([]Author, error) {
	query := `SELECT authorid, authorname FROM author ORDER BY authorid`
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query authors: %w", err)
	}
	defer rows.Close()

	var authors []Author
	for rows.Next() {
		var a Author
		if err := rows.Scan(&a.AuthorID, &a.AuthorName); err != nil {
			log.Printf("Failed to scan author: %v", err)
			return nil, fmt.Errorf("failed to scan author: %w", err)
		}
		authors = append(authors, a)
	}

	fmt.Println("\nAll Authors")
	fmt.Println(strings.Repeat("=", 40))
	fmt.Printf("%-5s %-30s\n", "ID", "Author Name")
	fmt.Println(strings.Repeat("-", 40))
	for _, a := range authors {
		fmt.Printf("%-5d %-30s\n", a.AuthorID, a.AuthorName)
	}
	fmt.Println(strings.Repeat("=", 40))
	log.Printf("Retrieved %d author(s) from the database", len(authors))
	return authors, nil
}

// UPDATE
func UpdateAuthor(db *sql.DB, a Author) error {
	query := `UPDATE author SET authorname = $1 WHERE authorid = $2`
	res, err := db.Exec(query, a.AuthorName, a.AuthorID)
	if err != nil {
		log.Printf("Failed to update author: %v", err)
		return fmt.Errorf("failed to update author: %w", err)
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		log.Printf("No author found with ID %d to update", a.AuthorID)
		return fmt.Errorf("no author found with ID %d", a.AuthorID)
	}
	log.Printf("Updated author ID %d", a.AuthorID)
	return nil
}

// DELETE
func DeleteAuthor(db *sql.DB, id int) error {
	query := `DELETE FROM author WHERE authorid = $1`
	res, err := db.Exec(query, id)
	if err != nil {
		log.Printf("Failed to delete author: %v", err)
		return fmt.Errorf("failed to delete author: %w", err)
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		log.Printf("No author found with ID %d to delete", id)
		return fmt.Errorf("no author found with ID %d", id)
	}
	log.Printf("Deleted author ID %d", id)
	return nil
}
