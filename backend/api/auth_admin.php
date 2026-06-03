<?php
// backend/api/auth_admin.php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Permitir que el frontend (en localhost) lea las respuestas y mande las cookies de sesión
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 1. Verificación de sesión activa
if (!isset($_SESSION["usuario"])) {
    http_response_code(401); // 401 Unauthorized (No autenticado)
    echo json_encode([
        "ok" => false,
        "mensaje" => "Debes iniciar sesión para realizar esta acción."
    ]);
    exit;
}

// 2. Verificación de Rol Administrativo
if ($_SESSION["usuario"]["rol"] !== "admin") {
    http_response_code(403); // 403 Forbidden (Autenticado pero sin permisos)
    echo json_encode([
        "ok" => false,
        "mensaje" => "Acceso denegado. Se requieren permisos de administrador."
    ]);
    exit;
}

// Si pasa ambos filtros, el script que lo invocó continúa su ejecución normal...