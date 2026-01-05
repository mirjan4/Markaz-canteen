<?php
include 'db_connect.php';

$today = date('Y-m-d');
$tomorrow = date('Y-m-d', strtotime('+1 day'));

function getStats($conn, $date) {
    // Totals
    $stmt = $conn->prepare("SELECT 
        SUM(breakfast) as breakfast_count, 
        SUM(lunch) as lunch_count, 
        SUM(dinner) as dinner_count 
        FROM meals WHERE date = ?");
    $stmt->execute([$date]);
    $counts = $stmt->fetch(PDO::FETCH_ASSOC);

    // Details - Filter where at least one meal is selected? Or show all who submitted?
    // Usually show those who are eating.
    $stmt = $conn->prepare("SELECT u.name, u.phone, m.breakfast, m.lunch, m.dinner 
        FROM meals m 
        JOIN users u ON m.user_id = u.id 
        WHERE m.date = ? 
        ORDER BY u.name ASC");
    $stmt->execute([$date]);
    $details = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return [
        "date" => $date,
        "counts" => $counts,
        "details" => $details
    ];
}

$report = [
    "today" => getStats($conn, $today),
    "tomorrow" => getStats($conn, $tomorrow)
];

echo json_encode($report);
?>
