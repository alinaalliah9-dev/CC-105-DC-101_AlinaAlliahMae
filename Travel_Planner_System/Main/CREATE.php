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

// Check if this is a completion action
if (isset($_GET['action']) && $_GET['action'] === 'complete') {
    $planId = $_POST['completePlanId'];
    $completionText = $_POST['completionText'] ?? '';
    $imagePath = null;
    
    // Handle image upload
    if (isset($_FILES['completionImage']) && $_FILES['completionImage']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        
        // Create uploads directory if it doesn't exist
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileExtension = pathinfo($_FILES['completionImage']['name'], PATHINFO_EXTENSION);
        $fileName = 'memory_' . time() . '_' . uniqid() . '.' . $fileExtension;
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['completionImage']['tmp_name'], $targetPath)) {
            $imagePath = $targetPath;
        }
    }
    
    // Get plan details
    $stmt = $conn->prepare("SELECT place, target_date, todo_description FROM travel_plans WHERE id = ?");
    $stmt->bind_param("i", $planId);
    $stmt->execute();
    $result = $stmt->get_result();
    $plan = $result->fetch_assoc();
    $stmt->close();
    
    if ($plan) {
        // Insert into memories
        $stmt = $conn->prepare("INSERT INTO memories (plan_id, place, target_date, todo_description, completion_text, image_path) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $planId, $plan['place'], $plan['target_date'], $plan['todo_description'], $completionText, $imagePath);
        
        if ($stmt->execute()) {
            $stmt->close();
            
            // Delete the plan
            $stmt = $conn->prepare("DELETE FROM travel_plans WHERE id = ?");
            $stmt->bind_param("i", $planId);
            $stmt->execute();
            $stmt->close();
            
            echo json_encode(['success' => true, 'message' => 'Adventure completed and saved to memories!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save memory: ' . $stmt->error]);
            $stmt->close();
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Plan not found']);
    }
} else {
    // Regular plan creation
    $place = $_POST['place'];
    $targetDate = $_POST['targetDate'];
    $todoDescription = $_POST['todoDescription'];
    
    $stmt = $conn->prepare("INSERT INTO travel_plans (place, target_date, todo_description) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $place, $targetDate, $todoDescription);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Travel plan created successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create plan: ' . $stmt->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>