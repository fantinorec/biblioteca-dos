<?php
// backend/api/lectores.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
include "../config/conexion.php";

$metodo = $_SERVER['REQUEST_METHOD'];

// ===================== LISTAR LECTORES (GET) =====================
if ($metodo === 'GET') {
    // Traemos solo los usuarios que tengan el rol 'lector' y estén activos (estado = 1)
    $sql = "SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'lector' AND estado = 1 ORDER BY id DESC";
    $resultado = $conexion->query($sql);
    
    $lectores = [];
    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $lectores[] = [
                "id" => intval($fila["id"]),
                "nombre" => trim($fila["nombre"]),
                "email" => trim($fila["email"]),
                "rol" => $fila["rol"]
            ];
        }
    }
    echo json_encode($lectores, JSON_UNESCAPED_UNICODE);
    exit;
}

// ===================== PROCESAR OPERACIONES (POST) =====================
if ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $accion = isset($data["accion"]) ? $data["accion"] : "";

    // ---- SUB-ACCIÓN 1: BAJA LÓGICA ----
    if ($accion === "eliminar") {
        if (!isset($data["id"]) || empty($data["id"])) {
            echo json_encode(["ok" => false, "mensaje" => "ID no especificado."]);
            exit;
        }

        $id_lector = intval($data["id"]);

        // BAJA LÓGICA: Cambiamos estado a 0 en vez de hacer DELETE
        $sqlDelete = "UPDATE usuarios SET estado = 0 WHERE id = ?";
        $stmtDelete = $conexion->prepare($sqlDelete);
        $stmtDelete->bind_param("i", $id_lector);

        if ($stmtDelete->execute()) {
            echo json_encode(["ok" => true, "mensaje" => "Lector deshabilitado correctamente."]);
        } else {
            echo json_encode(["ok" => false, "mensaje" => "No se pudo deshabilitar al lector."]);
        }
        exit;
    }

    // ---- SUB-ACCIÓN 2: CREAR NUEVO LECTOR ----
    // Validaciones básicas de campos
    if (!isset($data["nombre"]) || empty(trim($data["nombre"])) || !isset($data["email"]) || empty(trim($data["email"])) || !isset($data["password"]) || empty($data["password"])) {
        echo json_encode(["ok" => false, "mensaje" => "Todos los campos son obligatorios."]);
        exit;
    }

    $nombre = trim($data["nombre"]);
    $email = trim($data["email"]);
    // Encriptamos la contraseña con BCRYPT antes de guardar
    $password_hash = password_hash($data["password"], PASSWORD_BCRYPT); 

    // Validar unicidad de Email
    $sqlCheck = "SELECT id FROM usuarios WHERE email = ?";
    $stmtCheck = $conexion->prepare($sqlCheck);
    $stmtCheck->bind_param("s", $email);
    $stmtCheck->execute();
    if ($stmtCheck->get_result()->num_rows > 0) {
        echo json_encode(["ok" => false, "mensaje" => "Este correo electrónico ya está registrado."]);
        exit;
    }

    // Insertar el nuevo usuario con rol fixed 'lector' y estado '1'
    $sqlInsert = "INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES (?, ?, ?, 'lector', 1)";
    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtInsert->bind_param("sss", $nombre, $email, $password_hash);

    if ($stmtInsert->execute()) {
        echo json_encode(["ok" => true, "mensaje" => "¡Lector '" . $nombre . "' registrado con éxito!"]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error al registrar el lector."]);
    }
    exit;
}