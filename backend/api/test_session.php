<?php
session_start();
header("Content-Type: application/json");
echo json_encode([
    "session_id" => session_id(),
    "usuario_id" => $_SESSION['usuario_id'] ?? 'NO HAY SESION',
    "sesion_completa" => $_SESSION
]);