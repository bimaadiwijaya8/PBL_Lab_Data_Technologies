<?php
require_once 'assets/php/db_connect.php';

try {
    $conn = Database::getConnection();
    
    // Get table structure
    $query = "SELECT column_name, data_type, column_default 
              FROM information_schema.columns 
              WHERE table_name = 'berita' 
              ORDER BY ordinal_position";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>Berita Table Structure:</h2>";
    echo "<table border='1'>";
    echo "<tr><th>Column Name</th><th>Data Type</th><th>Default Value</th></tr>";
    
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($column['column_name']) . "</td>";
        echo "<td>" . htmlspecialchars($column['data_type']) . "</td>";
        echo "<td>" . htmlspecialchars($column['column_default']) . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    
    // Check if created_at column exists
    $has_created_at = false;
    foreach ($columns as $column) {
        if ($column['column_name'] === 'created_at') {
            $has_created_at = true;
            break;
        }
    }
    
    if (!$has_created_at) {
        echo "<h3 style='color: red;'>created_at column is missing!</h3>";
        
        // Add the missing column
        $alter_query = "ALTER TABLE berita ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
        $conn->exec($alter_query);
        echo "<h3 style='color: green;'>created_at column added successfully!</h3>";
    } else {
        echo "<h3 style='color: green;'>created_at column already exists!</h3>";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

$conn = null;
?>
