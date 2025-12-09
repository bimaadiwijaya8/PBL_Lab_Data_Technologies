<?php
// Disable error display for API responses
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../assets/php/db_connect.php';

try {
    $conn = Database::getConnection();
    
    // Check if this is admin request (show all) or public request (approved only)
    $show_all = isset($_GET['admin']) && $_GET['admin'] === 'true';
    $tipe = $_GET['tipe'] ?? 'berita';
    
    // Build query based on request type
    if ($show_all) {
        // Admin view - show all berita with their status
        // Use tanggal as fallback if created_at doesn't exist
        $query = "SELECT *, 
                 CASE 
                     WHEN created_at IS NOT NULL THEN created_at 
                     ELSE tanggal 
                 END as sort_date 
                 FROM berita ORDER BY sort_date DESC";
    } else {
        // Public view - show only approved berita
        $query = "SELECT * FROM berita WHERE aksi = 'approved' AND status = 'approved' ORDER BY tanggal DESC";
    }
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $berita_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format data for response
    $formatted_berita = [];
    foreach ($berita_list as $berita) {
        $formatted_berita[] = [
            'id_berita' => $berita['id_berita'],
            'judul' => $berita['judul'],
            'gambar' => $berita['gambar'] ? '../' . $berita['gambar'] : null,
            'informasi' => $berita['informasi'],
            'tanggal' => $berita['tanggal'],
            'author' => 'Admin',
            'aksi' => $berita['aksi'] ?? 'pending',
            'status' => $berita['status'] ?? 'pending',
            'created_at' => $berita['created_at'] ?? $berita['tanggal']
        ];
    }
    
    // Filter by tipe if specified (for backward compatibility)
    if ($tipe !== 'all') {
        // For now, all items from berita table are treated as 'berita' type
        // This maintains compatibility with existing frontend code
    }
    
    echo json_encode([
        'success' => true,
        'data' => $formatted_berita
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn = null;
?>
