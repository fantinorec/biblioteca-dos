<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Access-Control-Allow-Origin: http://localhost/Biblioteca_dos");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");


if (!isset($_SESSION["usuario"])) {
    http_response_code(401);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Debes iniciar sesión para realizar esta acción."
    ]);
    exit;
}


if (!isset($_SESSION["usuario"]["rol"]) || $_SESSION["usuario"]["rol"] !== "admin") {
    http_response_code(403);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Acceso denegado. Se requieren permisos de administrador."
    ]);
    exit;
}

