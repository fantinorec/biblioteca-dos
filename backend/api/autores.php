<?php
// backend/api/autores.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include "../config/conexion.php";
$metodo = $_SERVER['REQUEST_METHOD'];

// ===================== LISTAR AUTORES (GET) =====================
if ($metodo === 'GET') {
    $sql = "SELECT id, nombre FROM autores ORDER BY nombre ASC";
    $resultado = $conexion->query($sql);
    
    $autores = [];
    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $autores[] = [
                "id" => intval($fila["id"]),
                "nombre" => trim($fila["nombre"])
            ];
        }
    }
    echo json_encode($autores, JSON_UNESCAPED_UNICODE);
    exit;
}

// ===================== CREAR AUTOR (POST) =====================
if ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["nombre"]) || empty(trim($data["nombre"]))) {
        echo json_encode(["ok" => false, "mensaje" => "El nombre del autor es obligatorio."]);
        exit;
    }

    $nombre = trim($data["nombre"]);

    // Insertar en la base de datos
    $sql = "INSERT INTO autores (nombre) VALUES (?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $nombre);

    if ($stmt->execute()) {
        echo json_encode(["ok" => true, "mensaje" => "¡Autor '" . $nombre . "' registrado con éxito!"]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error al registrar el autor."]);
    }
    exit;
}