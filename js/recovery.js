// frontend/js/recovery.js
const API = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formRecovery")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("emailRecovery").value.trim();

        // Deshabilitamos el botón para evitar múltiples clics mientras se envía el mail
        const btn = e.target.querySelector("button");
        btn.disabled = true;
        btn.textContent = "Enviando...";

        try {
            const respuesta = await fetch(`${API}/solicitar_recuperacion.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await respuesta.json();

            // Usamos SweetAlert2 (Requisito: Notificaciones con diseño propio)
            if (data.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Correo Despachado!',
                    text: data.mensaje,
                    confirmButtonColor: '#2563eb'
                }).then(() => {
                    window.location.href = "login.html";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un problema',
                    text: data.mensaje,
                    confirmButtonColor: '#dc2626'
                });
                btn.disabled = false;
                btn.textContent = "Enviar Enlace";
            }

        } catch (error) {
            console.error("Error en la solicitud de recuperación:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#dc2626'
            });
            btn.disabled = false;
            btn.textContent = "Enviar Enlace";
        }
    });
});