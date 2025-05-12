package db

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
)

// Category struct
type Category struct {
	CategoryID   int
	CategoryName string
}

// INSERT
func InsertCategory(db *sql.DB, c Category) (Category, error) {
	query := `
		INSERT INTO category (categoryname)
		VALUES ($1)
		RETURNING categoryid, categoryname`

	err := db.QueryRow(query, c.CategoryName).Scan(&c.CategoryID, &c.CategoryName)
	if err != nil {
		log.Printf("Failed to insert category: %v", err)
		return Category{}, fmt.Errorf("failed to insert category: %w", err)
	}
	log.Printf("Inserted category ID %d: %s", c.CategoryID, c.CategoryName)
	return c, nil
}

// READ by ID
func GetCategoryByID(db *sql.DB, id int) (Category, error) {
	var c Category
	query := `SELECT categoryid, categoryname FROM category WHERE categoryid = $1`

	err := db.QueryRow(query, id).Scan(&c.CategoryID, &c.CategoryName)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No category found with ID %d", id)
			return Category{}, fmt.Errorf("no category found with ID %d", id)
		}
		log.Printf("Failed to fetch category: %v", err)
		return Category{}, fmt.Errorf("failed to get category: %w", err)
	}

	fmt.Println("\nCategory Details")
	fmt.Println(strings.Repeat("=", 35))
	fmt.Printf("ID    : %d\n", c.CategoryID)
	fmt.Printf("Name  : %s\n", c.CategoryName)
	fmt.Println(strings.Repeat("=", 35))
	log.Printf("Retrieved category ID %d: %s", c.CategoryID, c.CategoryName)
	return c, nil
}

// READ all
func GetAllCategories(db *sql.DB) ([]Category, error) {
	query := `SELECT categoryid, categoryname FROM category ORDER BY categoryid`
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query categories: %w", err)
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var c Category
		if err := rows.Scan(&c.CategoryID, &c.CategoryName); err != nil {
			log.Printf("Failed to scan category: %v", err)
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, c)
	}

	fmt.Println("\nAll Categories")
	fmt.Println(strings.Repeat("=", 40))
	fmt.Printf("%-5s %-30s\n", "ID", "Category Name")
	fmt.Println(strings.Repeat("-", 40))
	for _, c := range categories {
		fmt.Printf("%-5d %-30s\n", c.CategoryID, c.CategoryName)
	}
	fmt.Println(strings.Repeat("=", 40))
	log.Printf("Retrieved %d category(ies) from the database", len(categories))
	return categories, nil
}

// UPDATE
func UpdateCategory(db *sql.DB, c Category) error {
	query := `UPDATE category SET categoryname = $1 WHERE categoryid = $2`
	res, err := db.Exec(query, c.CategoryName, c.CategoryID)
	if err != nil {
		log.Printf("Failed to update category: %v", err)
		return fmt.Errorf("failed to update category: %w", err)
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		log.Printf("No category found with ID %d to update", c.CategoryID)
		return fmt.Errorf("no category found with ID %d", c.CategoryID)
	}
	log.Printf("Updated category ID %d", c.CategoryID)
	return nil
}

// DELETE
func DeleteCategory(db *sql.DB, id int) error {
	query := `DELETE FROM category WHERE categoryid = $1`
	res, err := db.Exec(query, id)
	if err != nil {
		log.Printf("Failed to delete category: %v", err)
		return fmt.Errorf("failed to delete category: %w", err)
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		log.Printf("No category found with ID %d to delete", id)
		return fmt.Errorf("no category found with ID %d", id)
	}
	log.Printf("Deleted category ID %d", id)
	return nil
}
