<?php
/**
 * Database Connection Test Script
 * 
 * This script tests the database connection using the db_connect.php file.
 * It outputs detailed connection information in both HTML and JSON formats.
 */

// Check if the request wants JSON output
$jsonOutput = isset($_GET['json']) || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

// Set appropriate content type
if ($jsonOutput) {
    header('Content-Type: application/json');
} else {
    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Database Connection Test</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            .success { color: #2ecc71; }
            .error { color: #e74c3c; }
            .database-info { margin: 20px 0; }
            .schema { margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
            .schema-name { color: #3498db; font-weight: bold; }
            .table-list { list-style-type: none; padding-left: 20px; }
            .table-list li { padding: 5px 0; }
            .table-list li:before { content: "📊 "; }
            pre { 
                background: #f4f4f4; 
                padding: 15px; 
                border-radius: 5px; 
                overflow-x: auto;
            }
            .container { max-width: 800px; margin: 0 auto; }
        </style>
    </head>
    <body>
    <div class="container">
        <h1>Database Connection Test</h1>
    <?php
}

// Error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include the database connection file
$dbConnectPath = __DIR__ . '/assets/php/db_connect.php';

if (!file_exists($dbConnectPath)) {
    $error = "Error: db_connect.php not found at: $dbConnectPath";
    if ($jsonOutput) {
        echo json_encode(['status' => 'error', 'message' => $error], JSON_PRETTY_PRINT);
    } else {
        echo "<div class='error'><h2>❌ $error</h2></div>";
    }
    exit(1);
}

require_once $dbConnectPath;

try {
    // Test the database connection
    $conn = Database::getConnection();
    
    // Get database info
    $driver = $conn->getAttribute(PDO::ATTR_DRIVER_NAME);
    $serverVersion = $conn->getAttribute(PDO::ATTR_SERVER_VERSION);
    $connectionStatus = $conn->getAttribute(PDO::ATTR_CONNECTION_STATUS);
    
    // Get current database name
    $dbName = $conn->query('SELECT current_database()')->fetchColumn();
    
    // Get list of all tables
    $tables = [];
    $tablesQuery = "SELECT table_name, table_schema 
                   FROM information_schema.tables 
                   WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
                   ORDER BY table_schema, table_name";
    
    $tableStmt = $conn->query($tablesQuery);
    $tables = $tableStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group tables by schema
    $schemas = [];
    foreach ($tables as $table) {
        $schemaName = $table['table_schema'];
        if (!isset($schemas[$schemaName])) {
            $schemas[$schemaName] = [];
        }
        $schemas[$schemaName][] = $table['table_name'];
    }
    
    $result = [
        'status' => 'success',
        'message' => 'Database connected successfully',
        'database' => [
            'name' => $dbName,
            'driver' => $driver,
            'server_version' => $serverVersion,
            'connection_status' => $connectionStatus,
            'schemas' => $schemas
        ]
    ];
    
    if ($jsonOutput) {
        echo json_encode($result, JSON_PRETTY_PRINT);
    } else {
        echo "<div class='success'><h2>✅ Database Connected Successfully!</h2>";
        echo "<div class='database-info'>";
        echo "<h3>Database Information</h3>";
        echo "<p><strong>Database Name:</strong> " . htmlspecialchars($dbName) . "</p>";
        echo "<p><strong>Driver:</strong> " . htmlspecialchars($driver) . "</p>";
        echo "<p><strong>Server Version:</strong> " . htmlspecialchars($serverVersion) . "</p>";
        echo "<p><strong>Connection Status:</strong> " . htmlspecialchars($connectionStatus) . "</p>";
        
        // Display schemas and tables
        if (!empty($schemas)) {
            echo "<h3>Database Schemas and Tables</h3>";
            foreach ($schemas as $schema => $tables) {
                echo "<div class='schema'>";
                echo "<h4>Schema: <span class='schema-name'>" . htmlspecialchars($schema) . "</span></h4>";
                if (!empty($tables)) {
                    echo "<ul class='table-list'>";
                    foreach ($tables as $table) {
                        echo "<li>" . htmlspecialchars($table) . "</li>";
                    }
                    echo "</ul>";
                } else {
                    echo "<p>No tables found in this schema.</p>";
                }
                echo "</div>";
            }
        } else {
            echo "<p>No schemas or tables found in the database.</p>";
        }
        echo "</div>";
        echo "<h3>Raw Data:</h3><pre>" . json_encode($result, JSON_PRETTY_PRINT) . "</pre>";
        echo "</div>";
    }
    
} catch (PDOException $e) {
    $error = [
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => [
            'code' => $e->getCode(),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ];
    
    if ($jsonOutput) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode($error, JSON_PRETTY_PRINT);
    } else {
        echo "<div class='error'><h2>❌ Database Connection Failed</h2>";
        echo "<p><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<p><strong>File:</strong> " . htmlspecialchars($e->getFile()) . " (Line: " . $e->getLine() . ")</p>";
        echo "<h3>Debug Information:</h3><pre>" . json_encode($error, JSON_PRETTY_PRINT) . "</pre>";
        
        // Additional debug information
        echo "<h3>PHP Extensions:</h3>";
        echo "<p>PDO: " . (extension_loaded('pdo') ? '✅ Loaded' : '❌ Not Loaded') . "</p>";
        echo "<p>PDO_PGSQL: " . (extension_loaded('pdo_pgsql') ? '✅ Loaded' : '❌ Not Loaded') . "</p>";
        
        echo "</div>";
    }
    exit(1);
}

if (!$jsonOutput) {
    echo "</div></body></html>";
}
