<?php
// Enable error reporting for debugging but don't display errors
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../assets/php/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $conn = Database::getConnection();
    
    // First, let's check if the berita table exists and create it if needed
    $checkTable = "SELECT table_name FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'berita'";
    $result = $conn->query($checkTable);
    
    if ($result->rowCount() === 0) {
        // Create the berita table
        $createTable = "CREATE TABLE berita (
            id SERIAL PRIMARY KEY,
            judul VARCHAR(255) NOT NULL,
            gambar VARCHAR(500),
            informasi TEXT,
            tanggal DATE NOT NULL,
            author INTEGER,
            aksi VARCHAR(20) DEFAULT 'pending',
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conn->exec($createTable);
        echo json_encode(['success' => false, 'message' => 'Table berita created successfully. Please try again.']);
        exit;
    }
    
    // Get form data
    $judul = $_POST['judul_berita'] ?? '';
    $informasi = $_POST['isi_berita'] ?? '';
    $tanggal = $_POST['tanggal_berita'] ?? '';
    $author = 1; // Default author id_anggota = 1
    
    // Validate required fields
    if (empty($judul) || empty($informasi) || empty($tanggal)) {
        echo json_encode(['success' => false, 'message' => 'Semua field wajib diisi']);
        exit;
    }
    
    // Handle image upload
    $gambar_path = null;
    if (isset($_FILES['gambar_berita']) && $_FILES['gambar_berita']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['gambar_berita'];
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $max_size = 5 * 1024 * 1024; // 5MB
        
        // Validate file type
        if (!in_array($file['type'], $allowed_types)) {
            echo json_encode(['success' => false, 'message' => 'Format file tidak diizinkan. Gunakan JPG, PNG, atau GIF']);
            exit;
        }
        
        // Validate file size
        if ($file['size'] > $max_size) {
            echo json_encode(['success' => false, 'message' => 'Ukuran file maksimal 5MB']);
            exit;
        }
        
        // Create upload directory if not exists
        $upload_dir = '../assets/img/berita/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate unique filename
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'berita_' . time() . '_' . uniqid() . '.' . $file_extension;
        $filepath = $upload_dir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $gambar_path = 'assets/img/berita/' . $filename;
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal mengupload gambar']);
            exit;
        }
    }
    
    // Check if aksi and status columns exist, add them if they don't
    $check_columns = "SELECT column_name FROM information_schema.columns 
                      WHERE table_name = 'berita' AND column_name IN ('aksi', 'status')";
    $result = $conn->query($check_columns);
    $existing_columns = $result->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('aksi', $existing_columns)) {
        $conn->exec("ALTER TABLE berita ADD COLUMN aksi VARCHAR(20) DEFAULT 'pending'");
    }
    if (!in_array('status', $existing_columns)) {
        $conn->exec("ALTER TABLE berita ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
    }
    
    // Insert into berita table with pending status
    $query = "INSERT INTO berita (judul, gambar, informasi, tanggal, author) 
              VALUES (:judul, :gambar, :informasi, :tanggal, :author)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':judul', $judul);
    $stmt->bindParam(':gambar', $gambar_path);
    $stmt->bindParam(':informasi', $informasi);
    $stmt->bindParam(':tanggal', $tanggal);
    $stmt->bindParam(':author', $author);
    
    if ($stmt->execute()) {
        $id_berita = $conn->lastInsertId();
        echo json_encode([
            'success' => true, 
            'message' => 'Berita berhasil diajukan dan menunggu approval',
            'id_berita' => $id_berita,
            'status' => 'pending'
        ]);
    } else {
        $error_info = $stmt->errorInfo();
        echo json_encode([
            'success' => false, 
            'message' => 'Gagal menyimpan berita: ' . $error_info[2]
        ]);
    }
    
} catch (Exception $e) {
    // Log the actual error for debugging
    error_log("Submit berita error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false, 
        'message' => 'Terjadi kesalahan server: ' . $e->getMessage()
    ]);
}

$conn = null;
?>
