document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalMembresia');
    const btnSolicitar = document.getElementById('btnSolicitar');
    const spanClose = document.getElementsByClassName('close')[0];
    const formularioContainer = document.getElementById('formulario-container');

    // Verificar que los elementos existen
    console.log('Modal:', modal);
    console.log('Botón:', btnSolicitar);

    // Abrir modal y cargar contenido
    if (btnSolicitar) {
        btnSolicitar.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Botón clickeado');
            
            if (modal) {
                modal.style.display = 'block';

                //agrega imagen de fondo al modal
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.backgroundImage = "url('img/imagen1.png')";
                    modalContent.style.backgroundSize = "cover";
                    modalContent.style.backgroundPosition = "center";
                    modalContent.style.backgroundRepeat = "no-repeat";
                }

                // Cargar formulario de registro por defecto
                cargarFormularioRegistro();
            }
        });
    } else {
        console.error('Botón no encontrado');
    }

    //cerrar modal
    if (spanClose) {
        spanClose.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.offsetHeight;
            // Limpiar errores al cerrar
            if (typeof limpiarErrores === 'function') {
                limpiarErrores();
            }
        }
    }

    // Función para cargar el formulario de registro
    async function cargarFormularioRegistro() {
        try {
            console.log('Cargando formulario de registro...');
            const response = await fetch('miembro/SolicitarMiembro.html');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const contenedor = doc.querySelector('.contenedor');
            
            if (contenedor) {
                formularioContainer.innerHTML = contenedor.outerHTML;
                
                // Cargar CSS del formulario de registro
                if (!document.querySelector('link[href*="SM.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'miembro/SM.css';
                    document.head.appendChild(link);
                }
                
                // Cargar script de validación
                if (!document.querySelector('script[src*="validacion.js"]')) {
                    const script = document.createElement('script');
                    script.src = 'miembro/validacion.js';
                    script.onload = function() {
                        initializeRegistroForm();
                    };
                    document.head.appendChild(script);
                } else {
                    initializeRegistroForm();
                }
                
            } else {
                throw new Error('No se encontró el contenedor del formulario');
            }
            
        } catch (error) {
            console.error('Error cargando formulario de registro:', error);
            formularioContainer.innerHTML = '<p style="color: #333; padding: 20px;">Error al cargar el formulario: ' + error.message + '</p>';
        }
    }

    // Función para cargar el formulario de login existente
    async function cargarFormularioLogin() {
        try {
            console.log('Cargando formulario de login...');
            const response = await fetch('miembro/loginsito.html');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const contenedor = doc.querySelector('.contenedor');
            
            if (contenedor) {
                formularioContainer.innerHTML = contenedor.outerHTML;
                
                // Cargar CSS del login
                if (!document.querySelector('link[href*="loginsito.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'miembro/loginsito.css';
                    document.head.appendChild(link);
                }
                
                // Cargar script de validación si no está cargado
                if (!document.querySelector('script[src*="validacion.js"]')) {
                    const script = document.createElement('script');
                    script.src = 'miembro/validacion.js';
                    script.onload = function() {
                        initializeLoginForm();
                    };
                    document.head.appendChild(script);
                } else {
                    initializeLoginForm();
                }
                
            } else {
                throw new Error('No se encontró el contenedor del login');
            }
            
        } catch (error) {
            console.error('Error cargando formulario de login:', error);
            formularioContainer.innerHTML = '<p style="color: #333; padding: 20px;">Error al cargar el login: ' + error.message + '</p>';
        }
    }

    // Inicializar formulario de registro
    function initializeRegistroForm() {
        const form = document.getElementById('miFormulario');
        const iniciarSesionBtn = document.getElementById('iniciarSesionBtn');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Limpiar errores previos
                if (typeof limpiarErrores === 'function') {
                    limpiarErrores();
                }
                
                const formData = new FormData(form);
                const datos = Object.fromEntries(formData);
                
                // Validar datos
                if (typeof validarSolicitudMembresia === 'function') {
                    const validacion = validarSolicitudMembresia(datos);
                    
                    if (!validacion.esValido) {
                        mostrarErrores(validacion.errores);
                        return;
                    }
                }
                
                procesarSolicitud(datos);
            });
        }
        
        // Evento para cambiar a login
        if (iniciarSesionBtn) {
            iniciarSesionBtn.addEventListener('click', function(e) {
                e.preventDefault();
                cargarFormularioLogin();
            });
        }
    }

    // Inicializar formulario de login
    function initializeLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Limpiar errores previos
                if (typeof limpiarErrores === 'function') {
                    limpiarErrores();
                }
                
                const formData = new FormData(loginForm);
                const datosLogin = {
                    usuario: formData.get('correo'), // Usar correo como usuario
                    contrasena: formData.get('password')
                };
                
                // Validar login
                if (typeof validarLogin === 'function') {
                    const validacion = validarLogin(datosLogin);
                    
                    if (!validacion.esValido) {
                        mostrarErrores(validacion.errores);
                        return;
                    }
                }
                
                procesarLogin(datosLogin);
            });
        }
        
        // Evento para cambiar a registro
        if (registerBtn) {
            registerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                cargarFormularioRegistro();
            });
        }
    }
    
    // Función para procesar solicitud de registro válida
    function procesarSolicitud(datos) {
        console.log('Procesando solicitud válida:', datos);
        
        const mensajeExito = document.getElementById('mensajeExito');
        if (mensajeExito) {
            mensajeExito.innerHTML = '¡Solicitud enviada correctamente! Pronto recibirás una respuesta.';
            mensajeExito.style.display = 'block';
            
            setTimeout(() => {
                mensajeExito.style.display = 'none';
                closeModal();
            }, 3000);
        }
    }
    
    // Función para procesar login válido
    async function procesarLogin(datos) {
        console.log('Procesando login:', datos);
        
        const mensajeLogin = document.getElementById('mensaje');
        if (mensajeLogin) {
            mensajeLogin.innerHTML = 'Iniciando sesión...';
            mensajeLogin.className = 'mensaje info';
            mensajeLogin.style.display = 'block';
            
            try {
                // INTENTAR PRIMERO CON LOGIN DE MIEMBROS
                let response = await fetch('http://localhost:5000/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        correo: datos.usuario,
                        clave: datos.contrasena
                    })
                });
                
                let data = await response.json();
                
                // Si falla con miembros, intentar con login administrativo
                if (!response.ok) {
                    response = await fetch('http://localhost:5000/usuarios/login-admin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            correo: datos.usuario,
                            clave: datos.contrasena
                        })
                    });
                    
                    data = await response.json();
                }
                
                if (response.ok && response.status === 200) {
                    // Login exitoso
                    mensajeLogin.innerHTML = `¡Login exitoso! Bienvenido ${data.usuario.tipoUsuario}`;
                    mensajeLogin.className = 'mensaje success';
                    
                    // Guardar la sesión del usuario con datos REALES de la API
                    const datosUsuario = {
                        nombre: data.usuario.nombre || 'Usuario',
                        correo: data.usuario.correo,
                        cedula: data.usuario.cedula,
                        telefono: data.usuario.telefono,
                        idUsuario: data.usuario.idUsuario,
                        idTipoUsuario: data.usuario.idTipoUsuario,
                        tipoUsuario: data.usuario.tipoUsuario || 'Usuario',
                        fechaLogin: new Date().toISOString()
                    };

                    console.log('Datos del usuario a guardar:', datosUsuario);

                    // Usar el sistema de login
                    if (window.SistemaLogin) {
                        window.SistemaLogin.guardarSesion(datosUsuario);
                    }
                    
                    // REDIRECCIÓN BASADA EN TIPO DE USUARIO
                    const tipoUsuario = data.usuario.idTipoUsuario;
                    let urlRedireccion = 'inicio.html'; // Default
                    
                    if (tipoUsuario === 1) {
                        urlRedireccion = 'API/Administrador/MenuAdmin.html';
                    } else if (tipoUsuario === 2) {
                        urlRedireccion = 'Contador/generarInformes.html';
                    } else if (tipoUsuario === 3) {
                        urlRedireccion = 'inicio.html';
                    }
                    
                    setTimeout(() => {
                        closeModal();
                        window.location.href = urlRedireccion;
                    }, 2000);
                    
                } else {
                    // Error en el login - MOSTRAR EN ROJO
                    let mensajeError = 'Correo o contraseña incorrectos';
                    
                    if (data.error) {
                        mensajeError = data.error;
                    } else if (response.status === 401) {
                        mensajeError = 'Correo o contraseña incorrectos';
                    } else if (response.status === 403) {
                        mensajeError = data.error || 'Acceso denegado';
                    } else if (response.status === 400) {
                        mensajeError = 'Datos faltantes o inválidos';
                    }
                    
                    mensajeLogin.innerHTML = mensajeError;
                    mensajeLogin.className = 'mensaje error';
                    
                    setTimeout(() => {
                        alert(mensajeError);
                    }, 100);
                }
                
            } catch (error) {
                console.error('Error en login:', error);
                
                mensajeLogin.innerHTML = 'Error de conexión con el servidor';
                mensajeLogin.className = 'mensaje error';
                
                setTimeout(() => {
                    alert('Error de conexión: No se pudo conectar con la API');
                }, 100);
            }
        }
    }
});