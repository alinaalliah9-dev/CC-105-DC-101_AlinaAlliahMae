<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "travel_planner";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$planId = $_POST['planId'];
$place = $_POST['place'];
$targetDate = $_POST['targetDate'];
$todoDescription = $_POST['todoDescription'];

$stmt = $conn->prepare("UPDATE travel_plans SET place = ?, target_date = ?, todo_description = ? WHERE id = ?");
$stmt->bind_param("sssi", $place, $targetDate, $todoDescription, $planId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Travel plan updated successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update plan: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>