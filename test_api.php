<?php
// Test the database connection and API endpoint
require_once 'assets/php/db_connect.php';

try {
    // Test database connection
    $conn = Database::getConnection();
    echo "✅ Database connection successful!\n\n";
    
    // Test API endpoint
    $apiUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/dasarWeb/PBL_Lab_Data_Technologies/assets/php/get_modul.php';
    echo "🔍 Testing API endpoint: $apiUrl\n\n";
    
    $response = file_get_contents($apiUrl);
    if ($response === false) {
        throw new Exception("Failed to get API response");
    }
    
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON response: " . json_last_error_msg());
    }
    
    echo "✅ API Response:\n";
    echo "Status: " . ($data['status'] ?? 'N/A') . "\n";
    
    // Count items
    if (isset($data['data'])) {
        echo "\n📊 Data Count:\n";
        foreach ($data['data'] as $type => $items) {
            echo "- " . ucfirst($type) . ": " . count($items) . " items\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    if (isset($conn) && $conn->errorInfo()) {
        echo "Database Error: " . print_r($conn->errorInfo(), true) . "\n";
    }
}