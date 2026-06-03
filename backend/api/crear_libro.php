<?php

header("Content-Type: application/json");

include "../config/conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {

    echo json_encode([
        "ok" => false,
        "mensaje" => "No llegaron datos"
    ]);

    exit;
}

$titulo = trim($data["titulo"]);
$descripcion = trim($data["descripcion"]);
$stock = (int)$data["stock"];
$id_autor = (int)$data["id_autor"];
$id_categoria = (int)$data["id_categoria"];

$sql = "INSERT INTO libros
(
    titulo,
    descripcion,
    stock,
    id_autor,
    id_categoria
)
VALUES
(
    ?, ?, ?, ?, ?
)";

$stmt = $conexion->prepare($sql);

$stmt->bind_param(
    "ssiii",
    $titulo,
    $descripcion,
    $stock,
    $id_autor,
    $id_categoria
);

if ($stmt->execute()) {

    echo json_encode([
        "ok" => true,
        "mensaje" => "Libro creado"
    ]);

} else {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Error al crear"
    ]);
}