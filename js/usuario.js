const API = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        cargarPerfilLector();
        cargarCategoriasFiltro();
        cargarCatalogoLibros();
        cargarMisPrestamos();
    }, 100);

    const filtro = document.getElementById("filtro_categoria");
    if (filtro) {
        filtro.addEventListener("change", cargarCatalogoLibros);
    }
});

// Perfil
async function cargarPerfilLector() {
    try {
        const respuesta = await fetch(`${API}/usuario_actual.php`, { credentials: "include" });
        const data = await respuesta.json();
        if (data.logueado) {
            if (document.getElementById("nombre")) document.getElementById("nombre").textContent = `👋 ${data.usuario.nombre}`;
            if (document.getElementById("email")) document.getElementById("email").textContent = data.usuario.email;
        } else {
            window.location.href = "login.html";
        }
    } catch (error) { console.error("Error perfil:", error); }
}

// Categorías
async function cargarCategoriasFiltro() {
    try {
        const respuesta = await fetch(`${API}/categorias.php`);
        const categorias = await respuesta.json();
        const select = document.getElementById("filtro_categoria");
        if (!select) return;
        select.innerHTML = `<option value="">Todas las categorías</option>`;
        categorias.forEach(cat => { select.innerHTML += `<option value="${cat.nombre}">${cat.nombre}</option>`; });
    } catch (error) { console.error("Error categorías:", error); }
}

// Catálogo
async function cargarCatalogoLibros() {
    try {
        const respuesta = await fetch(`${API}/libros.php`);
        const libros = await respuesta.json();
        const grid = document.getElementById("grid-libros");
        if (!grid) return;
        const filtroElement = document.getElementById("filtro_categoria");
        const categoriaSeleccionada = filtroElement ? filtroElement.value : "";
        grid.innerHTML = "";
        const librosFiltrados = libros.filter(l => !categoriaSeleccionada || l.categoria === categoriaSeleccionada);
        
        if (librosFiltrados.length === 0) {
            grid.innerHTML = `<div class="form-card" style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 30px;">No hay libros en esta categoría.</div>`;
            return;
        }

        librosFiltrados.forEach(libro => {
            const tieneStock = parseInt(libro.stock) > 0;
            grid.innerHTML += `
                <div class="form-card">
                    <h4>${libro.titulo}</h4>
                    <p>Por: ${libro.autor || 'Anónimo'}</p>
                    <p>Disponibles: ${libro.stock}</p>
                    <button class="${tieneStock ? 'btn-primary' : 'btn-delete'}" ${tieneStock ? `onclick="solicitarPrestamo(${libro.id})"` : "disabled"}>
                        ${tieneStock ? "📖 Solicitar Préstamo" : "❌ Sin Stock"}
                    </button>
                </div>
            `;
        });
    } catch (error) { console.error("Error catálogo:", error); }
}


async function cargarMisPrestamos() {
    const tbody = document.getElementById("tabla-prestamos");
    if (!tbody) return;
    try {
        const respuesta = await fetch(`${API}/prestamos.php`, { credentials: "include" });
        const prestamos = await respuesta.json();
        
        if (prestamos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3">No tienes préstamos.</td></tr>`;
            return;
        }
        tbody.innerHTML = prestamos.map(p => `
            <tr>
                <td>${p.titulo}</td>
                <td>${p.fecha_solicitud}</td>
                <td>${p.estado}</td>
            </tr>
        `).join('');
    } catch (error) { console.error("Error mis prestamos:", error); }
}

// Solicitar
async function solicitarPrestamo(idLibro) {
    if (!confirm("¿Solicitar este libro?")) return;
    try {
        const respuesta = await fetch(`${API}/crear_prestamo.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_libro: idLibro }),
            credentials: "include"
        });
        const data = await respuesta.json();
        alert(data.mensaje);
        if (data.ok) cargarCatalogoLibros();
    } catch (error) { console.error("Error solicitud:", error); }
}
