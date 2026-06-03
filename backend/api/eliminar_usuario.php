<?php

//respuestas JSON y CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

//operador actul
session_start();
include "../config/conexion.php";

//logueado?
if (!isset($_SESSION["usuario"])) {
    echo json_encode(["ok" => false, "mensaje" => "No autorizado. Inicie sesión nuevamente."]);
    exit;
}

//datos js
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["id"]) || empty($data["id"])) {
    echo json_encode(["ok" => false, "mensaje" => "ID de usuario no especificado."]);
    exit;
}

$id_usuario_a_eliminar = intval($data["id"]);
$id_sesion_actual = intval($_SESSION["usuario"]["id"]); 

//exclusion usuario
if ($id_usuario_a_eliminar === $id_sesion_actual) {
    echo json_encode([
        "ok" => false, 
        "mensaje" => "Acción denegada: No podés eliminarte, desactivarte ni cambiarte el rol a vos mismo para no perder acceso al sistema."
    ]);
    exit;
}




$sql = "UPDATE usuarios SET estado = 0 WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_usuario_a_eliminar);

if ($stmt->execute()) {
    echo json_encode([
        "ok" => true,
        "mensaje" => "El usuario ha sido deshabilitado del sistema correctamente."
    ]);
} else {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error al intentar dar de baja al usuario en la base de datos."
    ]);
}
exit;