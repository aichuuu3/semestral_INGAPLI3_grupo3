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
                    // NO tocar el overflow del body

                    //agrega imagen de fondo al modal
                    const modalContent = modal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.style.backgroundImage = "url('img/imagen1.png')";
                        modalContent.style.backgroundSize = "cover";
                        modalContent.style.backgroundPosition = "center";
                        modalContent.style.backgroundRepeat = "no-repeat";
                    }

                    try {
                        console.log('Intentando cargar formulario...');
                        //abre el HTML del formulario
                        const response = await fetch('miembro/SolicitarMiembro.html');
                        
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        
                        const html = await response.text();
                        console.log('HTML cargado:', html.substring(0, 200));
                        
                        //extrae el contenido del body
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const contenedor = doc.querySelector('.contenedor');
                        
                        if (contenedor) {
                            console.log('Contenedor encontrado, insertando...');
                            formularioContainer.innerHTML = contenedor.outerHTML;
                            
                            //cargar los estilos CSS del formulario
                            if (!document.querySelector('link[href*="SM.css"]')) {
                                const link = document.createElement('link');
                                link.rel = 'stylesheet';
                                link.href = 'miembro/SM.css';
                                document.head.appendChild(link);
                                console.log('CSS del formulario cargado');
                            }
                            
                            //inicializar funcionalidad del formulario
                            initializeForm();
                        } else {
                            console.error('No se encontró el contenedor');
                            formularioContainer.innerHTML = '<p style="color: #333; padding: 20px;">No se pudo cargar el formulario.</p>';
                        }
                        
                    } catch (error) {
                        console.error('Error cargando el formulario:', error);
                        formularioContainer.innerHTML = '<p style="color: #333; padding: 20px;">Error al cargar el formulario: ' + error.message + '</p>';
                    }
                }
            });
        } else {
            console.error('Botón no encontrado');
        }

        //cerrar modalcito
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
            }
        }

        //función para inicializar el formulario cargado
        function initializeForm() {
            console.log('Inicializando formulario...');
            
            //preview de imagen
            const fotoInput = document.getElementById('foto');
            const preview = document.getElementById('preview');
            
            if (fotoInput && preview) {
                fotoInput.addEventListener('change', function(event) {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            preview.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
                console.log('Preview de imagen inicializado');
            }

            //envío del formulario
            const form = document.getElementById('miFormulario');
            if (form) {
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    console.log('Formulario enviado');
                    
                    // Validar campos requeridos (incluyendo contraseña)
                    const nombre = document.getElementById('nombre').value.trim();
                    const cedula = document.getElementById('cedula').value.trim();
                    const telefono = document.getElementById('telefono').value.trim();
                    const correo = document.getElementById('correo').value.trim();
                    const clave = document.getElementById('clave').value.trim(); // Agregar validación de contraseña
                    
                    if (!nombre || !cedula || !telefono || !correo || !clave) {
                        alert('Por favor, complete todos los campos obligatorios (incluyendo la contraseña)');
                        return;
                    }
                    
                    // Validar longitud mínima de contraseña
                    if (clave.length < 6) {
                        alert('La contraseña debe tener al menos 6 caracteres');
                        return;
                    }
                    
                    const formData = new FormData();
                    formData.append('nombre', nombre);
                    formData.append('cedula', cedula);
                    formData.append('telefono', telefono);
                    formData.append('correo', correo);
                    formData.append('clave', clave);
                    
                    const foto = document.getElementById('foto').files[0];
                    if (foto) {
                        formData.append('foto', foto);
                    }

                    try {
                        const response = await fetch('http://localhost:5000/usuarios', {
                            method: 'POST',
                            body: formData
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            const mensajeExito = document.getElementById('mensajeExito');
                            if (mensajeExito) {
                                mensajeExito.textContent = result.mensaje || 'Solicitud enviada correctamente';
                                mensajeExito.style.display = 'block';
                                setTimeout(() => {
                                    closeModal();
                                    form.reset();
                                    if (preview) preview.src = '../img/foto.png';
                                    mensajeExito.style.display = 'none';
                                }, 3000);
                            }
                        } else {
                            alert(result.error || result.mensaje || 'Error al enviar la solicitud');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Error de conexión. Verifique que el servidor esté ejecutándose.');
                    }
                });
                console.log('Envío de formulario inicializado');
            }
        }
    });