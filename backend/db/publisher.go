package db

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
)

// Publisher struct
type Publisher struct {
	PublisherID   int
	PublisherName string
}

// INSERT
func InsertPublisher(db *sql.DB, p Publisher) (Publisher, error) {
	query := `
		INSERT INTO publisher (publishername)
		VALUES ($1)
		RETURNING publisherid, publishername`

	err := db.QueryRow(query, p.PublisherName).Scan(&p.PublisherID, &p.PublisherName)
	if err != nil {
		log.Printf("Failed to insert publisher: %v", err)
		return Publisher{}, fmt.Errorf("failed to insert publisher: %w", err)
	}
	log.Printf("Inserted publisher ID %d: %s", p.PublisherID, p.PublisherName)
	return p, nil
}

// READ by ID
func GetPublisherByID(db *sql.DB, id int) (Publisher, error) {
	var p Publisher
	query := `SELECT publisherid, publishername FROM publisher WHERE publisherid = $1`

	err := db.QueryRow(query, id).Scan(&p.PublisherID, &p.PublisherName)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No publisher found with ID %d", id)
			return Publisher{}, fmt.Errorf("no publisher found with ID %d", id)
		}
		log.Printf("Failed to fetch publisher: %v", err)
		return Publisher{}, fmt.Errorf("failed to get publisher: %w", err)
	}

	fmt.Println("\nPublisher Details")
	fmt.Println(strings.Repeat("=", 35))
	fmt.Printf("ID   : %d\n", p.PublisherID)
	fmt.Printf("Name : %s\n", p.PublisherName)
	fmt.Println(strings.Repeat("=", 35))
	log.Printf("Retrieved publisher ID %d: %s", p.PublisherID, p.PublisherName)
	return p, nil
}

// READ all
func GetAllPublishers(db *sql.DB) ([]Publisher, error) {
	query := `SELECT publisherid, publishername FROM publisher ORDER BY publisherid`
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query publishers: %w", err)
	}
	defer rows.Close()

	var publishers []Publisher
	for rows.Next() {
		var p Publisher
		if err := rows.Scan(&p.PublisherID, &p.PublisherName); err != nil {
			log.Printf("Failed to scan publisher: %v", err)
			return nil, fmt.Errorf("failed to scan publisher: %w", err)
		}
		publishers = append(publishers, p)
	}

	fmt.Println("\nAll Publishers")
	fmt.Println(strings.Repeat("=", 45))
	fmt.Printf("%-5s %-35s\n", "ID", "Publisher Name")
	fmt.Println(strings.Repeat("-", 45))
	for _, p := range publishers {
		fmt.Printf("%-5d %-35s\n", p.PublisherID, p.PublisherName)
	}
	fmt.Println(strings.Repeat("=", 45))
	log.Printf("Retrieved %d publisher(s) from the database", len(publishers))
	return publishers, nil
}

// UPDATE
func UpdatePublisher(db *sql.DB, p Publisher) error {
	query := `UPDATE publisher SET publishername = $1 WHERE publisherid = $2`
	res, err := db.Exec(query, p.PublisherName, p.PublisherID)
	if err != nil {
		log.Printf("Failed to update publisher: %v", err)
		return fmt.Errorf("failed to update publisher: %w", err)
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		log.Printf("No publisher found with ID %d to update", p.PublisherID)
		return fmt.Errorf("no publisher found with ID %d", p.PublisherID)
	}
	log.Printf("Updated publisher ID %d", p.PublisherID)
	return nil
}

// DELETE
func DeletePublisher(db *sql.DB, id int) error {
	query := `DELETE FROM publisher WHERE publisherid = $1`
	res, err := db.Exec(query, id)
	if err != nil {
		log.Printf("Failed to delete publisher: %v", err)
		return fmt.Errorf("failed to delete publisher: %w", err)
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		log.Printf("No publisher found with ID %d to delete", id)
		return fmt.Errorf("no publisher found with ID %d", id)
	}
	log.Printf("Deleted publisher ID %d", id)
	return nil
}
