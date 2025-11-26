<?php
/**
 * Standalone PostgreSQL Connection Test
 * 
 * This file tests PostgreSQL database connection independently
 * without any external dependencies.
 * 
 * Usage:
 * - Terminal: php test_connection_standalone.php
 * - Browser: http://localhost/PBL/test_connection_standalone.php
 */

// Database configuration (modify as needed)
$host = 'localhost';
$port = '5432';
$dbname = 'pbl_db';
$user = 'postgres';
$password = '9023JN';

echo "<h2>🔍 PostgreSQL Connection Test</h2>\n";
echo "<pre>\n";

try {
    // Test 1: Check PDO extension
    echo "1. Checking PDO extension...\n";
    if (!extension_loaded('pdo')) {
        throw new Exception("PDO extension is not loaded");
    }
    echo "   ✅ PDO extension loaded\n";
    
    // Test 2: Check PostgreSQL PDO driver
    echo "2. Checking PostgreSQL PDO driver...\n";
    if (!extension_loaded('pdo_pgsql')) {
        throw new Exception("PDO PostgreSQL driver is not loaded");
    }
    echo "   ✅ PDO PostgreSQL driver loaded\n";
    
    // Test 3: Attempt database connection
    echo "3. Connecting to database...\n";
    echo "   Host: $host\n";
    echo "   Port: $port\n";
    echo "   Database: $dbname\n";
    echo "   User: $user\n";
    
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "   ✅ Connection Successful - Local device OK\n";
    
    // Test 4: Execute test query
    echo "4. Testing database query...\n";
    $stmt = $pdo->query("SELECT version() AS version");
    $version = $stmt->fetch()['version'];
    echo "   ✅ Query executed successfully\n";
    echo "   📊 PostgreSQL Version: $version\n";
    
    // Test 5: Get database info
    echo "5. Getting database information...\n";
    $stmt = $pdo->query("SELECT current_database() AS db, current_user AS user");
    $info = $stmt->fetch();
    echo "   📊 Database: {$info['db']}\n";
    echo "   👤 User: {$info['user']}\n";
    
    // Test 6: Check tables
    echo "6. Checking database tables...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'");
    $tableCount = $stmt->fetch()['count'];
    echo "   📋 Tables found: $tableCount\n";
    
    if ($tableCount > 0) {
        $stmt = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "   📋 Table list:\n";
        foreach ($tables as $table) {
            echo "      - $table\n";
        }
    }
    
    echo "\n🎉 All tests passed successfully!\n";
    echo "✅ Your PostgreSQL connection is working perfectly.\n";
    
} catch (PDOException $e) {
    echo "\n❌ Database Connection Failed!\n";
    echo "🔍 Error Details:\n";
    echo "   Error Code: " . $e->getCode() . "\n";
    echo "   Error Message: " . $e->getMessage() . "\n";
    
    echo "\n💡 Technical Solutions:\n";
    
    // Analyze specific error types
    $errorMessage = strtolower($e->getMessage());
    
    if (strpos($errorMessage, 'could not find driver') !== false) {
        echo "   1. Install PostgreSQL PDO driver:\n";
        echo "      - Open php.ini file\n";
        echo "      - Uncomment: extension=pdo_pgsql\n";
        echo "      - Restart web server\n";
    }
    
    if (strpos($errorMessage, 'connection refused') !== false || strpos($errorMessage, 'timeout') !== false) {
        echo "   1. Check PostgreSQL service:\n";
        echo "      - Run: services.msc\n";
        echo "      - Find 'postgresql-x64-15' service\n";
        echo "      - Ensure it's running\n";
        echo "   2. Check port 5432:\n";
        echo "      - Run: netstat -an | findstr 5432\n";
        echo "      - Verify PostgreSQL is listening\n";
    }
    
    if (strpos($errorMessage, 'authentication failed') !== false || strpos($errorMessage, 'password') !== false) {
        echo "   1. Verify credentials:\n";
        echo "      - Check username: '$user'\n";
        echo "      - Check password: [HIDDEN]\n";
        echo "      - Test with psql: psql -h $host -p $port -U $user -d $dbname\n";
    }
    
    if (strpos($errorMessage, 'database') !== false && strpos($errorMessage, 'does not exist') !== false) {
        echo "   1. Create database:\n";
        echo "      - Connect to PostgreSQL: psql -U postgres\n";
        echo "      - Run: CREATE DATABASE $dbname;\n";
        echo "      - Grant permissions: GRANT ALL PRIVILEGES ON DATABASE $dbname TO $user;\n";
    }
    
    if (strpos($errorMessage, 'permission denied') !== false) {
        echo "   1. Grant database permissions:\n";
        echo "      - Connect as superuser: psql -U postgres\n";
        echo "      - Run: GRANT ALL PRIVILEGES ON DATABASE $dbname TO $user;\n";
        echo "      - Run: GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $user;\n";
    }
    
} catch (Exception $e) {
    echo "\n❌ General Error!\n";
    echo "🔍 Error Details:\n";
    echo "   Error Message: " . $e->getMessage() . "\n";
    
    echo "\n💡 Solutions:\n";
    if (strpos($e->getMessage(), 'PDO extension') !== false) {
        echo "   1. Install/Enable PDO extension in php.ini\n";
        echo "   2. Restart web server\n";
    }
    
    if (strpos($e->getMessage(), 'pdo_pgsql') !== false) {
        echo "   1. Install PostgreSQL PDO driver:\n";
        echo "      - Windows: Uncomment extension=pdo_pgsql in php.ini\n";
        echo "      - Download: https://www.php.net/manual/en/install.pecl.php\n";
    }
}

echo "\n📋 System Information:\n";
echo "   PHP Version: " . PHP_VERSION . "\n";
echo "   PHP Extensions: " . (extension_loaded('pdo') ? 'PDO ✓' : 'PDO ✗') . ", " . (extension_loaded('pdo_pgsql') ? 'pdo_pgsql ✓' : 'pdo_pgsql ✗') . "\n";
echo "   Current Directory: " . __DIR__ . "\n";
echo "   Timestamp: " . date('Y-m-d H:i:s') . "\n";

echo "\n</pre>\n";
echo "<hr>\n";
echo "<p><strong>Instructions:</strong></p>\n";
echo "<ul>\n";
echo "<li>To run in terminal: <code>php test_connection_standalone.php</code></li>\n";
echo "<li>To run in browser: <code>http://localhost/PBL/test_connection_standalone.php</code></li>\n";
echo "<li>If errors occur, follow the technical solutions above</li>\n";
echo "</ul>\n";
?>
