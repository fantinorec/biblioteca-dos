// js/registro.js
const API = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formRegistro")?.addEventListener("submit", procesarRegistro);
});

// alert
const alerta = (icono, titulo, texto, clases = 'btn-swal-confirm') => 
    Swal.fire({ icon: icono, title: titulo, text: texto, customClass: { confirmButton: clases } });

//reg us
async function procesarRegistro(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) {
        return alerta('error', 'Contraseña poco segura', 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.', 'btn-swal-error');
    }

    try {
        const respuesta = await fetch(`${API}/registro.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await respuesta.json();

        if (data.ok) {
            //exito
            alerta('success', '¡Registro Exitoso!', data.mensaje, 'btn-swal-success');

            //log
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);

        } else {
            // Error si el email ya existe
            alerta('error', 'No se pudo registrar', data.mensaje, 'btn-swal-error');
        }

    } catch (error) {
        alerta('error', 'Error del servidor', 'Hubo un problema al procesar tu solicitud.', 'btn-swal-error');
        console.error("Error en el registro:", error);
    }
}