<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

function enviarCorreo($para, $asunto, $cuerpoHTML) {
    $mail = new PHPMailer(true);

    try {

        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';                   
        $mail->SMTPAuth   = true;                               
        $mail->Username   = 'tu_correo_real@gmail.com';         
        $mail->Password   = 'abcd efgh ijkl mnop';              
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;     
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
