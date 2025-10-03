document.addEventListener('DOMContentLoaded', function() {
    console.log('GestionarMiembro.js cargado');
    
    // Cargar datos al iniciar la página
    cargarSolicitudes();
    
    // SELECTORES PARA BOTONES
    const botones = document.querySelectorAll('.form-group button');
    console.log('Todos los botones encontrados:', botones);
    
    let btnConsultar = null;
    let btnActualizar = null;
    
    // Identificar botones por su texto
    botones.forEach((boton, index) => {
        console.log(`Botón ${index}:`, boton.textContent.trim());
        
        if (boton.textContent.trim() === 'Consultar') {
            btnConsultar = boton;
        } else if (boton.textContent.trim() === 'Actualizar Usuario' || boton.textContent.trim() === 'Actualizar') {
            btnActualizar = boton;
        }
    });
    
    console.log('Botón Consultar encontrado:', btnConsultar);
    console.log('Botón Actualizar encontrado:', btnActualizar);
    
    if (btnConsultar) {
        btnConsultar.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔍 CLIC EN CONSULTAR');
            buscarUsuarioPorCedula();
        });
        console.log('✅ Listener agregado al botón CONSULTAR');
    }
    
    if (btnActualizar) {
        btnActualizar.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔄 CLIC EN ACTUALIZAR');
            actualizarUsuario();
        });
        console.log('✅ Listener agregado al botón ACTUALIZAR');
    }
    
    // Función para cargar solicitudes desde la API
    async function cargarSolicitudes() {
        try {
            console.log('Cargando solicitudes...');
            
            const response = await fetch('http://localhost:5000/membresia/completas');
            
            if (response.ok) {
                const solicitudes = await response.json();
                console.log('Solicitudes cargadas:', solicitudes);
                
                mostrarSolicitudesEnTabla(solicitudes);
            } else {
                console.error('Error al cargar solicitudes:', response.status);
                mostrarMensajeError('Error al cargar las solicitudes');
            }
            
        } catch (error) {
            console.error('Error de conexión:', error);
            mostrarMensajeError('Error de conexión con el servidor');
        }
    }
    
    // FUNCIÓN BUSCAR USUARIO
    async function buscarUsuarioPorCedula() {
        const cedulaInput = document.getElementById('cedula');
        const cedula = cedulaInput.value.trim();
        
        console.log('🔍 EJECUTANDO BUSCAR USUARIO CON CÉDULA:', cedula);
        
        if (!cedula) {
            alert('Por favor ingrese una cédula');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/membresia/buscar-usuario/${cedula}`);
            
            if (response.ok) {
                const usuario = await response.json();
                console.log('Usuario encontrado:', usuario);
                
                // Llenar formulario
                document.getElementById('nombre').value = usuario.nombre || '';
                document.getElementById('telefono').value = usuario.telefono || '';
                document.getElementById('correo').value = usuario.correo || '';
                
                // Llenar select de estado
                const estadoSelect = document.getElementById('estado');
                if (usuario.estadoSolicitud && usuario.estadoSolicitud !== 'Sin solicitud') {
                    const estado = usuario.estadoSolicitud.toLowerCase();
                    if (estado === 'aceptada') {
                        estadoSelect.value = 'Aceptada';
                    } else if (estado === 'rechazada') {
                        estadoSelect.value = 'Rechazada';
                    } else if (estado === 'pendiente') {
                        estadoSelect.value = 'Pendiente';
                    }
                } else {
                    estadoSelect.value = '';
                }
                
                // Guardar idSolicitud para actualizaciones
                window.currentSolicitudId = usuario.idSolicitud;
                
                alert(`✅ Usuario encontrado: ${usuario.nombre}`);
                
            } else if (response.status === 404) {
                alert('❌ Usuario no encontrado con esa cédula');
                limpiarFormulario();
            } else {
                const error = await response.json();
                alert('❌ Error: ' + (error.error || 'No se pudo buscar el usuario'));
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión al buscar usuario');
        }
    }
    
    // FUNCIÓN ACTUALIZAR USUARIO
    async function actualizarUsuario() {
        console.log('🔄 FUNCIÓN ACTUALIZAR USUARIO EJECUTÁNDOSE');
        
        const cedula = document.getElementById('cedula').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const estadoSelect = document.getElementById('estado');
        const estadoSeleccionado = estadoSelect.value;
        
        if (!cedula) {
            alert('❌ Debe buscar un usuario primero ingresando la cédula y haciendo clic en Consultar');
            return;
        }
        
        if (!nombre || !telefono || !correo) {
            alert('❌ Todos los campos (nombre, teléfono y correo) son requeridos');
            return;
        }
        
        try {
            // 1️⃣ ACTUALIZAR DATOS DEL USUARIO
            const responseUsuario = await fetch(`http://localhost:5000/membresia/actualizar-usuario/${cedula}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre,
                    telefono: telefono,
                    correo: correo
                })
            });
            
            if (!responseUsuario.ok) {
                const error = await responseUsuario.json();
                console.error('Error del servidor:', error);
                alert('❌ Error: ' + (error.error || 'No se pudo actualizar el usuario'));
                return;
            }
            
            let mensaje = '✅ Usuario actualizado correctamente';
            
            // 2️⃣ ACTUALIZAR ESTADO DE SOLICITUD (si está seleccionado y existe solicitud)
            if (estadoSeleccionado && window.currentSolicitudId) {
                const responseEstado = await fetch(`http://localhost:5000/membresia/cambiar-estado/${window.currentSolicitudId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        estado: estadoSeleccionado.toLowerCase()
                    })
                });
                
                if (responseEstado.ok) {
                    if (estadoSeleccionado.toLowerCase() === 'aceptada') {
                        mensaje += '\n🎉 Membresía ACTIVADA automáticamente';
                    } else if (estadoSeleccionado.toLowerCase() === 'rechazada') {
                        mensaje += '\n❌ Membresía mantenida como INACTIVA';
                    } else if (estadoSeleccionado.toLowerCase() === 'pendiente') {
                        mensaje += '\n⏳ Solicitud marcada como PENDIENTE';
                    }
                } else {
                    mensaje += '\n⚠️ Usuario actualizado pero hubo error al cambiar el estado de la solicitud';
                }
            } else if (estadoSeleccionado && !window.currentSolicitudId) {
                mensaje += '\n⚠️ No se puede cambiar el estado: este usuario no tiene solicitud de membresía';
            }
            
            alert(mensaje);
            console.log('Actualización completada');
            
            // Recargar la tabla para mostrar los cambios
            cargarSolicitudes();
            
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('❌ Error de conexión al actualizar usuario');
        }
    }
    
    function limpiarFormulario() {
        document.getElementById('nombre').value = '';
        document.getElementById('telefono').value = '';
        document.getElementById('correo').value = '';
        document.getElementById('estado').value = '';
        window.currentSolicitudId = null;
    }
    
    function mostrarSolicitudesEnTabla(solicitudes) {
        const tbody = document.querySelector('.tabla-solicitudes tbody');
        
        if (!tbody) {
            console.error('No se encontró el tbody de la tabla');
            return;
        }
        
        tbody.innerHTML = '';
        
        solicitudes.forEach(solicitud => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${solicitud.nombre}</td>
                <td>${solicitud.cedula}</td>
                <td>${solicitud.telefono}</td>
                <td>${solicitud.correo}</td>
                <td>${solicitud.tipoUsuario || 'Miembro'}</td>
                <td>${solicitud.fechaSolicitud || 'N/A'}</td>
                <td><span class="estado ${getEstadoClass(solicitud.estadoMiembro)}">${solicitud.estadoMiembro}</span></td>
                <td>
                    <span class="estado ${getEstadoSolicitudClass(solicitud.estadoSolicitud)}">${solicitud.estadoSolicitud}</span>
                </td>
            `;
            
            tbody.appendChild(fila);
        });
        
        console.log('Tabla actualizada con', solicitudes.length, 'solicitudes');
    }
    
    function getEstadoClass(estado) {
        switch (estado?.toLowerCase()) {
            case 'activo': return 'activo';
            case 'inactivo': return 'inactivo';
            default: return 'pendiente';
        }
    }
    
    function getEstadoSolicitudClass(estado) {
        switch (estado?.toLowerCase()) {
            case 'aceptada': return 'activo';
            case 'rechazada': return 'inactivo';
            case 'pendiente': return 'pendiente';
            default: return 'pendiente';
        }
    }
    
    function mostrarMensajeError(mensaje) {
        const tbody = document.querySelector('.tabla-solicitudes tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: red; padding: 20px;">
                        ${mensaje}
                    </td>
                </tr>
            `;
        }
    }
    
    // FUNCIÓN ACTUALIZAR ESTADO DE SOLICITUD
    async function actualizarEstadoSolicitud(idSolicitud, nuevoEstado) {
        try {
            console.log('🔄 Actualizando estado de solicitud:', idSolicitud, 'a:', nuevoEstado);
            
            const response = await fetch(`http://localhost:5000/membresia/cambiar-estado/${idSolicitud}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado: nuevoEstado.toLowerCase()
                })
            });
            
            if (response.ok) {
                let mensaje = '✅ Estado actualizado correctamente';
                
                if (nuevoEstado.toLowerCase() === 'aceptada') {
                    mensaje += '\n🎉 Membresía ACTIVADA automáticamente';
                } else if (nuevoEstado.toLowerCase() === 'rechazada') {
                    mensaje += '\n❌ Membresía mantenida como INACTIVA';
                }
                
                alert(mensaje);
                
                // Recargar la tabla para mostrar los cambios
                cargarSolicitudes();
                
            } else {
                const error = await response.json();
                alert('❌ Error: ' + (error.error || 'No se pudo actualizar el estado'));
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión al actualizar estado');
        }
    }
    
    // Función global para cambiar estado de solicitud
    window.cambiarEstadoSolicitud = async function(idSolicitud, estadoActual) {
        const opciones = ['pendiente', 'aceptada', 'rechazada'];
        const estadoSeleccionado = prompt(
            `Estado actual: ${estadoActual}\n\nSeleccione nuevo estado:\n1. Pendiente\n2. Aceptada\n3. Rechazada\n\nIngrese número (1-3):`
        );
        
        if (estadoSeleccionado && estadoSeleccionado >= 1 && estadoSeleccionado <= 3) {
            const nuevoEstado = opciones[estadoSeleccionado - 1];
            
            try {
                const response = await fetch(`http://localhost:5000/membresia/cambiar-estado/${idSolicitud}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        estado: nuevoEstado
                    })
                });
                
                if (response.ok) {
                    alert('✅ Estado actualizado correctamente');
                    cargarSolicitudes();
                } else {
                    const error = await response.json();
                    alert('❌ Error: ' + (error.error || 'No se pudo actualizar'));
                }
                
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Error de conexión');
            }
        }
    };
    
    // Botón recargar
    const btnRecargar = document.createElement('button');
    btnRecargar.textContent = '🔄 Recargar Datos';
    btnRecargar.className = 'btn-recargar';
    btnRecargar.onclick = cargarSolicitudes;
    
    const h3 = document.querySelector('.solicitudes-section h3');
    if (h3) {
        h3.insertAdjacentElement('afterend', btnRecargar);
    }
    
    // Event listener para el select de estado (solo para validación)
    const estadoSelect = document.getElementById('estado');
    if (estadoSelect) {
        estadoSelect.addEventListener('change', function() {
            const nuevoEstado = this.value;
            const cedula = document.getElementById('cedula').value.trim();
            
            if (nuevoEstado && cedula && !window.currentSolicitudId) {
                alert('❌ Este usuario no tiene una solicitud de membresía registrada');
                this.value = '';
            }
        });
    }
    
    // Botón cancelar
    const btnCancelar = document.querySelector('.cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            if (confirm('¿Está seguro de que desea limpiar el formulario?')) {
                limpiarFormulario();
                document.getElementById('cedula').value = '';
                window.currentSolicitudId = null;
            }
        });
    }
});