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

// Check if this is an overdue check action
if (isset($_GET['action']) && $_GET['action'] === 'check_overdue') {
    $today = date('Y-m-d');
    
    // Delete plans that are past their target date
    $stmt = $conn->prepare("DELETE FROM travel_plans WHERE target_date < ?");
    $stmt->bind_param("s", $today);
    $stmt->execute();
    
    $deletedCount = $stmt->affected_rows;
    $stmt->close();
    
    echo json_encode(['success' => true, 'deleted' => $deletedCount]);
} elseif (isset($_GET['action']) && $_GET['action'] === 'delete_memory') {
    // Delete memory
    $memoryId = $_POST['memoryId'];
    $imagePath = $_POST['imagePath'] ?? '';
    
    // Delete the image file if it exists
    if (!empty($imagePath) && file_exists($imagePath)) {
        unlink($imagePath);
    }
    
    $stmt = $conn->prepare("DELETE FROM memories WHERE id = ?");
    $stmt->bind_param("i", $memoryId);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Memory deleted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete memory: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    // Regular delete
    $planId = $_POST['planId'];
    
    $stmt = $conn->prepare("DELETE FROM travel_plans WHERE id = ?");
    $stmt->bind_param("i", $planId);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Travel plan deleted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete plan: ' . $stmt->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>