// frontend/js/permisos.js
console.log("PERMISOS.JS CARGADO");
const API_PERMISOS = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const respuesta = await fetch(
            `${API_PERMISOS}/modulos_perfiles.php`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await respuesta.json();

        if (!data.ok) {
            console.error(data.mensaje);
            return;
        }

        const modulosPermitidos = data.modulos || [];

        document.querySelectorAll(".menu-btn").forEach(btn => {

            const modulo = btn.dataset.target;

            // Siempre visible para admin
            if (modulo === "modulo-perfiles") {
                return;
            }

            if (!modulosPermitidos.includes(modulo)) {

                btn.style.display = "none";

                const seccion = document.getElementById(modulo);

                if (seccion) {
                    seccion.remove();
                }
            }

        });

        const primerBotonVisible = Array.from(
            document.querySelectorAll(".menu-btn")
        ).find(btn => btn.style.display !== "none");

        if (primerBotonVisible) {

            document
                .querySelectorAll(".menu-btn")
                .forEach(btn => btn.classList.remove("active"));

            document
                .querySelectorAll(".crud-section")
                .forEach(sec => sec.classList.add("hidden"));

            primerBotonVisible.classList.add("active");

            const moduloInicial = document.getElementById(
                primerBotonVisible.dataset.target
            );

            if (moduloInicial) {
                moduloInicial.classList.remove("hidden");
            }
        }

    } catch (error) {

        console.error(
            "Error cargando permisos:",
            error
        );

    }

});