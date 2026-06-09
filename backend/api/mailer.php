<?php
// backend/api/mailer.php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Cargamos los archivos de PHPMailer
require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

function enviarCorreo($destinatario, $asunto, $cuerpo) {
    $mail = new PHPMailer(true);

    try {
        // Configuración del servidor
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        
        // CONFIGURACIÓN DE TU CUENTA
        $mail->Username   = 'marianellamiers@gmail.com'; // REEMPLAZÁ CON TU GMAIL
        $mail->Password   = 'rtwt equp agcb jnkm'; // REEMPLAZÁ CON LA DE 16 DÍGITOS
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        // Destinatarios
        $mail->setFrom('marianellamiers@gmail.com', 'Sistema Biblioteca');
        $mail->addAddress($destinatario);

        // Contenido
        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body    = $cuerpo;

        $mail->send();
        return true;
        
    } catch (Exception $e) {
        // Esto ayudará a ver errores en la consola del navegador si algo falla
        error_log("Error de PHPMailer: " . $mail->ErrorInfo);
        return false;
    }
}