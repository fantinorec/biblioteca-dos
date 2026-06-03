<?php

header("Content-Type: application/json");

include "../config/conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = (int)$data["id"];

$sql = "DELETE FROM libros WHERE id = ?";

$stmt = $conexion->prepare($sql);

$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    echo json_encode([
        "ok" => true,
        "mensaje" => "Libro eliminado"
    ]);

} else {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Error al eliminar"
    ]);
}