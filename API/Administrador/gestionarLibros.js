document.addEventListener("DOMContentLoaded", function() {
    const tbody = document.getElementById("tabla-libros-body");

    // Obtener libros desde la API
    fetch("http://127.0.0.1:5000/api/libros")
        .then(res => res.json())
        .then(libros => {
            tbody.innerHTML = ""; // limpiar tabla
            libros.forEach(libro => {
                const tr = document.createElement("tr");

                // Cada celda
                tr.innerHTML = `
                    <td class="titulo-link" data-id="${libro.idLibro}">${libro.titulo}</td>
                    <td>${libro.autor}</td>
                    <td>${libro.isbn}</td>
                    <td>${libro.cantidad}</td>
                    <td>${libro.categoria}</td>
                    <td><span class="estado ${libro.estado === 'disponible' ? 'activo' : 'inactivo'}">
                        ${libro.estado === 'disponible' ? 'Disponible' : 'No Disponible'}
                    </span></td>
                `;
                tbody.appendChild(tr);
            });

            // Evento click en títulos para ir a infoLibro.html
            document.querySelectorAll(".titulo-link").forEach(td => {
                td.addEventListener("click", function() {
                    const idLibro = this.getAttribute("data-id");
                    window.location.href = `infoLibro.html?id=${idLibro}`;
                });
            });
        })
        .catch(err => console.error("Error al cargar libros:", err));
});
