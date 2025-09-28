const btnEditar = document.getElementById('btn-editar');
const btnGuardar = document.getElementById('btn-guardar');
const btnRegresar = document.querySelector('.btn-regresar');
const inputs = document.querySelectorAll('.formulario-libro input, .formulario-libro select');

// Obtener idLibro desde la URL
const params = new URLSearchParams(window.location.search);
const idLibro = params.get('id');

// Función para capitalizar la primera letra
function capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Función para validar libro
function validarLibro(datos) {
    // Título
    datos.titulo = capitalizar(datos.titulo.trim());
    if (!datos.titulo || datos.titulo.length < 2 || datos.titulo.length > 100) {
        alert("El título debe tener entre 2 y 100 caracteres.");
        return false;
    }

    // Autor
    datos.autor = capitalizar(datos.autor.trim());
    if (!datos.autor || datos.autor.length < 2 || datos.autor.length > 100) {
        alert("El autor debe tener entre 2 y 100 caracteres.");
        return false;
    }

    // ISBN (7 a 13 dígitos)
    const isbnPattern = /^\d{7,13}$/;
    if (!isbnPattern.test(datos.isbn)) {
        alert("ISBN inválido. Debe contener entre 7 y 13 dígitos.");
        return false;
    }

    // Fecha de ingreso
    if (!datos.fechaIngreso) {
        alert("La fecha de ingreso es obligatoria.");
        return false;
    }
    const fechaObj = new Date(datos.fechaIngreso);
    if (isNaN(fechaObj)) {
        alert("Fecha de ingreso inválida.");
        return false;
    }

 
    // Cantidad
    if (datos.cantidad === "" || datos.cantidad === null) {
    alert("La cantidad es obligatoria.");
    return false;
    }

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
        alert("Seleccione un estado.");
        return false;
    }

    return true; // Todo OK
}

// Traer datos del libro al cargar
fetch(`http://127.0.0.1:5000/api/libros/${idLibro}`)
  .then(res => res.json())
  .then(libro => {
    document.querySelector('input[name="titulo"]').value = libro.titulo;
    document.querySelector('input[name="autor"]').value = libro.autor;
    document.querySelector('input[name="isbn"]').value = libro.isbn;

    // Ajustar fecha a formato YYYY-MM-DD y guardar original
    if (libro.fechaIngreso) {
        const fecha = new Date(libro.fechaIngreso);
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        const fechaFormatted = `${yyyy}-${mm}-${dd}`;
        document.querySelector('input[name="fechaIngreso"]').value = fechaFormatted;
        fechaOriginal = fechaFormatted; // guardamos para validación
    }

    document.querySelector('input[name="cantidad"]').value = libro.cantidad;
    document.querySelector('select[name="categoria"]').value = libro.categoria;
    document.querySelector('select[name="estado"]').value = libro.estado;

    // Inicialmente deshabilitar campos
    inputs.forEach(input => input.setAttribute('disabled', true));
    btnGuardar.style.display = 'none';
  })
  .catch(err => console.error('Error al cargar libro:', err));

// Botón Editar
btnEditar.addEventListener('click', () => {
  inputs.forEach(input => {
    input.removeAttribute('disabled'); // quitar disabled
    input.removeAttribute('readonly'); // quitar readonly
  });
  btnEditar.style.display = 'none';
  btnGuardar.style.display = 'inline-block';
  btnRegresar.style.display = 'none';
});

// Botón Guardar
btnGuardar.addEventListener('click', () => {
  const datos = {
    titulo: document.querySelector('input[name="titulo"]').value,
    autor: document.querySelector('input[name="autor"]').value,
    isbn: document.querySelector('input[name="isbn"]').value,
    fechaIngreso: document.querySelector('input[name="fechaIngreso"]').value,
    cantidad: document.querySelector('input[name="cantidad"]').value,
    categoria: document.querySelector('select[name="categoria"]').value,
    estado: document.querySelector('select[name="estado"]').value
  };

  // Validaciones
  if (!validarLibro(datos)) return;

  console.log("Enviando PUT a:", `http://127.0.0.1:5000/api/libros/${idLibro}`);
console.log("Datos a enviar:", datos);

  // Enviar PUT a la API
  fetch(`http://127.0.0.1:5000/api/libros/${idLibro}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(resp => {
    alert(resp.mensaje);
    window.location.href = 'gestionarLibros.html';
  })
  .catch(err => console.error('Error al actualizar libro:', err));
});