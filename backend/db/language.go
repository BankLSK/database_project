package db

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
)

// Language struct
type Language struct {
	LanguageID int
	Language   string
}

// INSERT
func InsertLanguage(db *sql.DB, l Language) (Language, error) {
	query := `
		INSERT INTO language (language)
		VALUES ($1)
		RETURNING languageid, language`

	err := db.QueryRow(query, l.Language).Scan(&l.LanguageID, &l.Language)
	if err != nil {
		log.Printf("Failed to insert language: %v", err)
		return Language{}, fmt.Errorf("failed to insert language: %w", err)
	}
	log.Printf("Inserted language ID %d: %s", l.LanguageID, l.Language)
	return l, nil
}

// READ by ID
func GetLanguageByID(db *sql.DB, id int) (Language, error) {
	var l Language
	query := `SELECT languageid, language FROM language WHERE languageid = $1`

	err := db.QueryRow(query, id).Scan(&l.LanguageID, &l.Language)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No language found with ID %d", id)
			return Language{}, fmt.Errorf("no language found with ID %d", id)
		}
		log.Printf("Failed to fetch language: %v", err)
		return Language{}, fmt.Errorf("failed to get language: %w", err)
	}

	fmt.Println("\nLanguage Details")
	fmt.Println(strings.Repeat("=", 35))
	fmt.Printf("ID   : %d\n", l.LanguageID)
	fmt.Printf("Name : %s\n", l.Language)
	fmt.Println(strings.Repeat("=", 35))
	log.Printf("Retrieved language ID %d: %s", l.LanguageID, l.Language)
	return l, nil
}

// READ all
func GetAllLanguages(db *sql.DB) ([]Language, error) {
	query := `SELECT languageid, language FROM language ORDER BY languageid`
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query languages: %w", err)
	}
	defer rows.Close()

	var languages []Language
	for rows.Next() {
		var l Language
		if err := rows.Scan(&l.LanguageID, &l.Language); err != nil {
			log.Printf("Failed to scan language: %v", err)
			return nil, fmt.Errorf("failed to scan language: %w", err)
		}
		languages = append(languages, l)
	}

	fmt.Println("\nAll Languages")
	fmt.Println(strings.Repeat("=", 45))
	fmt.Printf("%-5s %-35s\n", "ID", "Language")
	fmt.Println(strings.Repeat("-", 45))
	for _, l := range languages {
		fmt.Printf("%-5d %-35s\n", l.LanguageID, l.Language)
	}
	fmt.Println(strings.Repeat("=", 45))
	log.Printf("Retrieved %d language(s) from the database", len(languages))
	return languages, nil
}

// UPDATE
func UpdateLanguage(db *sql.DB, l Language) error {
	query := `UPDATE language SET language = $1 WHERE languageid = $2`
	res, err := db.Exec(query, l.Language, l.LanguageID)
	if err != nil {
		log.Printf("Failed to update language: %v", err)
		return fmt.Errorf("failed to update language: %w", err)
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		log.Printf("No language found with ID %d to update", l.LanguageID)
		return fmt.Errorf("no language found with ID %d", l.LanguageID)
	}
	log.Printf("Updated language ID %d", l.LanguageID)
	return nil
}

// DELETE
func DeleteLanguage(db *sql.DB, id int) error {
	query := `DELETE FROM language WHERE languageid = $1`
	res, err := db.Exec(query, id)
	if err != nil {
		log.Printf("Failed to delete language: %v", err)
		return fmt.Errorf("failed to delete language: %w", err)
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		log.Printf("No language found with ID %d to delete", id)
		return fmt.Errorf("no language found with ID %d", id)
	}
	log.Printf("Deleted language ID %d", id)
	return nil
}
