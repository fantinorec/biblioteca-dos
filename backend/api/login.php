<?php

session_start();

header("Content-Type: application/json");

include "../config/conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"]);
$password = trim($data["password"]);

$sql = "SELECT * FROM usuarios WHERE email = ?";

$stmt = $conexion->prepare($sql);

$stmt->bind_param("s", $email);

$stmt->execute();

$resultado = $stmt->get_result();

$usuario = $resultado->fetch_assoc();

if (!$usuario) {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Usuario no encontrado"
    ]);

    exit;
}

if (!password_verify($password, $usuario["password"])) {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Contraseña incorrecta"
    ]);

    exit;
}

$_SESSION["usuario"] = [
    "id" => $usuario["id"],
    "nombre" => $usuario["nombre"],
    "email" => $usuario["email"],
    "rol" => $usuario["rol"]
];

echo json_encode([
    "ok" => true,
    "usuario" => $_SESSION["usuario"]
]);