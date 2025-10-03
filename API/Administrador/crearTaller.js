document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-taller");

    // Validaciones antes de enviar
    function validarFormulario(datos) {
        // Convertir título y lugar a mayúsculas
        datos.nombre = datos.nombre.trim().toUpperCase();
        datos.ubicacion = datos.ubicacion.trim().toUpperCase();

        if (!datos.nombre) return "El título es obligatorio";
        if (!datos.tipo) return "Debe seleccionar una categoría";
        if (!datos.fecha) return "La fecha es obligatoria";
        if (!datos.hora) return "La hora es obligatoria";
        if (!datos.ubicacion) return "El lugar es obligatorio";
        if (!datos.detalles.trim()) return "La descripción es obligatoria";

        // Validar fecha (hora local)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaIngresada = new Date(datos.fecha);
        fechaIngresada.setHours(0, 0, 0, 0);

        if (fechaIngresada < hoy) return "La fecha no puede ser menor a hoy";

        return null;
    }

    // Guardar nuevo taller
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const datos = {
            nombre: document.getElementById("nombre").value,
            tipo: document.getElementById("tipo").value,
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value,
            ubicacion: document.getElementById("ubicacion").value,
            estado: document.getElementById("estado").value,
            detalles: document.getElementById("detalles").value
        };

        const error = validarFormulario(datos);
        if (error) {
            alert(error);
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:5000/api/talleres", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (!res.ok) throw new Error("Error al crear taller");

            alert("Taller creado correctamente");
            window.location.href = "gestionarTalleres.html";
        } catch (err) {
            console.error(err);
            alert("Hubo un error al crear el taller");
        }
    });
});
