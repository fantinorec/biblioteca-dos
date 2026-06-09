// js/registro.js
const API = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formRegistro");
    if (form) {
        form.addEventListener("submit", procesarRegistro);
    }
});

const alerta = (icono, titulo, texto) => {
    Swal.fire({ icon: icono, title: titulo, text: texto, confirmButtonColor: '#2563eb' });
};

async function procesarRegistro(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) {
        alerta('error', 'Contraseña poco segura', 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
        return;
    }

    if (password !== confirmPassword) {
        alerta('error', 'Las claves no coinciden', 'Por favor, verificá que ambas contraseñas sean iguales.');
        return;
    }

    // Guardamos la respuesta fuera del try para poder analizarla si falla el JSON
    let respuestaPlana = ""; 

    try {
        const respuesta = await fetch(`${API}/registro.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });

        // Guardamos el texto crudo por si las dudas no es un JSON válido
        respuestaPlana = await respuesta.text(); 
        
        // Intentamos transformarlo a JSON
        const data = JSON.parse(respuestaPlana);

        if (data.ok) {
            alerta('success', '¡Registro Exitoso!', data.mensaje);
            setTimeout(() => { window.location.href = "login.html"; }, 2500);
        } else {
            alerta('error', 'No se pudo registrar', data.mensaje);
        }

    } catch (error) {
        // ⚠️ DETECTOR DE ERRORES PHP: Si el JSON falló, mostramos el texto HTML real que mandó PHP
        console.error("Error original:", error);
        
        // Limpiamos un poco las etiquetas HTML para que se lea mejor en el alert
        const errorLimpio = respuestaPlana.replace(/<[^>]*>/g, ' ').substring(0, 300);

        Swal.fire({
            icon: 'error',
            title: 'Error interno de PHP',
            html: `<p>El servidor devolvió un error de código en vez de un JSON:</p>
                   <pre style="background: #f1f5f9; padding: 10px; text-align: left; font-size: 0.8rem; max-height: 150px; overflow-y: auto;">${errorLimpio || 'No se recibió respuesta del servidor (Ruta incorrecta).'}</pre>`,
            confirmButtonColor: '#dc2626'
        });
    }
}