const API = "http://localhost/Biblioteca_dos/backend/api";

document.addEventListener("DOMContentLoaded", cargarPrestamos);

async function cargarPrestamos() {
    const respuesta = await fetch(`${API}/prestamos.php`); // Ajustá la ruta a tu archivo PHP
    const prestamos = await respuesta.json();
    const tbody = document.querySelector("#tablaPrestamos tbody");

    prestamos.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.usuario}</td>
                <td>${p.libro}</td>
                <td>${p.estado}</td>
                <td>
                    ${p.estado === 'pendiente' ? 
                      `<button onclick="cambiarEstado(${p.id}, 'aprobado', ${p.id_libro})">Aprobar</button>` : 
                      'Procesado'}
                </td>
            </tr>
        `;
    });
}

async function cambiarEstado(id_prestamo, estado, id_libro) {
    const res = await fetch(`${API}/prestamos.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_prestamo, estado, id_libro })
    });

    const data = await res.json();
    if (data.ok) {
        Swal.fire("Éxito", data.mensaje, "success").then(() => location.reload());
    } else {
        Swal.fire("Error", data.mensaje, "error");
    }
}