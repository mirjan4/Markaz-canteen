<?php
include 'db_connect.php';

$name = "Super Admin";
$phone = "9999999999";
$password = "admin"; 
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$role = "admin";

// Check if admin exists
$stmt = $conn->prepare("SELECT id FROM users WHERE phone = ?");
$stmt->execute([$phone]);

if ($stmt->rowCount() > 0) {
    echo json_encode(["message" => "Admin user already exists."]);
} else {
    $sql = "INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if ($stmt->execute([$name, $phone, $hashed_password, $role])) {
        echo json_encode(["message" => "Admin user created successfully. Login: 9999999999 / admin"]);
    } else {
        echo json_encode(["error" => "Failed to create admin user."]);
    }
}
?>
