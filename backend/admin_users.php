<?php
include 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $stmt = $conn->prepare("SELECT id, name, phone, role, created_at FROM users ORDER BY created_at DESC");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(isset($data->name) && isset($data->phone)) {
        $name = $data->name;
        $phone = $data->phone;
        $password = isset($data->password) ? $data->password : $phone; // Default password is phone
        $role = "teacher"; // Admin creates teachers primarily

        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Check duplicate
        $check = $conn->prepare("SELECT id FROM users WHERE phone = ?");
        $check->execute([$phone]);
        if($check->rowCount() > 0){
            echo json_encode(["success" => false, "message" => "Phone number already exists"]);
            exit();
        }

        $sql = "INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        if($stmt->execute([$name, $phone, $hashed_password, $role])) {
            echo json_encode(["success" => true, "message" => "User created successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to create user"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Incomplete data"]);
    }
}
?>
