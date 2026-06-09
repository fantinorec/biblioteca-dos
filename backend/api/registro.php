<?php

header("Content-Type: application/json; charset=UTF-8");

try {
   
    $host = 'localhost';
    $db   = 'biblioteca';
    $user = 'root'; 
    $pass = ''; 
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    require_once 'mailer.php';

  
    $datos = json_decode(file_get_contents("php://input"), true);
    $nombre = $datos['nombre'] ?? '';
    $email = $datos['email'] ?? '';
    $password = $datos['password'] ?? '';

    
    $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (:nombre, :email, :password)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nombre' => $nombre,
        ':email' => $email,
        ':password' => password_hash($password, PASSWORD_BCRYPT)
    ]);

    echo json_encode(['ok' => true, 'mensaje' => '¡Registro exitoso!']);

} catch (Exception $e) {

    error_log("Error en registro: " . $e->getMessage());

    
    echo json_encode([
        'ok' => false, 
        'mensaje' => 'No se pudo registrar'
    ]);
}