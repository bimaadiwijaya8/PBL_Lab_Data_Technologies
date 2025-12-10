<?php
// Disable error display for API responses
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../assets/php/db_connect.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

try {
    // Get JSON input
    $json_input = file_get_contents('php://input');
    $data = json_decode($json_input, true);
    
    if (!$data || !isset($data['id_berita'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request: id_berita is required'
        ]);
        exit();
    }
    
    $id_berita = (int)$data['id_berita'];
    
    if ($id_berita <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid berita ID'
        ]);
        exit();
    }
    
    $conn = Database::getConnection();
    
    // First check if the berita exists and get image path
    $check_query = "SELECT id_berita, judul, gambar FROM berita WHERE id_berita = :id_berita";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bindParam(':id_berita', $id_berita, PDO::PARAM_INT);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Berita tidak ditemukan'
        ]);
        exit();
    }
    
    $berita_data = $check_stmt->fetch(PDO::FETCH_ASSOC);
    $judul_berita = $berita_data['judul'];
    $oldImagePath = $berita_data['gambar'] ?? null;
    
    // Delete the berita
    $delete_query = "DELETE FROM berita WHERE id_berita = :id_berita";
    $delete_stmt = $conn->prepare($delete_query);
    $delete_stmt->bindParam(':id_berita', $id_berita, PDO::PARAM_INT);
    
    if ($delete_stmt->execute()) {
        // Delete associated image if it exists
        if ($oldImagePath) {
            $oldFileFullPath = '../' . $oldImagePath;
            if (file_exists($oldFileFullPath)) {
                unlink($oldFileFullPath);
                error_log("Deleted image with berita: " . $oldImagePath);
            }
        }
        
        // Log the deletion (optional, for audit purposes)
        error_log("Berita deleted: ID $id_berita, Judul: $judul_berita");
        
        echo json_encode([
            'success' => true,
            'message' => 'Berita "' . htmlspecialchars($judul_berita) . '" berhasil dihapus'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Gagal menghapus berita'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Database error in delete_berita.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("General error in delete_berita.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

$conn = null;
?>
