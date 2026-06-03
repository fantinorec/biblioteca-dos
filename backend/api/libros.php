<?php

header("Content-Type: application/json");

include "../config/conexion.php";

$sql = "SELECT
            l.id,
            l.titulo,
            l.descripcion,
            l.stock,
            l.id_autor,
            l.id_categoria,
            a.nombre AS autor,
            c.nombre AS categoria
        FROM libros l
        LEFT JOIN autores a
            ON l.id_autor = a.id
        LEFT JOIN categorias c
            ON l.id_categoria = c.id
        ORDER BY l.id DESC";

$resultado = $conexion->query($sql);

$libros = [];

while ($fila = $resultado->fetch_assoc()) {

    $libros[] = $fila;
}

echo json_encode($libros);