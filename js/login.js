// frontend/js/login.js
const API = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("formLogin");
    const mensaje = document.getElementById("mensaje");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        // limp
        mensaje.textContent = "";
        mensaje.style.color = "initial"; 

        try {
            const respuesta = await fetch(`${API}/login.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", //sostiene &ses
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await respuesta.json();

            if (data.ok) {
                // red
                if (data.usuario && data.usuario.rol === "admin") {
                    // admin
                    window.location.href = "admin/dashboard.html";
                } else {
                    //panel bas
                    window.location.href = "usuario.html";
                }
            } else {
                // mal
                mensaje.textContent = data.mensaje;
                mensaje.style.color = "#dc2626"; 
            }

        } catch (error) {
            mensaje.textContent = "Error de conexión con el servidor";
            mensaje.style.color = "#dc2626";
            console.error("Error en el login interactivo:", error);
        }
    });
});