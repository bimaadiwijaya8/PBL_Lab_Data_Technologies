<?php
/**
 * Setup approval system for berita table
 * This script adds the necessary columns for approval workflow
 */

require_once '../assets/php/db_connect.php';

try {
    $conn = Database::getConnection();
    
    // Check if aksi column exists
    $check_column = "SELECT column_name FROM information_schema.columns 
                     WHERE table_name = 'berita' AND column_name = 'aksi'";
    
    $result = $conn->query($check_column);
    
    if ($result->rowCount() == 0) {
        // Add aksi column for approval status
        $alter_query = "ALTER TABLE berita ADD COLUMN aksi VARCHAR(20) DEFAULT 'pending'";
        $conn->exec($alter_query);
        echo "Column 'aksi' added successfully<br>";
    } else {
        echo "Column 'aksi' already exists<br>";
    }
    
    // Check if status column exists
    $check_status = "SELECT column_name FROM information_schema.columns 
                     WHERE table_name = 'berita' AND column_name = 'status'";
    
    $result = $conn->query($check_status);
    
    if ($result->rowCount() == 0) {
        // Add status column
        $alter_status = "ALTER TABLE berita ADD COLUMN status VARCHAR(20) DEFAULT 'pending'";
        $conn->exec($alter_status);
        echo "Column 'status' added successfully<br>";
    } else {
        echo "Column 'status' already exists<br>";
    }
    
    // Check if created_at column exists
    $check_created = "SELECT column_name FROM information_schema.columns 
                      WHERE table_name = 'berita' AND column_name = 'created_at'";
    
    $result = $conn->query($check_created);
    
    if ($result->rowCount() == 0) {
        // Add created_at column
        $alter_created = "ALTER TABLE berita ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
        $conn->exec($alter_created);
        echo "Column 'created_at' added successfully<br>";
    } else {
        echo "Column 'created_at' already exists<br>";
    }
    
    echo "<br><strong>Approval system setup completed!</strong><br>";
    echo "The berita table now has:<br>";
    echo "- aksi column (pending/approved/rejected)<br>";
    echo "- status column (pending/approved/rejected)<br>";
    echo "- created_at column (timestamp)<br>";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

$conn = null;
?>
