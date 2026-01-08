-- Active: 1767669899670@@127.0.0.1@3306@travel_planner

DROP DATABASE IF EXISTS travel_planner;
CREATE DATABASE IF NOT EXISTS travel_planner;
USE travel_planner;

CREATE TABLE IF NOT EXISTS travel_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place VARCHAR(255) NOT NULL,
    target_date DATE NOT NULL,
    todo_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT,
    place VARCHAR(255) NOT NULL,
    target_date DATE NOT NULL,
    todo_description TEXT NOT NULL,
    completion_text TEXT,
    image_path VARCHAR(255),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES travel_plans(id) ON DELETE SET NULL
);