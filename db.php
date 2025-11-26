<?php
/**
 * Database Connection Class for PostgreSQL
 * 
 * This class provides a clean and reusable way to connect to PostgreSQL database
 * using PHP PDO with proper error handling and security configurations.
 * 
 * @author Your Name
 * @version 1.0
 */

class Database {
    // Database connection parameters
    private $host = 'localhost';
    private $port = '5432';
    private $dbname = 'pbl_db';
    private $user = 'postgres';
    private $password = '9023JN';
    
    // PDO instance
    private $pdo;
    
    /**
     * Establish database connection
     * 
     * @return PDO PDO connection object
     * @throws PDOException If connection fails
     */
    public function connect() {
        try {
            // Build DSN string
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->dbname}";
            
            // Create PDO instance with error handling
            $this->pdo = new PDO($dsn, $this->user, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_PERSISTENT => false
            ]);
            
            return $this->pdo;
            
        } catch (PDOException $e) {
            // Display user-friendly error message
            $error_message = "Database Connection Failed!\n\n";
            $error_message .= "Error Details: " . $e->getMessage() . "\n";
            $error_message .= "Please check your database configuration and ensure PostgreSQL is running.\n";
            $error_message .= "Contact your system administrator if the problem persists.";
            
            // In production, you might want to log this instead of displaying
            error_log("Database connection error: " . $e->getMessage());
            
            die($error_message);
        }
    }
    
    /**
     * Get current PDO instance
     * 
     * @return PDO|null Current PDO instance or null if not connected
     */
    public function getConnection() {
        return $this->pdo;
    }
    
    /**
     * Close database connection
     */
    public function close() {
        $this->pdo = null;
    }
    
    /**
     * Update database configuration
     * 
     * @param array $config Associative array with database parameters
     */
    public function setConfig($config) {
        if (isset($config['host'])) $this->host = $config['host'];
        if (isset($config['port'])) $this->port = $config['port'];
        if (isset($config['dbname'])) $this->dbname = $config['dbname'];
        if (isset($config['user'])) $this->user = $config['user'];
        if (isset($config['password'])) $this->password = $config['password'];
    }
}

/*
========================================
USAGE EXAMPLES
========================================

// Basic Usage:
$db = new Database();
$pdo = $db->connect();

// Example Query:
try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmt->execute(['id' => 1]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "User found: " . $user['name'];
    } else {
        echo "User not found";
    }
} catch (PDOException $e) {
    echo "Query failed: " . $e->getMessage();
}

// Example INSERT:
try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email) VALUES (:name, :email)");
    $stmt->execute([
        'name' => 'John Doe',
        'email' => 'john@example.com'
    ]);
    echo "User inserted successfully!";
} catch (PDOException $e) {
    echo "Insert failed: " . $e->getMessage();
}

// Example UPDATE:
try {
    $stmt = $pdo->prepare("UPDATE users SET email = :email WHERE id = :id");
    $stmt->execute([
        'email' => 'newemail@example.com',
        'id' => 1
    ]);
    echo "User updated successfully!";
} catch (PDOException $e) {
    echo "Update failed: " . $e->getMessage();
}

// Example DELETE:
try {
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
    $stmt->execute(['id' => 1]);
    echo "User deleted successfully!";
} catch (PDOException $e) {
    echo "Delete failed: " . $e->getMessage();
}

// Custom Configuration:
$db = new Database();
$db->setConfig([
    'host' => 'your_host',
    'port' => '5432',
    'dbname' => 'your_database',
    'user' => 'your_username',
    'password' => 'your_password'
]);
$pdo = $db->connect();

// Always close connection when done:
$db->close();

========================================
SECURITY NOTES
========================================

1. This class uses PDO with prepared statements to prevent SQL injection
2. Error mode is set to EXCEPTION for proper error handling
3. Emulate prepares is OFF for better security
4. In production, consider moving database credentials to environment variables
5. Always validate and sanitize user input before using in queries
6. Use proper error handling in your application code

========================================
FILE INCLUSION EXAMPLE
========================================

// In your other PHP files (CRUD operations):
require_once 'db.php';

// Create database instance
$db = new Database();
$pdo = $db->connect();

// Now you can use $pdo for all your database operations
// Example: berita-crud.php, fasilitas-crud.php, anggota-crud.php, etc.

*/
