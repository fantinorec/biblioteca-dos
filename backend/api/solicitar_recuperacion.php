<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


$host = 'localhost';
$db   = 'biblioteca'; 
$user = 'root'; 
$pass = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    require_once 'mailer.php';

    
    $datos = json_decode(file_get_contents("php://input"), true);
    $email = isset($datos['email']) ? trim($datos['email']) : '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['ok' => false, 'mensaje' => 'Por favor, ingrese un correo electrónico válido.']);
        exit;
    }

    
    $query = $pdo->prepare("SELECT id, nombre FROM usuarios WHERE email = :email AND estado = 1 LIMIT 1");
    $query->execute([':email' => $email]);
    $usuario = $query->fetch();

    if ($usuario) {
        
        $token = bin2hex(random_bytes(32));
        $expiracion = date("Y-m-d H:i:s", strtotime("+1 hour"));

        $update = $pdo->prepare("UPDATE usuarios SET token_recuperacion = :token, expiracion_recuperacion = :expiracion WHERE id = :id");
        $update->execute([
            ':token' => $token,
            ':expiracion' => $expiracion,
            ':id' => $usuario['id']
        ]);

        $enlaceRestablecer = "http://localhost/Biblioteca_dos/frontend/restablecer.html?token=" . $token;

        $asunto = "Restablecer tu contraseña - Biblioteca Global";
        $cuerpoHTML = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                <h2 style='color: #1e3a8a;'>Solicitud de Restablecimiento</h2>
                <p>Hola <strong>{$usuario['nombre']}</strong>,</p>
                <p>Recibimos una solicitud para cambiar tu contraseña.</p>
                <a href='{$enlaceRestablecer}' style='background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                    Restablecer Contraseña
                </a>
            </div>";

        enviarCorreo($email, $asunto, $cuerpoHTML);
    }

    echo json_encode([
        'ok' => true,
        'mensaje' => 'Si el correo ingresado es correcto, recibirás un enlace de recuperación.'
    ]);

} catch (Exception $e) {
    error_log("Error en recuperación: " . $e->getMessage());
    echo json_encode(['ok' => false, 'mensaje' => 'Error interno del servidor.']);
}