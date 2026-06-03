<?php
session_start();
header("Content-Type: application/json");

// Habilitamos el reporte de errores internos en formato PDO
try {
    // IMPORTANTE: Aseguramos que el nombre de la BD sea exacto (Biblioteca_dos)
    $pdo = new PDO("mysql:host=localhost;dbname=biblioteca;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["error" => "Fallo en la conexión: " . $e->getMessage()]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// CASO 1: GET - El administrador pide ver todas las solicitudes
if ($metodo === 'GET') {
    try {
        // Traemos el préstamo junto al nombre del usuario y el título del libro
        $query = "SELECT p.id, u.nombre AS usuario, l.titulo AS libro, l.id AS id_libro, p.fecha_solicitud, p.estado 
                  FROM prestamos p
                  JOIN usuarios u ON p.id_usuario = u.id
                  JOIN libros l ON p.id_libro = l.id
                  ORDER BY p.fecha_solicitud DESC";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($resultado);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
    }
    exit;
}

// CASO 2: POST - El administrador aprueba o rechaza una solicitud
if ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id_prestamo']) || !isset($data['estado']) || !isset($data['id_libro'])) {
        echo json_encode(["ok" => false, "mensaje" => "Datos incompletos recibidos en el servidor."]);
        exit;
    }

    $id_prestamo = $data['id_prestamo'];
    $nuevo_estado = $data['estado']; // 'aprobado' o 'rechazado'
    $id_libro = $data['id_libro'];

    try {
        $pdo->beginTransaction();

        // 1. Actualizamos el estado del préstamo
        $queryUpdate = "UPDATE prestamos SET estado = :estado WHERE id = :id";
        $stmtUpdate = $pdo->prepare($queryUpdate);
        $stmtUpdate->execute(['estado' => $nuevo_estado, 'id' => $id_prestamo]);

        // 2. Si se aprueba, le restamos 1 al stock del libro automáticamente
        if ($nuevo_estado === 'aprobado') {
            $queryStock = "UPDATE libros SET stock = stock - 1 WHERE id = :id_libro AND stock > 0";
            $stmtStock = $pdo->prepare($queryStock);
            $stmtStock->execute(['id_libro' => $id_libro]);
        }

        $pdo->commit();
        echo json_encode(["ok" => true, "mensaje" => "Solicitud procesada como: " . $nuevo_estado]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["ok" => false, "mensaje" => "Error al procesar el cambio: " . $e->getMessage()]);
    }
    exit;
}