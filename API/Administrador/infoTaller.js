document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const idTaller = params.get("id");

    if (!idTaller) {
        alert("ID de taller no encontrado");
        window.location.href = "gestionarTalleres.html";
        return;
    }

    const form = document.getElementById("form-taller");

    // Cargar datos del taller
    fetch(`http://127.0.0.1:5000/api/talleres/${idTaller}`)
        .then(res => res.json())
        .then(taller => {
            document.getElementById("nombre").value = taller.nombre;
            document.getElementById("tipo").value = taller.tipo;
            document.getElementById("fecha").value = taller.fecha;
            document.getElementById("hora").value = taller.hora;
            document.getElementById("ubicacion").value = taller.ubicacion;
            document.getElementById("estado").value = taller.estado;
            document.getElementById("detalles").value = taller.detalles;
        })
        .catch(err => {
            console.error("Error al cargar taller:", err);
            alert("No se pudo cargar la información del taller.");
            window.location.href = "gestionarTalleres.html";
        });

    // Validaciones antes de guardar
    async function validarFormulario(datos) {
        if (!datos.nombre.trim()) return "El título es obligatorio";

        // Pasar título y lugar a mayúsculas
        datos.nombre = datos.nombre.toUpperCase();
        datos.ubicacion = datos.ubicacion.toUpperCase();

        if (!datos.tipo) return "Debe seleccionar una categoría";
        if (!datos.fecha) return "La fecha es obligatoria";
        if (!datos.hora) return "La hora es obligatoria";
        if (!datos.ubicacion.trim()) return "El lugar es obligatorio";
        if (!datos.detalles.trim()) return "La descripción es obligatoria";

        // Validar que la fecha no sea menor a hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaIngresada = new Date(datos.fecha);
        if (fechaIngresada < hoy) {
            return "La fecha no puede ser menor a la actual";
        }

        // Validar título único (consulta a la API)
        try {
            const res = await fetch("http://127.0.0.1:5000/api/talleres");
            const talleres = await res.json();

            const repetido = talleres.some(
                t => t.nombre.toUpperCase() === datos.nombre && t.idTaller != idTaller
            );

            if (repetido) return "Ya existe un taller con este título";
        } catch (err) {
            console.error("Error validando título único:", err);
        }

        return null;
    }

    // Guardar cambios
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        let datos = {
            nombre: document.getElementById("nombre").value,
            tipo: document.getElementById("tipo").value,
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value,
            ubicacion: document.getElementById("ubicacion").value,
            estado: document.getElementById("estado").value,
            detalles: document.getElementById("detalles").value
        };

        const error = await validarFormulario(datos);
        if (error) {
            alert(error);
            return;
        }

        // Ya con las validaciones correctas, actualizamos
        fetch(`http://127.0.0.1:5000/api/talleres/${idTaller}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(res => res.json())
        .then(resp => {
            alert("Taller actualizado correctamente");
            window.location.href = "gestionarTalleres.html";
        })
        .catch(err => {
            console.error("Error al actualizar taller:", err);
            alert("Hubo un error al actualizar el taller.");
        });
    });
});
