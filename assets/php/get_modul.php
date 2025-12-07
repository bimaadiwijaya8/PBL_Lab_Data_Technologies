<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db_connect.php';

try {
    $conn = Database::getConnection();
    
    // Fetch data from agenda table
    $stmtAgenda = $conn->query("SELECT * FROM agenda ORDER BY tgl_agenda DESC");
    $agenda = $stmtAgenda->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch data from pengumuman table
    $stmtPengumuman = $conn->query("SELECT * FROM pengumuman ORDER BY id_pengumuman DESC");
    $pengumuman = $stmtPengumuman->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch data from berita table
    $stmtBerita = $conn->query("SELECT * FROM berita ORDER BY tanggal DESC");
    $berita = $stmtBerita->fetchAll(PDO::FETCH_ASSOC);
    
    // Return combined data as JSON
    echo json_encode([
        'status' => 'success',
        'data' => [
            'agenda' => $agenda,
            'pengumuman' => $pengumuman,
            'berita' => $berita
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
