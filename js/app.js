// frontend/js/app.js
console.log("GUARDÍAN GLOBAL - APP CARGADO");

const URL_BASE_AUTH = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Configurar el botón de cerrar sesión de forma global (Sirve para Admin y Usuario)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", cerrarSesionSistema);
    }

    // 2. Ejecutar la protección automática de rutas según la pantalla actual
    verificarAccesoRuta();
});

// ===================== CERRAR SESIÓN (LOGOUT REAL) =====================
async function cerrarSesionSistema() {
    const confirmar = confirm("¿Seguro que deseas cerrar sesión?");
    if (!confirmar) return;

    try {
        // Llamamos a tu archivo logout.php para destruir la sesión en el servidor
        const respuesta = await fetch(`${URL_BASE_AUTH}/logout.php`);
        const data = await respuesta.json();

        if (data.ok) {
            // Evaluamos dónde estamos para redirigir correctamente al login.html
            if (window.location.pathname.includes("/admin/")) {
                window.location.href = "../login.html";
            } else {
                window.location.href = "login.html";
            }
        }
    } catch (error) {
        console.error("Error al procesar el cierre de sesión:", error);
        alert("Hubo un problema al conectar con el servidor.");
    }
}

// ===================== PROTECCIÓN DE RUTAS (GUARDIÁN) =====================
async function verificarAccesoRuta() {
    // Si estamos en index, login o registro, no hace falta bloquear la pantalla entera
    const rutaActual = window.location.pathname;
    if (rutaActual.includes("login.html") || rutaActual.includes("registro.html") || rutaActual.endsWith("frontend/") || rutaActual.includes("index.html")) {
        return; 
    }

    try {
        // Le preguntamos a tu API si hay alguien logueado
        const respuesta = await fetch(`${URL_BASE_AUTH}/usuario_actual.php`);
        const data = await respuesta.json();

        // CASO 1: No hay sesión activa en el servidor
        if (!data.logueado) {
            patearAlLogin(rutaActual);
            return;
        }

        // CASO 2: Intenta entrar al panel de administración pero NO es admin
        if (rutaActual.includes("/admin/") && data.usuario.rol !== "admin") {
            patearAlLogin(rutaActual);
            return;
        }

        // CASO 3: Es administrador y está en el dashboard
        if (rutaActual.includes("/admin/") && data.usuario.rol === "admin") {
            const adminLabel = document.getElementById("admin-name");
            if (adminLabel) {
                adminLabel.textContent = `Hola, ${data.usuario.nombre}`;
            }
        }

    } catch (error) {
        console.error("Error en el sistema de control de accesos:", error);
        patearAlLogin(rutaActual);
    }
}

// Función auxiliar para calcular la ruta de salida sin romper enlaces
function patearAlLogin(ruta) {
    if (ruta.includes("/admin/")) {
        window.location.href = "../login.html";
    } else {
        window.location.href = "login.html";
    }
}