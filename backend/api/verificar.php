<?php
// backend/api/verificar.php
require_once 'config/db.php'; // Tu conexión PDO

$token = $_GET['token'] ?? '';

if (empty($token)) {
    die("Token inválido.");
}

$query = $pdo->prepare("SELECT id FROM usuarios WHERE token_verificacion = :token");
$query->execute([':token' => $token]);
$usuario = $query->fetch();

if ($usuario) {
    // Activamos al usuario y limpiamos el token para que no se vuelva a usar
    $update = $pdo->prepare("UPDATE usuarios SET verificado = 1, token_verificacion = NULL WHERE id = :id");
    $update->execute([':id' => $usuario['id']]);

    // Lo redirigimos al login con un parámetro de éxito
    header("Location: ../../frontend/login.html?verificado=true");
    exit;
} else {
    echo "El enlace ha expirado o es inválido.";
}