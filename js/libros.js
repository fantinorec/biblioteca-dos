// js/libros.js
const API = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", () => {
    try { cargarAutores(); } catch (e) { console.error("Error al cargar autores:", e); }
    try { cargarCategorias(); } catch (e) { console.error("Error al cargar categorías:", e); }
    try { cargarSelectPerfiles(); } catch (e) { console.error("Error al cargar perfiles en select:", e); }

    // 2. Carga segura del resto de componentes de las tablas
    try { cargarLibros(); } catch (e) { console.error("Error:", e); }
    try { cargarPrestamosAdmin(); } catch (e) { console.error("Error:", e); }
    try { cargarTablaCategorias(); } catch (e) { console.error("Error:", e); }
    try { cargarTablaLectores(); } catch (e) { console.error("Error:", e); }
    try { cargarTablaAutores(); } catch (e) { console.error("Error:", e); }
    try { cargarTablaPerfiles(); } catch (e) { console.error("Error:", e); }

    const mapeoFormularios = { 
        formLibro: guardarLibro, 
        formCategoria: guardarCategoria, 
        formRegistro: procesarRegistroUsuario, 
        formLector: guardarLectorAdmin,
        formAutor: guardarAutor,
        formPerfilModulo: guardarPerfilModulos
    };
    Object.entries(mapeoFormularios).forEach(([id, funcion]) => document.getElementById(id)?.addEventListener("submit", funcion));
});

// api
async function peticionAPI(url, datos = null, metodo = "POST") {
    try {
        const opciones = { method: metodo, headers: { "Content-Type": "application/json" } };
        if (datos) opciones.body = JSON.stringify(datos);
        
        const res = await fetch(url, opciones);
        return await res.json();
    } catch (err) {
        console.error(`Error en ${url}:`, err);
        return { ok: false, mensaje: "Error de conexión con el servidor." };
    }
}

const alerta = (icono, titulo, texto, clases = 'btn-swal-confirm') => 
    Swal.fire({ icon: icono, title: titulo, text: texto, customClass: { confirmButton: clases } });

//reg
function validarContrasenas() {
    const c1 = document.getElementById("password").value, c2 = document.getElementById("confirm_password").value;
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(c1)) return !alerta('error', 'Contraseña poco segura', 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número.', 'btn-swal-error');
    if (c1 !== c2) return !alerta('error', 'Las contraseñas no coinciden', 'Verificá ambos campos.', 'btn-swal-error');
    return true;
}

async function procesarRegistroUsuario(e) {
    e.preventDefault();
    if (!validarContrasenas()) return;
    const datos = { nombre: document.getElementById("nombre_usuario").value, email: document.getElementById("email_usuario").value, password: document.getElementById("password").value };
    const res = await peticionAPI(`${API}/registro_usuario.php`, datos);
    if (res.ok) { alerta('success', '¡Registro Exitoso!', res.mensaje, 'btn-swal-success'); document.getElementById("formRegistro").reset(); }
    else alerta('error', 'Error', res.mensaje, 'btn-swal-error');
}

// libros
async function guardarLibro(e) {
    e.preventDefault();
    const id = document.getElementById("idLibro").value;
    const datos = { id, titulo: document.getElementById("titulo").value, descripcion: document.getElementById("descripcion").value, stock: document.getElementById("stock").value, id_autor: document.getElementById("id_autor").value, id_categoria: document.getElementById("id_categoria").value };
    
    const res = await peticionAPI(`${API}/${id ? 'editar_libro' : 'crear_libro'}.php`, datos);
    if (res.ok) {
        alerta('success', '¡Excelente!', res.mensaje, 'btn-swal-success');
        document.getElementById("formLibro").reset();
        document.getElementById("idLibro").value = "";
        document.getElementById("btnGuardar").textContent = "Guardar Libro";
        cargarLibros();
    } else alerta('error', 'Hubo un error', res.mensaje, 'btn-swal-error');
}

async function cargarLibros() {
    const libros = await peticionAPI(`${API}/libros.php`, null, "GET");
    const lista = document.getElementById("contenido");
    if (!lista || !Array.isArray(libros)) return;
    lista.innerHTML = libros.map(l => {
        const tEsc = (l.titulo || '').replace(/'/g, '&#39;'), dEsc = (l.descripcion || '').replace(/'/g, '&#39;');
        return `<tr><td><strong>${l.titulo || 'Sin Título'}</strong></td><td>${l.autor || 'Sin Autor'}</td><td>${l.categoria || 'Sin Categoría'}</td><td>${l.stock || 0} u.</td>
        <td><button class="btn-edit" onclick="editarLibro(${l.id},'${tEsc}','${dEsc}','${l.stock}','${l.id_autor}','${l.id_categoria}')">✏️ Editar</button>
        <button class="btn-delete" onclick="eliminarLibro(${l.id})">🗑️ Eliminar</button></td></tr>`;
    }).join('');
}

function editarLibro(id, t, d, s, a, c) {
    [['idLibro', id], ['titulo', t], ['descripcion', d], ['stock', s], ['id_autor', a], ['id_categoria', c]].forEach(([id, v]) => document.getElementById(id).value = v);
    document.getElementById("btnGuardar").textContent = "Actualizar Libro";
}

async function eliminarLibro(id) {
    Swal.fire({ title: '¿Estás seguro?', text: "Esta acción es permanente.", icon: 'warning', showCancelButton: true, customClass: { confirmButton: 'btn-swal-delete-confirm', cancelButton: 'btn-swal-cancel' }, confirmButtonText: 'Sí', cancelButtonText: 'No' }).then(async (r) => {
        if (!r.isConfirmed) return;
        const res = await peticionAPI(`${API}/eliminar_libro.php`, { id });
        alerta(res.ok ? 'success' : 'error', res.ok ? '¡Eliminado!' : 'Error', res.mensaje, res.ok ? 'btn-swal-success' : 'btn-swal-error');
        cargarLibros();
    });
}

// categoria
async function cargarSelector(url, idElemento, prefijo) {
    const datos = await peticionAPI(url, null, "GET");
    const select = document.getElementById(idElemento);
    if (!select || !Array.isArray(datos)) return;
    select.innerHTML = `<option value="">Seleccione ${prefijo}</option>` + datos.map(d => `<option value="${d.id}">${d.nombre}</option>`).join('');
}
const cargarAutores = () => cargarSelector(`${API}/autores.php`, "id_autor", "un autor");
const cargarCategorias = () => cargarSelector(`${API}/categorias.php`, "id_categoria", "una categoría");

async function guardarCategoria(e) {
    e.preventDefault();
    const res = await peticionAPI(`${API}/categorias.php`, { nombre: document.getElementById("nombre_categoria").value });
    if (res.ok) { alerta('success', '¡Guardada!', res.mensaje, 'btn-swal-success'); document.getElementById("formCategoria").reset(); cargarTablaCategorias(); cargarCategorias(); }
    else alerta('error', 'Error', res.mensaje, 'btn-swal-error');
}

async function cargarTablaCategorias() {
    const cats = await peticionAPI(`${API}/categorias.php`, null, "GET");
    const tabla = document.getElementById("contenido-categorias");
    if (!tabla || !Array.isArray(cats)) return;
    tabla.innerHTML = cats.length ? cats.map(c => `<tr><td>#${c.id}</td><td><strong>${c.nombre}</strong></td><td><span class="text-activo">✔ Activo</span></td></tr>`).join('') : `<tr><td colspan="3" class="table-empty-notice">No hay categorías.</td></tr>`;
}

//autores
async function guardarAutor(e) {
    e.preventDefault();
    const res = await peticionAPI(`${API}/autores.php`, { nombre: document.getElementById("nombre_autor").value });
    if (res.ok) { 
        alerta('success', '¡Autor Guardado!', res.mensaje, 'btn-swal-success'); 
        document.getElementById("formAutor").reset(); 
        cargarTablaAutores(); 
        cargarAutores();      
    } else {
        alerta('error', 'Error', res.mensaje, 'btn-swal-error');
    }
}

async function cargarTablaAutores() {
    const autores = await peticionAPI(`${API}/autores.php`, null, "GET");
    const tabla = document.getElementById("contenido-autores");
    if (!tabla || !Array.isArray(autores)) return;
    tabla.innerHTML = autores.length 
        ? autores.map(a => `<tr><td>#${a.id}</td><td><strong>${a.nombre}</strong></td></tr>`).join('') 
        : `<tr><td colspan="2" class="table-empty-notice">No hay autores registrados.</td></tr>`;
}

// prestamos
async function cargarPrestamosAdmin() {
    const prestamos = await peticionAPI(`${API}/prestamos.php`, null, "GET");
    const tabla = document.getElementById("contenido-prestamos-admin");
    if (!tabla || !Array.isArray(prestamos)) return;
    if (!prestamos.length) { tabla.innerHTML = `<tr><td colspan="5" class="table-empty-notice">No hay solicitudes.</td></tr>`; return; }
    
    tabla.innerHTML = prestamos.map(p => {
        const cls = p.estado === 'aprobado' ? 'badge-aprobado' : (p.estado === 'rechazado' ? 'badge-rechazado' : 'badge-pendiente');
        const acc = p.estado === 'pendiente' ? `<button class="btn-aprobar" onclick="resolverPrestamo(${p.id},${p.id_libro},'aprobado')">✓</button><button class="btn-delete btn-rechazar" onclick="resolverPrestamo(${p.id},${p.id_libro},'rechazado')">✕</button>` : `<span class="text-procesado">Procesado</span>`;
        return `<tr><td><strong>${p.usuario}</strong></td><td>${p.libro}</td><td>${new Date(p.fecha_solicitud).toLocaleDateString()}</td><td><span class="badge ${cls}">${p.estado.toUpperCase()}</span></td><td>${acc}</td></tr>`;
    }).join('');
}

async function resolverPrestamo(id_prestamo, id_libro, estado) {
    const res = await peticionAPI(`${API}/prestamos.php`, { id_prestamo, id_libro, estado });
    alerta(res.ok ? 'success' : 'error', res.ok ? '¡Procesado!' : 'Error', res.mensaje, 'btn-swal-confirm');
    cargarPrestamosAdmin(); cargarLibros();
}

// lectores
async function cargarTablaLectores() {
    const lectores = await peticionAPI(`${API}/lectores.php`, null, "GET");
    const tabla = document.getElementById("contenido-lectores");
    if (!tabla || !Array.isArray(lectores)) return;
    tabla.innerHTML = lectores.length ? lectores.map(l => `<tr><td>#${l.id}</td><td><strong>${l.nombre}</strong></td><td>${l.email}</td><td><button class="btn-delete btn-baja-lector" onclick="eliminarLectorLogico(${l.id})">🗑️ Baja</button></td></tr>`).join('') : `<tr><td colspan="4" class="table-empty-notice">No hay lectores activos.</td></tr>`;
}

async function guardarLectorAdmin(e) {
    e.preventDefault();
    const p = document.getElementById("password_lector").value;
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(p)) return alerta('error', 'Contraseña poco segura', 'Formato inválido.', 'btn-swal-error');

    const res = await peticionAPI(`${API}/lectores.php`, { nombre: document.getElementById("nombre_lector").value, email: document.getElementById("email_lector").value, password: p });
    if (res.ok) { alerta('success', '¡Creado!', res.mensaje, 'btn-swal-success'); document.getElementById("formLector").reset(); cargarTablaLectores(); }
    else alerta('error', 'Error', res.mensaje, 'btn-swal-error');
}

async function eliminarLectorLogico(id) {
    Swal.fire({ title: '¿Dar de baja?', text: "Se conservará su historial.", icon: 'warning', showCancelButton: true, customClass: { confirmButton: 'btn-swal-delete-confirm', cancelButton: 'btn-swal-cancel' } }).then(async (r) => {
        if (!r.isConfirmed) return;
        const res = await peticionAPI(`${API}/lectores.php`, { id, accion: "eliminar" });
        alerta(res.ok ? 'success' : 'error', res.ok ? '¡Procesado!' : 'Error', res.mensaje, res.ok ? 'btn-swal-success' : 'btn-swal-error');
        cargarTablaLectores();
    });
}

// perf y perm
async function cargarSelectPerfiles() {
    const perfiles = await peticionAPI(`${API}/perfiles.php`, null, "GET");
    const select = document.getElementById("select_perfil");
    if (!select || !Array.isArray(perfiles)) return;
    select.innerHTML = '<option value="">Seleccione...</option>' + perfiles.map(p => `<option value="${p.id}">${p.nombre.toUpperCase()}</option>`).join('');
}

async function cargarTablaPerfiles() {
    const perfiles = await peticionAPI(`${API}/perfiles.php`, null, "GET");
    const tabla = document.getElementById("contenido-perfiles");
    if (!tabla || !Array.isArray(perfiles)) return;
    tabla.innerHTML = perfiles.map(p => `<tr><td>#${p.id}</td><td><strong>${p.nombre.toUpperCase()}</strong></td></tr>`).join('');
}

async function cargarModulosDelPerfil(idPerfil) {
    if (!idPerfil) return;
    document.querySelectorAll('input[name="modulos_permisos"]').forEach(chk => chk.checked = false);
    
    const modulosPermitidos = await peticionAPI(`${API}/perfiles.php?id_perfil=${idPerfil}`, null, "GET");
    if (Array.isArray(modulosPermitidos)) {
        modulosPermitidos.forEach(mod => {
            const chk = document.querySelector(`input[name="modulos_permisos"][value="${mod}"]`);
            if (chk) chk.checked = true;
        });
    }
}

async function guardarPerfilModulos(e) {
    e.preventDefault();
    const id_perfil = document.getElementById("select_perfil").value;
    const chks = document.querySelectorAll('input[name="modulos_permisos"]:checked');
    const modulos = Array.from(chks).map(chk => chk.value);

    const res = await peticionAPI(`${API}/perfiles.php`, { id_perfil, modulos });
    if (res.ok) {
        alerta('success', '¡Permisos Actualizados!', res.mensaje, 'btn-swal-success');
    } else {
        alerta('error', 'Error', res.mensaje, 'btn-swal-error');
    }
}