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

$type = $_GET['type'] ?? 'plans';

if ($type === 'plans') {
    $sql = "SELECT * FROM travel_plans ORDER BY target_date ASC";
    $result = $conn->query($sql);
    
    $plans = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $plans[] = $row;
        }
    }
    
    echo json_encode($plans);
} elseif ($type === 'memories') {
    $sql = "SELECT * FROM memories ORDER BY completed_at DESC";
    $result = $conn->query($sql);
    
    $memories = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $memories[] = $row;
        }
    }
    
    echo json_encode($memories);
}

$conn->close();
?>