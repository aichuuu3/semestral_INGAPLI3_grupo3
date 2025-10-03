// script para manejar el formulario de agregar nuevo libro
const form = document.getElementById('form-libro');

// Función para capitalizar título
function capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Función para validar libro antes de enviar
async function validarLibro(datos) {
    // Título
    datos.titulo = capitalizar(datos.titulo.trim());
    if (!datos.titulo || datos.titulo.length < 2 || datos.titulo.length > 100) {
        alert("El título debe tener entre 2 y 100 caracteres.");
        return false;
    }

    // Autor
    datos.autor = datos.autor.trim().toUpperCase();
    if (!datos.autor || datos.autor.length < 2 || datos.autor.length > 100) {
        alert(" El autor debe tener entre 2 y 100 caracteres.");
        return false;
    }

    // ISBN (7 a 12 dígitos)
    const isbnPattern = /^\d{7,13}$/;
    if (!isbnPattern.test(datos.isbn)) {
        alert("ISBN inválido. Debe contener entre 1 a 7 dígitos.");
        return false;
    }

    // Fecha de ingreso
    // Fecha de ingreso (hoy o mayor)
if (!datos.fechaIngreso) {
    alert("La fecha de ingreso es obligatoria.");
    return false;
}

// Convertir string "YYYY-MM-DD" a Date correctamente
const partes = datos.fechaIngreso.split('-'); // ["2025","09","26"]
const fechaIngresada = new Date(partes[0], partes[1]-1, partes[2]); // mes 0-indexed
fechaIngresada.setHours(0,0,0,0); // normalizar a medianoche

const hoy = new Date();
hoy.setHours(0,0,0,0); // normalizar hoy

if (fechaIngresada < hoy) {
    alert("⚠️ La fecha de ingreso no puede ser menor a la fecha actual.");
    return false;
}


    // Cantidad
    const cantidadNum = Number(datos.cantidad);
    if (cantidadNum < 0 || !Number.isInteger(cantidadNum)) {
        alert("La cantidad debe ser un número entero no negativo.");
        return false;
    }

    // Categoría
    if (!datos.categoria) {
        alert("Seleccione una categoría.");
        return false;
    }

    // Estado
    if (!datos.estado) {
        datos.estado = "disponible";
    }

    // Validar duplicados en la BD
    const res = await fetch("http://127.0.0.1:5000/api/libros");
    const libros = await res.json();

    const tituloExistente = libros.some(libro => libro.titulo.toLowerCase() === datos.titulo.toLowerCase());
    if (tituloExistente) {
        alert("Ya existe un libro con ese título.");
        return false;
    }

    const isbnExistente = libros.some(libro => libro.isbn === datos.isbn);
    if (isbnExistente) {
        alert("Ya existe un libro con ese ISBN.");
        return false;
    }

    return true; // todo OK
}

// Manejo del submit
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const datos = {
        titulo: form.titulo.value,
        autor: form.autor.value,
        isbn: form.isbn.value,
        fechaIngreso: form.fechaIngreso.value,
        cantidad: form.cantidad.value,
        categoria: form.categoria.value,
        estado: form.estado ? form.estado.value : "disponible"
    };

    if (!await validarLibro(datos)) return;

    fetch("http://127.0.0.1:5000/api/libros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(resp => {
        alert(resp.mensaje);
        window.location.href = "gestionarLibros.html";
    })
    .catch(err => console.error("Error al crear libro:", err));
});
