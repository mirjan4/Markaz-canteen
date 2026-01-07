<?php
// Allow CORS generally
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db_connect.php';

// Get last 7 days
$history = [];
try {
    for ($i = 0; $i < 7; $i++) {
        $date = date('Y-m-d', strtotime("-$i days"));
        
        // Reuse similar logic to reports.php
        $stmt = $conn->prepare("SELECT 
            SUM(breakfast) as breakfast_count, 
            SUM(lunch) as lunch_count, 
            SUM(dinner) as dinner_count 
            FROM meals WHERE `date` = ?");
        $stmt->execute([$date]);
        $counts = $stmt->fetch(PDO::FETCH_ASSOC);

        // If no counts (all null), set to 0
        if (!$counts['breakfast_count']) $counts['breakfast_count'] = 0;
        if (!$counts['lunch_count']) $counts['lunch_count'] = 0;
        if (!$counts['dinner_count']) $counts['dinner_count'] = 0;

        $stmt = $conn->prepare("SELECT u.name, u.phone, m.breakfast, m.lunch, m.dinner 
            FROM meals m 
            JOIN users u ON m.user_id = u.id 
            WHERE m.`date` = ? 
            ORDER BY u.name ASC");
        $stmt->execute([$date]);
        $details = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $history[] = [
            "date" => $date,
            "counts" => $counts,
            "details" => $details
        ];
    }

    echo json_encode($history);
} catch (Exception $e) {
    echo json_encode(["valid_error" => $e->getMessage()]);
}
?>
