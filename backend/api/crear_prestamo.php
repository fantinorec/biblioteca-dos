<?php
// Permitir que el frontend lea la sesión mediante Fetch Credentials
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
header("Content-Type: application/json");

// Usamos tu archivo de conexión oficial para mantener el estándar del proyecto
include "../config/conexion.php"; 

// CORRECCIÓN CLAVE: Leemos el ID tal cual lo guarda tu login original
if (!isset($_SESSION['usuario']) || !isset($_SESSION['usuario']['id'])) {
    echo json_encode([
        "ok" => false, 
        "mensaje" => "Sesión no válida o expirada. Por favor, vuelva a iniciar sesión."
    ]);
    exit;
}

$id_usuario = $_SESSION['usuario']['id']; 

// Leer el ID del libro enviado desde el JavaScript
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_libro'])) {
    echo json_encode(["ok" => false, "mensaje" => "No se especificó el libro a solicitar."]);
    exit;
}

$id_libro = $data['id_libro'];

try {
    // 1. Verificar si el libro tiene stock usando la variable $conexion de tu include
    $queryStock = "SELECT stock FROM libros WHERE id = ?";
    $stmtStock = $conexion->prepare($queryStock);
    $stmtStock->bind_param("i", $id_libro);
    $stmtStock->execute();
    $resultadoStock = $stmtStock->get_result();
    $libro = $resultadoStock->fetch_assoc();

    if (!$libro || $libro['stock'] <= 0) {
        echo json_encode(["ok" => false, "mensaje" => "Lo sentimos, este libro ya no tiene stock disponible."]);
        exit;
    }

    // 2. Insertar la solicitud de préstamo con estado 'pendiente'
    $queryInsert = "INSERT INTO prestamos (id_usuario, id_libro, estado) VALUES (?, ?, 'pendiente')";
    $stmtInsert = $conexion->prepare($queryInsert);
    $stmtInsert->bind_param("ii", $id_usuario, $id_libro);
    
    if ($stmtInsert->execute()) {
        echo json_encode(["ok" => true, "mensaje" => "¡Solicitud de préstamo enviada con éxito! Esperando aprobación del administrador."]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "No se pudo registrar la solicitud en la base de datos."]);
    }

} catch (Exception $e) {
    echo json_encode(["ok" => false, "mensaje" => "Error en el servidor: " . $e->getMessage()]);
}