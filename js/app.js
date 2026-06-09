// frontend/js/app.js
const URL_BASE_AUTH = "http://localhost/Biblioteca_dos/backend/api";
const RAIZ_PROYECTO = "/Biblioteca_dos/frontend";

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", cerrarSesionSistema);
    verificarAccesoRuta();
});

async function cerrarSesionSistema() {
    if (!confirm("¿Seguro que deseas cerrar sesión?")) return;
    try {
        const respuesta = await fetch(`${URL_BASE_AUTH}/logout.php`);
        const data = await respuesta.json();
        if (data.ok) window.location.href = `${RAIZ_PROYECTO}/login.html`;
    } catch (error) {
        console.error("Error:", error);
    }
}

async function verificarAccesoRuta() {
    const rutaActual = window.location.pathname;
    
    // Rutas públicas
    const publicas = ["/login.html", "/registro.html", "/index.html"];
    if (publicas.some(r => rutaActual.includes(r)) || rutaActual === "/Biblioteca_dos/frontend/") {
        return; 
    }

    try {
        const respuesta = await fetch(`${URL_BASE_AUTH}/usuario_actual.php`);
        const data = await respuesta.json();

        if (!data.logueado) {
            window.location.href = `${RAIZ_PROYECTO}/login.html`;
            return;
        }

        // Control de Admin
        if (rutaActual.includes("/admin/")) {
            if (data.usuario.rol !== "admin") {
                window.location.href = `${RAIZ_PROYECTO}/login.html`;
            } else {
                const adminLabel = document.getElementById("admin-name");
                if (adminLabel) adminLabel.textContent = `Hola, ${data.usuario.nombre}`;
            }
        }
    } catch (error) {
        console.error("Error de acceso:", error);
        window.location.href = `${RAIZ_PROYECTO}/login.html`;
    }
}