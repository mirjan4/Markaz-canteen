<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    try {
        // Delete records older than 7 days from today
        $limitDate = date('Y-m-d', strtotime('-7 days'));
        
        $stmt = $conn->prepare("DELETE FROM meals WHERE `date` < ?");
        if ($stmt->execute([$limitDate])) {
            $count = $stmt->rowCount();
            echo json_encode(["success" => true, "message" => "Deleted $count old records successfully."]);
        } else {
             echo json_encode(["success" => false, "message" => "Failed to delete records."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
