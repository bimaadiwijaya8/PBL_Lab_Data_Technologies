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
    
    // Get total berita count
    $total_berita_query = "SELECT COUNT(*) as total FROM berita";
    $stmt = $conn->query($total_berita_query);
    $total_berita = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get pending berita count
    $pending_query = "SELECT COUNT(*) as pending FROM berita WHERE aksi = 'pending' OR status = 'pending'";
    $stmt = $conn->query($pending_query);
    $pending_count = $stmt->fetch(PDO::FETCH_ASSOC)['pending'];
    
    // Get approved berita count
    $approved_query = "SELECT COUNT(*) as approved FROM berita WHERE aksi = 'approved' AND status = 'approved'";
    $stmt = $conn->query($approved_query);
    $approved_count = $stmt->fetch(PDO::FETCH_ASSOC)['approved'];
    
    // Get agenda count (placeholder - you can modify this based on your agenda table)
    $total_agenda = 0; // Update this when you have agenda table
    
    // Get recent pending submissions for approval
    $recent_query = "SELECT * FROM berita 
                     WHERE aksi = 'pending' OR status = 'pending'
                     ORDER BY created_at DESC 
                     LIMIT 5";
    $stmt = $conn->query($recent_query);
    $recent_pending = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'total_berita' => (int)$total_berita,
            'total_agenda' => $total_agenda,
            'pending_content' => (int)$pending_count,
            'approved_content' => (int)$approved_count
        ],
        'recent_pending' => $recent_pending
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn = null;
?>
