<?php
// backend/api/registro.php
header("Content-Type: application/json; charset=utf-8");

include "../config/conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

// Validamos que existan todos los campos obligatorios
if (!isset($data["nombre"]) || !isset($data["email"]) || !isset($data["password"]) || empty(trim($data["nombre"])) || empty(trim($data["email"])) || empty(trim($data["password"]))) {
    echo json_encode(["ok" => false, "mensaje" => "Todos los campos son obligatorios."]);
    exit;
}

$nombre = trim($data["nombre"]);
$email = trim($data["email"]);

// ===================== REQUISITO: VALIDACIÓN DE UNICIDAD =====================
$sqlCheck = "SELECT id FROM usuarios WHERE email = ?";
$stmtCheck = $conexion->prepare($sqlCheck);
$stmtCheck->bind_param("s", $email);
$stmtCheck->execute();
$resultadoCheck = $stmtCheck->get_result();

if ($resultadoCheck->num_rows > 0) {
    echo json_encode(["ok" => false, "mensaje" => "El correo electrónico ya está registrado."]);
    exit; // Frenamos el registro si el mail ya existe
}

// Encriptamos la contraseña de forma segura (Hash de contraseña)
$password = password_hash($data["password"], PASSWORD_DEFAULT);

// Insertamos el nuevo usuario (Por defecto con rol de lector/alumno)
$sql = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, 'lector')";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("sss", $nombre, $email, $password);

if ($stmt->execute()) {
    echo json_encode(["ok" => true, "mensaje" => "¡Usuario registrado con éxito!"]);
} else {
    echo json_encode(["ok" => false, "mensaje" => "Hubo un error al guardar en la base de datos."]);
}
exit;