// Función para validar formato de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para validar formato de cédula panameña
function validarCedula(cedula) {
    // Formato: X-XXX-XXXX (donde X son dígitos)
    const regex = /^\d{1,2}-\d{3,4}-\d{4,5}$/;
    return regex.test(cedula);
}

// Función para validar formato de teléfono
function validarTelefono(telefono) {
    // Acepta formatos: XXXX-XXXX, XXX-XXXX, +507-XXXX-XXXX
    const regex = /^(\+507-?)?\d{4}-?\d{4}$|^\d{3}-?\d{4}$/;
    return regex.test(telefono.replace(/\s/g, ''));
}

// Función para validar contraseña
function validarContrasena(contrasena) {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return regex.test(contrasena);
}

// Función para validar nombre completo
function validarNombre(nombre) {
    // Al menos 2 palabras, solo letras y espacios
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
    const palabras = nombre.trim().split(' ').filter(p => p.length > 0);
    return regex.test(nombre) && palabras.length >= 2;
}

// Función principal para validar solicitud de membresía
function validarSolicitudMembresia(datos) {
    const errores = [];
    
    // Validar nombre
    if (!datos.nombre || datos.nombre.trim() === '') {
        errores.push('El nombre es obligatorio');
    } else if (!validarNombre(datos.nombre)) {
        errores.push('El nombre debe contener al menos 2 palabras y solo letras');
    }
    
    // Validar cédula
    if (!datos.cedula || datos.cedula.trim() === '') {
        errores.push('La cédula es obligatoria');
    } else if (!validarCedula(datos.cedula)) {
        errores.push('La cédula debe tener el formato correcto (X-XXX-XXXX)');
    }
    
    // Validar teléfono
    if (!datos.telefono || datos.telefono.trim() === '') {
        errores.push('El teléfono es obligatorio');
    } else if (!validarTelefono(datos.telefono)) {
        errores.push('El teléfono debe tener un formato válido');
    }
    
    // Validar email
    if (!datos.correo || datos.correo.trim() === '') {
        errores.push('El correo electrónico es obligatorio');
    } else if (!validarEmail(datos.correo)) {
        errores.push('El correo electrónico no tiene un formato válido');
    }
    
    // Validar contraseña
    if (!datos.clave || datos.clave.trim() === '') {
        errores.push('La contraseña es obligatoria');
    } else if (!validarContrasena(datos.clave)) {
        errores.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
    }
    
    return {
        esValido: errores.length === 0,
        errores: errores
    };
}

// Función para validar login
function validarLogin(datos) {
    const errores = [];
    
    // Validar que se proporcione usuario (puede ser email o cédula)
    if (!datos.usuario || datos.usuario.trim() === '') {
        errores.push('El usuario (email o cédula) es obligatorio');
    } else {
        // Verificar si es email o cédula
        const esEmail = validarEmail(datos.usuario);
        const esCedula = validarCedula(datos.usuario);
        
        if (!esEmail && !esCedula) {
            errores.push('El usuario debe ser un email válido o una cédula con formato correcto');
        }
    }
    
    // Validar contraseña
    if (!datos.contrasena || datos.contrasena.trim() === '') {
        errores.push('La contraseña es obligatoria');
    }
    
    return {
        esValido: errores.length === 0,
        errores: errores
    };
}

// Función para mostrar errores en el DOM
function mostrarErrores(errores, contenedorId = 'errores-validacion') {
    let contenedor = document.getElementById(contenedorId);
    
    // Crear contenedor de errores si no existe
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = contenedorId;
        contenedor.style.cssText = `
            background-color: #fee;
            border: 1px solid #fcc;
            color: #c66;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-size: 14px;
        `;
        
        // Insertar antes del formulario
        const form = document.getElementById('miFormulario');
        if (form) {
            form.parentNode.insertBefore(contenedor, form);
        }
    }
    
    if (errores.length > 0) {
        contenedor.innerHTML = `
            <strong>Por favor, corrige los siguientes errores:</strong>
            <ul style="margin: 5px 0 0 20px;">
                ${errores.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        contenedor.style.display = 'block';
    } else {
        contenedor.style.display = 'none';
    }
}

// Función para limpiar errores
function limpiarErrores(contenedorId = 'errores-validacion') {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.style.display = 'none';
    }
}