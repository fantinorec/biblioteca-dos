<?php

header("Content-Type: application/json");

include "../config/conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = (int)$data["id"];

$titulo = trim($data["titulo"]);
$descripcion = trim($data["descripcion"]);
$stock = (int)$data["stock"];
$id_autor = (int)$data["id_autor"];
$id_categoria = (int)$data["id_categoria"];

$sql = "UPDATE libros
SET
titulo = ?,
descripcion = ?,
stock = ?,
id_autor = ?,
id_categoria = ?
WHERE id = ?";

$stmt = $conexion->prepare($sql);

$stmt->bind_param(
    "ssiiii",
    $titulo,
    $descripcion,
    $stock,
    $id_autor,
    $id_categoria,
    $id
);

if ($stmt->execute()) {

    echo json_encode([
        "ok" => true,
        "mensaje" => "Libro actualizado"
    ]);

} else {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Error al actualizar"
    ]);
}