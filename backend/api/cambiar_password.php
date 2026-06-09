<?php
// backend/api/cambiar_password.php
header("Content-Type: application/json");
require_once 'config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);
$token = $datos['token'] ?? '';
$nueva_password = $datos['password'] ?? '';

if (empty($token) || empty($nueva_password)) {
    echo json_encode(['ok' => false, 'mensaje' => 'Datos inválidos.']);
    exit;
}

// Buscamos si el token es válido y no expiró
$query = $pdo->prepare("SELECT id FROM usuarios WHERE token_recuperacion = :token AND expiracion_recuperacion > NOW()");
$query->execute([':token' => $token]);
$usuario = $query->fetch();

if (!$usuario) {
    echo json_encode(['ok' => false, 'mensaje' => 'El enlace de recuperación es inválido o ha expirado.']);
    exit;
}

// Actualizamos la contraseña y limpiamos los tokens de recuperación
$update = $pdo->prepare("UPDATE usuarios SET password = :password, token_recuperacion = NULL, expiracion_recuperacion = NULL WHERE id = :id");
$res = $update->execute([
    ':password' => password_hash($nueva_password, PASSWORD_BCRYPT),
    ':id' => $usuario['id']
]);

echo json_encode(['ok' => true, 'mensaje' => 'Contraseña actualizada correctamente. Ya podés iniciar sesión.']);