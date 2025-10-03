document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerBtn = document.getElementById('registerBtn');
    const mensaje = document.getElementById('mensaje');

    // Manejar envío del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;
            
            console.log('Datos del formulario:', { correo, password });
            
            // Validar campos básicos
            if (!correo || !password) {
                mostrarMensaje('Por favor, completa todos los campos', 'error');
                return;
            }
            
            // Mostrar mensaje de carga
            mostrarMensaje('Iniciando sesión...', 'info');
            
            try {
                console.log('Enviando petición a la API...');
                
                // INTENTAR PRIMERO CON LOGIN DE MIEMBROS
                let response = await fetch('http://localhost:5000/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        correo: correo,
                        clave: password
                    })
                });
                
                let data = await response.json();
                console.log('Respuesta login miembros:', data);
                
                // Si falla con miembros, intentar con login administrativo
                if (!response.ok) {
                    console.log('Login de miembros falló, intentando login administrativo...');
                    
                    response = await fetch('http://localhost:5000/usuarios/login-admin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            correo: correo,
                            clave: password
                        })
                    });
                    
                    data = await response.json();
                    console.log('Respuesta login administrativo:', data);
                }
                
                if (response.ok && response.status === 200) {
                    // Login exitoso
                    console.log('Login exitoso, procesando datos...');
                    mostrarMensaje(`¡Login exitoso! Bienvenido ${data.usuario.tipoUsuario}`, 'success');
                    
                    // Verificar que los datos del usuario existan
                    if (!data.usuario) {
                        throw new Error('No se recibieron datos del usuario');
                    }
                    
                    // Guardar la sesión del usuario con datos reales de la API
                    const datosUsuario = {
                        nombre: data.usuario.nombre || 'Sin nombre',
                        correo: data.usuario.correo || correo,
                        cedula: data.usuario.cedula || 'Sin cédula',
                        telefono: data.usuario.telefono || 'Sin teléfono',
                        idUsuario: data.usuario.idUsuario || null,
                        idTipoUsuario: data.usuario.idTipoUsuario || null,
                        tipoUsuario: data.usuario.tipoUsuario || 'Usuario',
                        fechaLogin: new Date().toISOString()
                    };

                    console.log('Datos del usuario a guardar:', datosUsuario);

                    // Usar el sistema de login
                    if (window.SistemaLogin) {
                        window.SistemaLogin.guardarSesion(datosUsuario);
                        console.log('Sesión guardada correctamente');
                    } else {
                        console.error('SistemaLogin no está disponible');
                    }
                    
                    // REDIRECCIÓN BASADA EN TIPO DE USUARIO
                    const tipoUsuario = data.usuario.idTipoUsuario;
                    let urlRedireccion = '../inicio.html'; // Default para miembros
                    
                    if (tipoUsuario === 1) {
                        // Administrador
                        urlRedireccion = '../API/Administrador/MenuAdmin.html';
                        mostrarMensaje('Redirigiendo al panel de administración...', 'info');
                    } else if (tipoUsuario === 2) {
                        // Contador
                        urlRedireccion = '../Contador/generarInformes.html';
                        mostrarMensaje('Redirigiendo al panel de informes...', 'info');
                    } else if (tipoUsuario === 3) {
                        // Miembro
                        urlRedireccion = '../inicio.html';
                        mostrarMensaje('Redirigiendo al inicio...', 'info');
                    }
                    
                    console.log(`Redirigiendo a: ${urlRedireccion}`);
                    
                    setTimeout(() => {
                        window.location.href = urlRedireccion;
                    }, 2000);
                    
                } else {
                    // Error en el login
                    console.log('Error en el login:', data);
                    
                    let mensajeError = 'Credenciales incorrectas';
                    
                    if (data.error) {
                        mensajeError = data.error;
                    } else if (response.status === 401) {
                        mensajeError = 'Correo o contraseña incorrectos';
                    } else if (response.status === 403) {
                        mensajeError = data.error || 'Acceso denegado';
                    } else if (response.status === 400) {
                        mensajeError = 'Datos faltantes o inválidos';
                    } else {
                        mensajeError = `Error del servidor (${response.status})`;
                    }
                    
                    // MOSTRAR ALERT PARA ERRORES
                    alert(mensajeError);
                    mostrarMensaje(mensajeError, 'error');
                }
                
            } catch (error) {
                console.error('Error completo:', error);
                
                // ALERT PARA EXCEPCIONES
                alert(`Error de conexión: ${error.message}`);
                mostrarMensaje('Error de conexión con el servidor', 'error');
            }
        });
    }
    
    // Manejar botón de registro
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            // Redirigir al formulario de registro
            window.location.href = 'SolicitarMiembro.html';
        });
    }
    
    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo) {
        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = `mensaje ${tipo}`;
            mensaje.style.display = 'block';
            
            if (tipo === 'error') {
                setTimeout(() => {
                    mensaje.style.display = 'none';
                }, 5000);
            }
        }
    }
});