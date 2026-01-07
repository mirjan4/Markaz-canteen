<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db_connect.php';

if (isset($_GET['user_id'])) {
    $user_id = $_GET['user_id'];
    $history = [];
    
    // Get last 7 days
    try {
        for ($i = 0; $i < 7; $i++) {
            $date = date('Y-m-d', strtotime("-$i days"));
            
            $stmt = $conn->prepare("SELECT breakfast, lunch, dinner FROM meals WHERE user_id = ? AND date = ?");
            $stmt->execute([$user_id, $date]);
            $meal = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$meal) {
                $meal = ['breakfast' => 0, 'lunch' => 0, 'dinner' => 0];
            }

            $history[] = [
                "date" => $date,
                "meals" => $meal
            ];
        }
        echo json_encode($history);
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Missing user_id"]);
}
?>
