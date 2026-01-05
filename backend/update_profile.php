<?php
include 'db_connect.php';
// header('Content-Type: application/json'); // Already set or implied? checking db_connect. 
// db_connect doesn't set Content-Type json usually? Let's check.
// api.js says "Content-Type: application/json" in Request.
// Response type? db_connect doesn't set it. I should set it.

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

if(isset($data->user_id) && isset($data->name) && isset($data->phone)) {
    $user_id = $data->user_id;
    $name = $data->name;
    $phone = $data->phone;
    
    // Check if phone already exists for OTHER user
    $check = $conn->prepare("SELECT id FROM users WHERE phone = ? AND id != ?");
    $check->execute([$phone, $user_id]);
    if($check->rowCount() > 0){
        echo json_encode(["success" => false, "message" => "Phone number already taken"]);
        exit();
    }

    if(!empty($data->password)) {
        $password = password_hash($data->password, PASSWORD_DEFAULT);
        $sql = "UPDATE users SET name=?, phone=?, password=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $res = $stmt->execute([$name, $phone, $password, $user_id]);
    } else {
        $sql = "UPDATE users SET name=?, phone=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $res = $stmt->execute([$name, $phone, $user_id]);
    }

    if($res) {
        // Return the updated user info so frontend can update localStorage
        echo json_encode([
            "success" => true, 
            "message" => "Profile updated successfully",
            "user" => [
                "id" => $user_id,
                "name" => $name,
                "phone" => $phone,
                "role" => "admin" // Assuming only admin uses this for now, or just preserve role from frontend
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update profile"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data"]);
}

