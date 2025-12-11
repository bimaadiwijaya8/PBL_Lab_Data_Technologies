<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$galeriDir = '../assets/img/galeri/';
$images = [];

// Check if directory exists
if (is_dir($galeriDir)) {
    // Get all image files from the directory
    $files = scandir($galeriDir);
    
    foreach ($files as $file) {
        // Skip . and .. and non-image files
        if ($file !== '.' && $file !== '..') {
            $filePath = $galeriDir . $file;
            
            // Check if it's a file and has valid image extension
            if (is_file($filePath)) {
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    // Get file info
                    $imageInfo = getimagesize($filePath);
                    $fileSize = filesize($filePath);
                    
                    // Create image data
                    $imageData = [
                        'id' => pathinfo($file, PATHINFO_FILENAME),
                        'filename' => $file,
                        'path' => 'assets/img/galeri/' . $file,
                        'title' => ucwords(str_replace(['-', '_'], ' ', pathinfo($file, PATHINFO_FILENAME))),
                        'category' => 'Kegiatan', // Default category
                        'size' => $fileSize,
                        'width' => $imageInfo[0] ?? null,
                        'height' => $imageInfo[1] ?? null,
                        'type' => $imageInfo['mime'] ?? 'image/' . $extension,
                        'created_at' => filemtime($filePath)
                    ];
                    
                    // Categorize based on filename patterns
                    $filenameLower = strtolower($file);
                    if (strpos($filenameLower, 'rapat') !== false) {
                        $imageData['category'] = 'Kegiatan';
                    } elseif (strpos($filenameLower, 'whatsapp') !== false || strpos($filenameLower, 'dokumentasi') !== false) {
                        $imageData['category'] = 'Dokumentasi';
                    } elseif (strpos($filenameLower, 'video') !== false || strpos($filenameLower, 'shooting') !== false) {
                        $imageData['category'] = 'Dokumentasi';
                    }
                    
                    $images[] = $imageData;
                }
            }
        }
    }
    
    // Sort images by creation date (newest first)
    usort($images, function($a, $b) {
        return $b['created_at'] - $a['created_at'];
    });
}

// Return response
echo json_encode([
    'success' => true,
    'data' => $images,
    'total' => count(images),
    'categories' => array_unique(array_column($images, 'category'))
]);
?>
