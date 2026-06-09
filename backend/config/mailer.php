<?php
// backend/api/config/mailer.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carga de dependencias de la librería
require __DIR__ . '/../../vendor/autoload.php';

function enviarCorreo($para, $asunto, $cuerpoHTML) {
    $mail = new PHPMailer(true);

    try {
        // 1. Configuración del Servidor SMTP de Google
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';                   // Servidor oficial de Gmail
        $mail->SMTPAuth   = true;                               // Habilitar autenticación SMTP
        $mail->Username   = 'tu_correo_real@gmail.com';         // 👈 TU DIRECCIÓN DE GMAIL REAL
        $mail->Password   = 'abcd efgh ijkl mnop';              // 👈 LA CONTRASEÑA DE 16 LETRAS QUE CREASTE
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;     // Cifrado TLS requerido por Google
        $mail->Port       = 587;                                
    
        $mail->setFrom('tu_correo_real@gmail.com', 'Biblioteca Global');
        $mail->addAddress($para);

        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body    = $cuerpoHTML;
        $mail->CharSet = 'UTF-8'; 
        $mail->send();
        return true;
    } catch (Exception $e) {
        
        error_log("Error crítico de PHPMailer: " . $mail->ErrorInfo);
        return false;
    }
}