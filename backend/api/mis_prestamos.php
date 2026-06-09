<?php

header("Content-Type: application/json");
session_start();

include "../config/conexion.php";

// Verificar sesión
if (!isset($_SESSION["usuario"])) {
    echo json_encode([]);
    exit;
}

$usuario_id = $_SESSION["usuario"]["id"];

$sql = "
SELECT 
    p.id,
    l.titulo,
    p.fecha_solicitud,
    p.estado
FROM prestamos p
INNER JOIN libros l ON l.id = p.id_libro
WHERE p.usuario_id = ?
ORDER BY p.id DESC
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();

$resultado = $stmt->get_result();

$prestamos = [];

while ($fila = $resultado->fetch_assoc()) {
    $prestamos[] = $fila;
}

echo json_encode($prestamos);

exit;