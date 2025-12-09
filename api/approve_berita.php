<?php
// Disable error display for API responses
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../assets/php/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $conn = Database::getConnection();
    
    // Get JSON data
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
    $id_berita = $data['id_berita'] ?? '';
    $aksi = $data['aksi'] ?? ''; // 'approved' or 'rejected'
    
    if (empty($id_berita) || empty($aksi)) {
        echo json_encode(['success' => false, 'message' => 'ID berita dan aksi wajib diisi']);
        exit;
    }
    
    // Validate aksi value
    if (!in_array($aksi, ['approved', 'rejected'])) {
        echo json_encode(['success' => false, 'message' => 'Aksi tidak valid. Gunakan "approved" atau "rejected"']);
        exit;
    }
    
    // Update berita status
    $query = "UPDATE berita SET aksi = :aksi, status = :status WHERE id_berita = :id_berita";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':aksi', $aksi);
    $stmt->bindParam(':status', $aksi);
    $stmt->bindParam(':id_berita', $id_berita);
    
    if ($stmt->execute()) {
        $rowCount = $stmt->rowCount();
        if ($rowCount > 0) {
            $message = $aksi === 'approved' ? 
                'Berita berhasil disetujui dan akan ditampilkan di website' : 
                'Berita ditolak';
                
            echo json_encode([
                'success' => true, 
                'message' => $message,
                'aksi' => $aksi
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Berita tidak ditemukan']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal mengupdate status']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn = null;
?>
