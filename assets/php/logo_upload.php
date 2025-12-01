<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set HTML content type
header('Content-Type: text/html; charset=utf-8');

// Function to show notification and redirect
function showNotificationAndRedirect($type, $message) {
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>Upload Logo - Notification</title>
        <meta http-equiv="refresh" content="2;url=' . htmlspecialchars($_SERVER['HTTP_REFERER']) . '">
        <style>
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 5px;
                color: white;
                font-family: Arial, sans-serif;
                z-index: 1000;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                animation: slideIn 0.5s, fadeOut 0.5s 1.5s forwards;
            }
            .success { background-color: #4CAF50; }
            .error { background-color: #f44336; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; visibility: hidden; }
            }
        </style>
    </head>
    <body>
        <div class="notification ' . $type . '">' . htmlspecialchars($message) . '</div>
    </body>
    </html>';
    exit;
}

// Include database connection
require_once __DIR__ . '/db_connect.php';

// Get database connection
try {
    $pdo = getConnection();
} catch (PDOException $e) {
    http_response_code(500);
    showNotificationAndRedirect('error', 'Database connection failed: ' . $e->getMessage());
}

// Check if file was uploaded without errors
if (!isset($_FILES['logo_file']) || $_FILES['logo_file']['error'] !== UPLOAD_ERR_OK) {
    $errorMessage = 'No file uploaded or upload error occurred.';
    if (isset($_FILES['logo_file']['error'])) {
        // Error handling for different upload errors
        // ... (keep existing error handling code)
    }
    http_response_code(400);
    showNotificationAndRedirect('error', $errorMessage);
}

$file = $_FILES['logo_file'];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    showNotificationAndRedirect('error', 'Invalid file type. Only JPG, JPEG, and PNG files are allowed.');
}

// Validate file size (2MB max)
$maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    showNotificationAndRedirect('error', 'File is too large. Maximum size allowed is 2MB.');
}

try {
    // Begin transaction
    $pdo->beginTransaction();

    // Set the target directory and filename
    $targetDir = __DIR__ . '/../../assets/img/';
    $targetFile = $targetDir . 'logo.png';
    $filePath = 'assets/img/logo.png';  // Relative path for database

    // Ensure the directory exists
    if (!file_exists($targetDir) && !mkdir($targetDir, 0755, true)) {
        throw new Exception('Failed to create upload directory.');
    }

    // Create image from uploaded file
    $image = null;
    $isPng = false;
    
    switch(strtolower($file['type'])) {
        case 'image/jpeg':
        case 'image/jpg':
            $image = imagecreatefromjpeg($file['tmp_name']);
            break;
        case 'image/png':
            $image = imagecreatefrompng($file['tmp_name']);
            $isPng = true;
            
            // Enable transparency handling for PNG
            imagealphablending($image, false);
            imagesavealpha($image, true);
            break;
        default:
            throw new Exception('Unsupported image format');
    }

    // Save as PNG and free memory
    if ($isPng) {
        // For PNG, preserve transparency
        if (!imagepng($image, $targetFile, 9)) {
            imagedestroy($image);
            throw new Exception('Failed to save PNG image file.');
        }
    } else {
        // For JPEG, convert to PNG with white background
        $newImage = imagecreatetruecolor(imagesx($image), imagesy($image));
        $white = imagecolorallocate($newImage, 255, 255, 255);
        imagefill($newImage, 0, 0, $white);
        imagecopy($newImage, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
        
        if (!imagepng($newImage, $targetFile, 9)) {
            imagedestroy($image);
            imagedestroy($newImage);
            throw new Exception('Failed to save image file.');
        }
        imagedestroy($newImage);
    }
    imagedestroy($image);

    // Check if logo setting already exists
    $checkStmt = $pdo->prepare("SELECT id FROM settings WHERE key = 'logo_path' LIMIT 1");
    $checkStmt->execute();
    $existingSetting = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingSetting) {
        // Update existing logo setting
        $stmt = $pdo->prepare(
            "UPDATE settings 
            SET value = :file_path,
                updated_at = CURRENT_TIMESTAMP 
            WHERE key = 'logo_path'"
        );
    } else {
        // Insert new logo setting
        $stmt = $pdo->prepare(
            "INSERT INTO settings (key, value) 
            VALUES ('logo_path', :file_path)"
        );
    }

    // Bind parameters
    $stmt->bindValue(':file_path', $filePath, PDO::PARAM_STR);

    // Execute the query
    if ($stmt->execute()) {
        // Get the current timestamp for cache busting
        $version = $pdo->query("SELECT EXTRACT(EPOCH FROM updated_at) FROM settings WHERE key = 'logo_path' LIMIT 1")->fetchColumn();
        
        $pdo->commit();
        showNotificationAndRedirect('success', 'Logo ' . ($existingSetting ? 'updated' : 'uploaded') . ' successfully!');
    } else {
        $pdo->rollBack();
        throw new Exception('Failed to save logo to database.');
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    showNotificationAndRedirect('error', 'An error occurred: ' . $e->getMessage());
}
?>