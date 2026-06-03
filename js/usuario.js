// js/usuario.js
const API = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", () => {
    // valida acc
    setTimeout(() => {
        cargarPerfilLector();
        cargarCategoriasFiltro();
        cargarCatalogoLibros();
    }, 100);

    const filtro = document.getElementById("filtro_categoria");
    if (filtro) {
        filtro.addEventListener("change", cargarCatalogoLibros);
    }
});

// usuario
async function cargarPerfilLector() {
    try {
        const respuesta = await fetch(`${API}/usuario_actual.php`, { credentials: "include" });
        const data = await respuesta.json();

        if (data.logueado) {
            if (document.getElementById("nombre")) {
                document.getElementById("nombre").textContent = `👋 ${data.usuario.nombre}`;
            }
            if (document.getElementById("email")) {
                document.getElementById("email").textContent = data.usuario.email;
            }
        } else {
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Error al cargar perfil del usuario:", error);
    }
}

// ===================== CARGAR CATEGORÍAS EN EL FILTRO =====================
async function cargarCategoriasFiltro() {
    try {
        const respuesta = await fetch(`${API}/categorias.php`);
        const categorias = await respuesta.json();
        const select = document.getElementById("filtro_categoria");

        if (!select) return;

        select.innerHTML = `<option value="">Todas las categorías</option>`;

        categorias.forEach(cat => {
            select.innerHTML += `<option value="${cat.nombre}">${cat.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error cargando filtros de categorías:", error);
    }
}

// catalogo
async function cargarCatalogoLibros() {
    try {
        const respuesta = await fetch(`${API}/libros.php`);
        const libros = await respuesta.json();
        const grid = document.getElementById("grid-libros");
        
        if (!grid) return;
        
        const filtroElement = document.getElementById("filtro_categoria");
        const categoriaSeleccionada = filtroElement ? filtroElement.value : "";

        grid.innerHTML = "";

        const librosFiltrados = libros.filter(libro => {
            if (!categoriaSeleccionada) return true;
            return libro.categoria === categoriaSeleccionada;
        });

        // aviso
        if (librosFiltrados.length === 0) {
            grid.innerHTML = `
                <div class="form-card" style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 30px;">
                     No hay libros disponibles registrados en esta categoría.
                </div>`;
            return;
        }

        librosFiltrados.forEach(libro => {
            // disponible
            const tieneStock = parseInt(libro.stock) > 0;
            const btnClass = tieneStock ? "btn-primary" : "btn-delete";
            const btnTexto = tieneStock ? "📖 Solicitar Préstamo" : "❌ Sin Stock";
            const btnAtributo = tieneStock ? `onclick="solicitarPrestamo(${libro.id})"` : "disabled";

            grid.innerHTML += `
                <div class="form-card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <div>
                        <span style="font-size: 0.75rem; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #475569;">
                            ${libro.categoria || 'General'}
                        </span>
                        <h4 style="margin-top: 10px; font-size: 1.2rem; color: #1e3a8a; font-weight: bold;">${libro.titulo}</h4>
                        <p style="font-size: 0.85rem; color: #64748b; font-style: italic; margin-bottom: 8px;">Por: ${libro.autor || 'Anónimo'}</p>
                        <p style="font-size: 0.9rem; margin-bottom: 15px; color: #334155; line-height: 1.4;">${libro.descripcion || 'Sin descripción disponible.'}</p>
                    </div>
                    <div>
                        <p style="font-size: 0.85rem; margin-bottom: 10px; font-weight: bold;">
                            Disponibles: <span style="color: ${tieneStock ? '#10b981' : '#ef4444'}">${libro.stock} u.</span>
                        </p>
                        <button class="${btnClass}" ${btnAtributo} style="width: 100%; padding: 10px; font-size: 0.9rem; font-weight: bold; cursor: ${tieneStock ? 'pointer' : 'not-allowed'}">
                            ${btnTexto}
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar el catálogo de libros:", error);
    }
}

// solicita 
async function solicitarPrestamo(idLibro) {
    const confirmar = confirm("¿Deseas solicitar el préstamo de este libro?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API}/crear_prestamo.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id_libro: idLibro }),
            credentials: "include" 
        });

        const data = await respuesta.json();
        alert(data.mensaje);

        if (data.ok) {
            cargarCatalogoLibros();
        }

    } catch (error) {
        console.error("Error al procesar la solicitud de préstamo:", error);
        alert("Hubo un problema de conexión al enviar la solicitud.");
    }
}