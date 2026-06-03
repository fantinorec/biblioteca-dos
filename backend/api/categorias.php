<?php
// backend/api/categorias.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include "../config/conexion.php";

$metodo = $_SERVER['REQUEST_METHOD'];

// ===================== LISTAR CATEGORÍAS (GET) =====================
if ($metodo === 'GET') {
    $sql = "SELECT id, nombre FROM categorias ORDER BY id DESC";
    $resultado = $conexion->query($sql);
    
    $categorias = [];
    
    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $categorias[] = [
                "id" => intval($fila["id"]),
                "nombre" => trim($fila["nombre"])
            ];
        }
    }
    
    echo json_encode($categorias, JSON_UNESCAPED_UNICODE);
    exit;
}

// ===================== CREAR NUEVA CATEGORÍA (POST) =====================
if ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["nombre"]) || empty(trim($data["nombre"]))) {
        echo json_encode(["ok" => false, "mensaje" => "El nombre de la categoría es obligatorio."]);
        exit;
    }

    $nombre = trim($data["nombre"]);

    // Verificar duplicados
    $sqlCheck = "SELECT id FROM categorias WHERE nombre = ?";
    $stmtCheck = $conexion->prepare($sqlCheck);
    $stmtCheck->bind_param("s", $nombre);
    $stmtCheck->execute();
    
    if ($stmtCheck->get_result()->num_rows > 0) {
        echo json_encode(["ok" => false, "mensaje" => "Esta categoría ya se encuentra registrada."]);
        exit;
    }

    // Insertar
    $sqlInsert = "INSERT INTO categorias (nombre) VALUES (?)";
    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtInsert->bind_param("s", $nombre);

    if ($stmtInsert->execute()) {
        echo json_encode([
            "ok" => true, 
            "mensaje" => "¡Categoría '" . $nombre . "' agregada de manera exitosa!"
        ]);
    } else {
        echo json_encode([
            "ok" => false, 
            "mensaje" => "No se pudo registrar la categoría."
        ]);
    }
    exit;
}