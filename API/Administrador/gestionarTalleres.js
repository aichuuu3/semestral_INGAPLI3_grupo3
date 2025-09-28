document.addEventListener("DOMContentLoaded", function() {
    const tbody = document.getElementById("tabla-talleres-body");

    async function cargarTalleres() {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/talleres");
            const talleres = await res.json();

            tbody.innerHTML = ""; // limpiar tabla

            const hoy = new Date();
            hoy.setHours(0,0,0,0);

            talleres.forEach(taller => {
                const tr = document.createElement("tr");

                const fechaTaller = new Date(taller.fecha);
                fechaTaller.setHours(0,0,0,0);

                tr.innerHTML = `
                    <td>${taller.nombre}</td>
                    <td>${fechaTaller.toLocaleDateString()}</td>
                    <td>${taller.hora}</td>
                    <td>${taller.ubicacion}</td>
                    <td>${taller.tipo}</td>
                    <td>
                        <span class="estado ${fechaTaller >= hoy ? 'activo' : 'inactivo'}">
                            ${fechaTaller >= hoy ? 'Activo' : 'Finalizado'}
                        </span>
                    </td>
                    <td>${taller.detalles}</td>
                    <td>
                        <button class="btn-editar" data-id="${taller.idTaller}">Editar</button>
                        <button class="btn-eliminar" data-id="${taller.idTaller}">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // --- Eventos dinámicos para los botones ---
            document.querySelectorAll(".btn-editar").forEach(btn => {
                btn.addEventListener("click", function() {
                    const id = this.getAttribute("data-id");
                    // Redirige a infoTaller.html con el id
                    window.location.href = `infoTaller.html?id=${id}`;
                });
            });

            document.querySelectorAll(".btn-eliminar").forEach(btn => {
                btn.addEventListener("click", async function() {
                    const id = this.getAttribute("data-id");
                    if (confirm("¿Seguro que quieres eliminar este taller?")) {
                        try {
                            await fetch(`http://127.0.0.1:5000/api/talleres/${id}`, {
                                method: "DELETE"
                            });
                            alert("Taller eliminado con éxito");
                            cargarTalleres(); // recargar tabla
                        } catch (err) {
                            console.error("Error al eliminar taller:", err);
                        }
                    }
                });
            });

        } catch (err) {
            console.error("Error al cargar talleres:", err);
        }
    }

    cargarTalleres();
});
