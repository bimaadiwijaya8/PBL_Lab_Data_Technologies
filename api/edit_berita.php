<?php
// Disable error display for API responses
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../assets/php/db_connect.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET (for fetching single berita) and POST (for updating) requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

try {
    $conn = Database::getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch single berita for editing
        if (!isset($_GET['id_berita'])) {
            echo json_encode([
                'success' => false,
                'message' => 'id_berita is required'
            ]);
            exit();
        }
        
        $id_berita = (int)$_GET['id_berita'];
        
        if ($id_berita <= 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid berita ID'
            ]);
            exit();
        }
        
        // Get berita data
        $query = "SELECT * FROM berita WHERE id_berita = :id_berita";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id_berita', $id_berita, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Berita tidak ditemukan'
            ]);
            exit();
        }
        
        $berita = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Format response
        echo json_encode([
            'success' => true,
            'data' => [
                'id_berita' => $berita['id_berita'],
                'judul' => $berita['judul'],
                'gambar' => $berita['gambar'],
                'informasi' => $berita['informasi'],
                'tanggal' => $berita['tanggal'],
                'author' => $berita['author'] ?? 'Admin',
                'status' => $berita['status'] ?? 'pending',
                'aksi' => $berita['aksi'] ?? 'pending'
            ]
        ]);
        
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Handle both JSON and multipart form data
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'multipart/form-data') !== false) {
            // Handle file upload
            $data = $_POST;
            $imageFile = null;
            $oldImagePath = null;
            
            // Get old image path for cleanup
            if (isset($data['id_berita'])) {
                $oldImageQuery = "SELECT gambar FROM berita WHERE id_berita = :id_berita";
                $oldImageStmt = $conn->prepare($oldImageQuery);
                $oldImageStmt->bindParam(':id_berita', $data['id_berita'], PDO::PARAM_INT);
                $oldImageStmt->execute();
                $oldImageData = $oldImageStmt->fetch(PDO::FETCH_ASSOC);
                $oldImagePath = $oldImageData['gambar'] ?? null;
            }
            
            // Process uploaded image
            if (isset($_FILES['gambar_berita']) && $_FILES['gambar_berita']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = '../assets/img/berita/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                $fileInfo = pathinfo($_FILES['gambar_berita']['name']);
                $extension = strtolower($fileInfo['extension']);
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                
                if (in_array($extension, $allowedExtensions)) {
                    $filename = 'berita_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
                    $uploadPath = $uploadDir . $filename;
                    
                    if (move_uploaded_file($_FILES['gambar_berita']['tmp_name'], $uploadPath)) {
                        $imageFile = 'assets/img/berita/' . $filename;
                        
                        // Delete old image if it exists and is different
                        if ($oldImagePath && $oldImagePath !== $imageFile) {
                            $oldFileFullPath = '../' . $oldImagePath;
                            if (file_exists($oldFileFullPath)) {
                                unlink($oldFileFullPath);
                                error_log("Deleted old image: " . $oldImagePath);
                            }
                        }
                    }
                }
            }
        } else {
            // Handle JSON data
            $json_input = file_get_contents('php://input');
            $data = json_decode($json_input, true);
            $imageFile = null;
        }
        
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
        
        // Check if berita exists
        $check_query = "SELECT id_berita, judul FROM berita WHERE id_berita = :id_berita";
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
        
        // Prepare update query
        $update_fields = [];
        $params = [':id_berita' => $id_berita];
        
        // Update fields if provided
        if (isset($data['judul'])) {
            $update_fields[] = "judul = :judul";
            $params[':judul'] = $data['judul'];
        }
        
        if (isset($data['informasi'])) {
            $update_fields[] = "informasi = :informasi";
            $params[':informasi'] = $data['informasi'];
        }
        
        if ($imageFile) {
            $update_fields[] = "gambar = :gambar";
            $params[':gambar'] = $imageFile;
        }
        
        if (isset($data['tanggal'])) {
            $update_fields[] = "tanggal = :tanggal";
            $params[':tanggal'] = $data['tanggal'];
        }
        
        if (isset($data['author'])) {
            $update_fields[] = "author = :author";
            $params[':author'] = $data['author'];
        }
        
        if (isset($data['status'])) {
            $update_fields[] = "status = :status";
            $params[':status'] = $data['status'];
        }
        
        if (isset($data['aksi'])) {
            $update_fields[] = "aksi = :aksi";
            $params[':aksi'] = $data['aksi'];
        }
        
        if (empty($update_fields)) {
            echo json_encode([
                'success' => false,
                'message' => 'No fields to update'
            ]);
            exit();
        }
        
        // Build and execute update query
        $update_query = "UPDATE berita SET " . implode(', ', $update_fields) . " WHERE id_berita = :id_berita";
        $update_stmt = $conn->prepare($update_query);
        
        foreach ($params as $key => $value) {
            $param_type = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
            $update_stmt->bindValue($key, $value, $param_type);
        }
        
        if ($update_stmt->execute()) {
            // Get updated data for response
            $updated_query = "SELECT * FROM berita WHERE id_berita = :id_berita";
            $updated_stmt = $conn->prepare($updated_query);
            $updated_stmt->bindParam(':id_berita', $id_berita, PDO::PARAM_INT);
            $updated_stmt->execute();
            $updated_data = $updated_stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("Berita updated: ID $id_berita, Judul: " . ($updated_data['judul'] ?? 'Unknown'));
            
            echo json_encode([
                'success' => true,
                'message' => 'Berita "' . htmlspecialchars($updated_data['judul']) . '" berhasil diperbarui',
                'data' => [
                    'id_berita' => $updated_data['id_berita'],
                    'judul' => $updated_data['judul'],
                    'gambar' => $updated_data['gambar'],
                    'informasi' => $updated_data['informasi'],
                    'tanggal' => $updated_data['tanggal'],
                    'author' => $updated_data['author'] ?? 'Admin',
                    'status' => $updated_data['status'] ?? 'pending',
                    'aksi' => $updated_data['aksi'] ?? 'pending'
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Gagal memperbarui berita'
            ]);
        }
    }
    
} catch (PDOException $e) {
    error_log("Database error in edit_berita.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("General error in edit_berita.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

$conn = null;
?>
