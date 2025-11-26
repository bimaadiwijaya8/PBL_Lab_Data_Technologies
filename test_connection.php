<?php
/**
 * Database Connection Test Script
 * 
 * This script tests the connection to PostgreSQL database using the Database class
 * from db.php file and performs a simple query to verify connectivity.
 * 
 * @author Your Name
 * @version 1.0
 */

// Import the database connection class
require_once 'db.php';

// Create database instance
$database = new Database();

try {
    // Attempt to connect to database
    $pdo = $database->connect();
    
    // Execute a simple test query to get PostgreSQL version
    $stmt = $pdo->prepare("SELECT version() AS pg_version");
    $stmt->execute();
    $result = $stmt->fetch();
    
    // Display success message with PostgreSQL version
    echo "✔ Koneksi berhasil! Versi PostgreSQL: " . $result['pg_version'] . "\n";
    
    // Optional: Test database info
    echo "📊 Database Info:\n";
    echo "   - Database Name: " . $pdo->query("SELECT current_database()")->fetchColumn() . "\n";
    echo "   - PostgreSQL Version: " . $pdo->query("SELECT version()")->fetchColumn() . "\n";
    echo "   - Current User: " . $pdo->query("SELECT current_user")->fetchColumn() . "\n";
    
} catch (PDOException $e) {
    // Display error message if connection fails
    echo "❌ Koneksi gagal: " . $e->getMessage() . "\n";
    
    // Additional troubleshooting information
    echo "\n🔍 Troubleshooting Tips:\n";
    echo "1. Pastikan PostgreSQL server sedang berjalan\n";
    echo "2. Periksa koneksi jaringan ke database server\n";
    echo "3. Verifikasi database credentials di db.php\n";
    echo "4. Pastikan database 'pbl_db' sudah ada\n";
    echo "5. Cek firewall settings untuk port 5432\n";
    
} catch (Exception $e) {
    // Handle other types of exceptions
    echo "❌ Error tidak terduga: " . $e->getMessage() . "\n";
} finally {
    // Always close the connection when done
    $database->close();
    echo "\n🔌 Koneksi database telah ditutup.\n";
}

/*
========================================
USAGE INSTRUCTIONS
========================================

1. Pastikan file db.php berada di direktori yang sama
2. Jalankan script ini melalui command line:
   php test_connection.php

3. Atau jalankan melalui web browser:
   http://localhost/PBL/test_connection.php

4. Jika berhasil, script akan menampilkan:
   - Pesan sukses dengan hasil query
   - Informasi database (nama, versi, user)
   - Pesan penutupan koneksi

5. Jika gagal, script akan menampilkan:
   - Pesan error detail
   - Tips troubleshooting
   - Pesan penutupan koneksi

========================================
INTEGRATION WITH CRUD SYSTEM
========================================

Script ini memvalidasi bahwa:
- Koneksi PostgreSQL berfungsi dengan baik
- Database class dapat di-import dan digunakan
- Query dasar dapat dieksekusi tanpa error

Setelah connection test berhasil, file CRUD berikut dapat digunakan:
- berita-crud.php (untuk manajemen berita)
- fasilitas-crud.php (untuk manajemen fasilitas)
- jurnal-crud.php (untuk manajemen jurnal)
- anggota-crud.php (untuk manajemen anggota)

Setiap file CRUD tersebut akan:
1. require_once 'db.php'
2. $db = new Database()
3. $pdo = $db->connect()
4. Melakukan operasi CRUD menggunakan $pdo

========================================
SECURITY NOTES
========================================

- Script ini hanya untuk testing, tidak untuk production
- Password database terlihat di db.php (consider environment variables di production)
- Error handling memberikan informasi detail untuk debugging
- Selalu tutup koneksi setelah selesai

*/
