<?php
// backend/api/perfiles.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

include "../config/conexion.php";
$metodo = $_SERVER['REQUEST_METHOD'];

// ===================== LISTAR PERFILES O PERMISOS =====================
if ($metodo === 'GET') {
    // Si pasan un ID, traemos solo los módulos de ese perfil
    if (isset($_GET['id_perfil'])) {
        $id = intval($_GET['id_perfil']);
        $sql = "SELECT modulo FROM perfil_modulos WHERE id_perfil = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $res = $stmt->get_result();
        
        $modulos = [];
        while($f = $res->fetch_assoc()) { $modulos[] = $f['modulo']; }
        echo json_encode($modulos);
        exit;
    }

    // Si no hay ID, listamos todos los perfiles para la tabla y el select
    $resultado = $conexion->query("SELECT id, nombre FROM perfiles ORDER BY id ASC");
    $perfiles = [];
    while ($fila = $resultado->fetch_assoc()) { $perfiles[] = $fila; }
    echo json_encode($perfiles);
    exit;
}

// ===================== ASIGNAR MÓDULOS AL PERFIL =====================
if ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_perfil = intval($data['id_perfil']);
    $modulos = $data['modulos']; // Array de strings

    // 1. Limpiamos los permisos viejos del perfil
    $sqlDelete = "DELETE FROM perfil_modulos WHERE id_perfil = ?";
    $stmtDel = $conexion->prepare($sqlDelete);
    $stmtDel->bind_param("i", $id_perfil);
    $stmtDel->execute();

    // 2. Insertamos los nuevos checks marcados
    if (!empty($modulos)) {
        $sqlInsert = "INSERT INTO perfil_modulos (id_perfil, modulo) VALUES (?, ?)";
        $stmtIns = $conexion->prepare($sqlInsert);
        foreach ($modulos as $mod) {
            $modClean = trim($mod);
            $stmtIns->bind_param("is", $id_perfil, $modClean);
            $stmtIns->execute();
        }
    }

    echo json_encode(["ok" => true, "mensaje" => "Módulos asignados correctamente al perfil."]);
    exit;
}