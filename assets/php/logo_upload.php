<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set JSON content type
header('Content-Type: application/json');

// Include database connection
require_once __DIR__ . '/db_connect.php';

// Get database connection
try {
    $pdo = getConnection();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

// Check if file was uploaded without errors
if (!isset($_FILES['logo_file']) || $_FILES['logo_file']['error'] !== UPLOAD_ERR_OK) {
    $errorMessage = 'No file uploaded or upload error occurred.';
    if (isset($_FILES['logo_file']['error'])) {
        switch ($_FILES['logo_file']['error']) {
            case UPLOAD_ERR_INI_SIZE:
                $errorMessage = 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
                break;
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage = 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage = 'The uploaded file was only partially uploaded';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMessage = 'No file was uploaded';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errorMessage = 'Missing a temporary folder';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errorMessage = 'Failed to write file to disk';
                break;
            case UPLOAD_ERR_EXTENSION:
                $errorMessage = 'A PHP extension stopped the file upload';
                break;
        }
    }
    
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $errorMessage,
        'debug' => $_FILES
    ]);
    exit;
}

$file = $_FILES['logo_file'];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid file type. Only JPG, JPEG, and PNG files are allowed.'
    ]);
    exit;
}

// Validate file size (2MB max)
$maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'File is too large. Maximum size allowed is 2MB.'
    ]);
    exit;
}

try {
    // Begin transaction
    $pdo->beginTransaction();

    // Read the file data
    $fileData = file_get_contents($file['tmp_name']);
    if ($fileData === false) {
        throw new Exception('Failed to read uploaded file.');
    }

    // Check if a logo with this category already exists
    $checkStmt = $pdo->prepare("SELECT id FROM files WHERE kategori = 'logo' LIMIT 1");
    $checkStmt->execute();
    $existingLogo = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingLogo) {
        // Update existing logo
        $stmt = $pdo->prepare(
            "UPDATE files 
            SET filename = :filename, 
                filetype = :filetype, 
                filedata = :filedata,
                created_at = CURRENT_TIMESTAMP 
            WHERE kategori = 'logo'"
        );
    } else {
        // Insert new logo
        $stmt = $pdo->prepare(
            "INSERT INTO files (kategori, filename, filetype, filedata) 
            VALUES ('logo', :filename, :filetype, :filedata)"
        );
    }

    // Bind parameters
    $stmt->bindParam(':filename', $file['name'], PDO::PARAM_STR);
    $stmt->bindParam(':filetype', $file['type'], PDO::PARAM_STR);
    $stmt->bindParam(':filedata', $fileData, PDO::PARAM_LOB);

    // Execute the query
    if ($stmt->execute()) {
        $pdo->commit();
        echo json_encode([
            'status' => 'success',
            'message' => 'Logo ' . ($existingLogo ? 'updated' : 'uploaded') . ' successfully.'
        ]);
    } else {
        $pdo->rollBack();
        throw new Exception('Failed to save logo to database.');
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>