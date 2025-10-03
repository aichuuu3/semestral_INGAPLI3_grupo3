// Sistema de gestión de sesión
const SistemaLogin = {
    // Verificar si hay una sesión activa al cargar la página
    init: function() {
        const usuario = this.obtenerUsuarioSesion();
        if (usuario) {
            this.mostrarBarraSesion(usuario);
        }
    },

    // Guardar usuario en sessionStorage
    guardarSesion: function(datosUsuario) {
        sessionStorage.setItem('usuarioSesion', JSON.stringify(datosUsuario));
        this.mostrarBarraSesion(datosUsuario);
    },

    // Obtener usuario de la sesión
    obtenerUsuarioSesion: function() {
        const usuario = sessionStorage.getItem('usuarioSesion');
        return usuario ? JSON.parse(usuario) : null;
    },

    // Cerrar sesión
    cerrarSesion: function() {
        sessionStorage.removeItem('usuarioSesion');
        this.ocultarBarraSesion();
    },

    // Mostrar la barra de sesión
    mostrarBarraSesion: function(usuario) {
        console.log('Datos del usuario en mostrarBarraSesion:', usuario); // Debug
        
        // Verificar si ya existe la barra
        let barraSesion = document.getElementById('barra-sesion');
        
        if (!barraSesion) {
            // Crear la barra de sesión con nombre y correo reales
            barraSesion = document.createElement('div');
            barraSesion.id = 'barra-sesion';
            
            // Formatear la información del usuario - MEJORADO
            const nombreCompleto = usuario.nombre && usuario.nombre.trim() !== '' ? usuario.nombre : 'Usuario';
            const correoUsuario = usuario.correo || 'Sin correo';
            
            console.log('Nombre a mostrar:', nombreCompleto); // Debug
            console.log('Correo a mostrar:', correoUsuario); // Debug
            
            barraSesion.innerHTML = `
                <div class="contenido-sesion">
                    <span class="texto-sesion">
                        Iniciaste sesión como: <strong id="nombre-usuario">${nombreCompleto}</strong>
                        <span class="correo-usuario">(${correoUsuario})</span>
                    </span>
                    <button id="btn-cerrar-sesion" class="btn-cerrar-sesion">
                        CERRAR SESIÓN
                    </button>
                </div>
            `;

            // Estilos CSS para la barra de sesión - POSITION ABSOLUTE DEBAJO DEL NAV
            barraSesion.style.cssText = `
                background: rgba(76, 175, 80, 0.95);
                color: white;
                padding: 8px 15px;
                max-width: 700px;
                border-radius: 25px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                animation: slideDown 0.3s ease-out;
                position: absolute;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 999;
            `;

            // Insertar al final del body para que no interfiera con el flujo
            document.body.appendChild(barraSesion);

            // Agregar estilos adicionales
            this.agregarEstilosSesion();
        } else {
            // Actualizar información si ya existe la barra
            const nombreUsuario = document.getElementById('nombre-usuario');
            const correoUsuario = document.querySelector('.correo-usuario');
            
            if (nombreUsuario) {
                nombreUsuario.textContent = usuario.nombre || 'Usuario';
            }
            if (correoUsuario) {
                correoUsuario.textContent = `(${usuario.correo || 'Sin correo'})`;
            }
        }

        // Configurar evento del botón cerrar sesión
        const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
        if (btnCerrarSesion) {
            btnCerrarSesion.onclick = () => {
                console.log('Cerrando sesión...');
                this.cerrarSesion();
            };
        }
    },

    // Ocultar la barra de sesión
    ocultarBarraSesion: function() {
        const barraSesion = document.getElementById('barra-sesion');
        if (barraSesion) {
            barraSesion.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                barraSesion.remove();
            }, 300);
        }
    },

    // Agregar estilos CSS para la barra de sesión
    agregarEstilosSesion: function() {
        // Verificar si ya existen los estilos
        if (document.getElementById('estilos-sesion')) return;

        const estilos = document.createElement('style');
        estilos.id = 'estilos-sesion';
        estilos.textContent = `
            /* Estilos para la barra de sesión */
            #barra-sesion {
                font-family: Arial, sans-serif;
            }
            
            #barra-sesion .contenido-sesion {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }

            #barra-sesion .texto-sesion {
                font-size: 14px;
                font-weight: 500;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            #barra-sesion .correo-usuario {
                font-size: 12px;
                opacity: 0.8;
                font-weight: normal;
                font-style: italic;
            }

            #barra-sesion .btn-cerrar-sesion {
                background: rgba(244, 143, 177, 0.9);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 15px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                white-space: nowrap;
            }

            #barra-sesion .btn-cerrar-sesion:hover {
                background: rgba(244, 143, 177, 1);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }

            @keyframes slideDown {
                from {
                    transform: translateX(-50%) translateY(-30px);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }

            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-50%) translateY(-30px);
                    opacity: 0;
                }
            }

            /* Responsive */
            @media (max-width: 768px) {
                #barra-sesion {
                    max-width: 90% !important;
                    padding: 6px 12px !important;
                    top: 60px !important;
                }
                
                #barra-sesion .contenido-sesion {
                    flex-direction: column;
                    gap: 8px;
                    text-align: center;
                }
                
                #barra-sesion .texto-sesion {
                    font-size: 13px;
                    align-items: center;
                }
                
                #barra-sesion .correo-usuario {
                    font-size: 11px;
                }
                
                #barra-sesion .btn-cerrar-sesion {
                    font-size: 10px;
                    padding: 4px 10px;
                }
            }
        `;
        
        document.head.appendChild(estilos);
    }
};

// Inicializar el sistema al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    SistemaLogin.init();
});

// Hacer disponible globalmente
window.SistemaLogin = SistemaLogin;