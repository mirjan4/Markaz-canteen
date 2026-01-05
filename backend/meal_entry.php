<?php
include 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper to check if date is valid (Today or Tomorrow)
function isValidDate($date) {
    $today = date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime('+1 day'));
    return ($date == $today || $date == $tomorrow);
}

if ($method == 'GET') {
    if(isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];
        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));

        $stmt = $conn->prepare("SELECT * FROM meals WHERE user_id = ? AND (date = ? OR date = ?)");
        $stmt->execute([$user_id, $today, $tomorrow]);
        $meals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($meals);
    }
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if(isset($data->user_id) && isset($data->date)) {
        $user_id = $data->user_id;
        $date = $data->date;
        $breakfast = !empty($data->breakfast) ? 1 : 0;
        $lunch = !empty($data->lunch) ? 1 : 0;
        $dinner = !empty($data->dinner) ? 1 : 0;

        if(!isValidDate($date)) {
            echo json_encode(["success" => false, "message" => "Invalid date: $date. Server Date: " . date('Y-m-d')]);
            exit();
        }

        try {
            $sql = "INSERT INTO meals (user_id, date, breakfast, lunch, dinner) VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE breakfast = VALUES(breakfast), lunch = VALUES(lunch), dinner = VALUES(dinner)";
            
            $stmt = $conn->prepare($sql);
            if($stmt->execute([$user_id, $date, $breakfast, $lunch, $dinner])) {
                echo json_encode(["success" => true, "message" => "Meal preferences saved"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to save (Execute returned false)"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Missing user_id or date"]);
    }
}
?>
