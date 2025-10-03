from flask import request
from flask_restx import Namespace, Resource, fields

def crearMembresia(mysql):
    api = Namespace('solicitudes', description='Operaciones de solicitudes de membresía')

    solicitudModelo = api.model('SolicitudMembresia', {
        'cedula': fields.String(required=True, description='Cédula del solicitante'),
        'fechaSolicitud': fields.String(required=True, description='Fecha de la solicitud (YYYY-MM-DD)'),
        'estado': fields.String(required=False, description="Estado de la solicitud (pendiente/aprobada/rechazada)")
    })

    usuarioModelo = api.model('ActualizarUsuario', {
        'nombre': fields.String(required=True, description='Nombre del usuario'),
        'telefono': fields.String(required=True, description='Teléfono del usuario'),
        'correo': fields.String(required=True, description='Correo del usuario')
    })

    @api.route('')
    class Solicitudes(Resource):
        def get(self):
            """Obtener todas las solicitudes"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM solicitudmembresia")
            solicitudes = cur.fetchall()
            cur.close()
            if solicitudes:
                return [{
                    'idSolicitud': solicitud[0],
                    'cedula': solicitud[1],
                    'fechaSolicitud': str(solicitud[2]),
                    'estado': solicitud[3]
                } for solicitud in solicitudes]
            else:
                return {'mensaje': 'No se encontraron solicitudes'}, 404

        @api.expect(solicitudModelo)
        def post(self):
            """Crear nueva solicitud"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute(
                "INSERT INTO solicitudmembresia (cedula, fechaSolicitud, estado) VALUES (%s, %s, %s)",
                (data['cedula'], data['fechaSolicitud'], data.get('estado', 'pendiente'))
            )
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Solicitud creada correctamente'}, 201

    @api.route('/completas')
    class SolicitudesCompletas(Resource):
        def get(self):
            """Obtener solicitudes con datos completos"""
            try:
                cur = mysql.connection.cursor()
                
                query = """
                SELECT 
                    u.nombre,
                    u.cedula, 
                    u.telefono,
                    u.correo,
                    COALESCE(m.estado, 'Sin membresía') as estadoMiembro,
                    sm.estado as estadoSolicitud,
                    sm.idSolicitud,
                    sm.fechaSolicitud
                FROM usuario u
                INNER JOIN solicitudmembresia sm ON u.cedula = sm.cedula
                LEFT JOIN miembro m ON u.cedula = m.cedula
                ORDER BY sm.fechaSolicitud DESC
                LIMIT 10
                """
                
                cur.execute(query)
                resultados = cur.fetchall()
                cur.close()
                
                if resultados:
                    return [{
                        'nombre': resultado[0],
                        'cedula': resultado[1],
                        'telefono': resultado[2],
                        'correo': resultado[3],
                        'estadoMiembro': resultado[4],
                        'estadoSolicitud': resultado[5],
                        'idSolicitud': resultado[6],
                        'fechaSolicitud': str(resultado[7]) if resultado[7] else None
                    } for resultado in resultados]
                else:
                    return {'mensaje': 'No se encontraron solicitudes'}, 404
                    
            except Exception as e:
                return {'error': f'Error al obtener datos: {str(e)}'}, 500

    # 🔥 NUEVO: Buscar usuario por cédula
    @api.route('/buscar-usuario/<string:cedula>')
    class BuscarUsuario(Resource):
        def get(self, cedula):
            """Buscar usuario por cédula con toda su información"""
            try:
                cur = mysql.connection.cursor()
                
                # Query para obtener datos completos del usuario
                query = """
                SELECT 
                    u.nombre,
                    u.cedula, 
                    u.telefono,
                    u.correo,
                    COALESCE(m.estado, 'Sin membresía') as estadoMiembro,
                    COALESCE(sm.estado, 'Sin solicitud') as estadoSolicitud,
                    sm.idSolicitud,
                    sm.fechaSolicitud
                FROM usuario u
                LEFT JOIN solicitudmembresia sm ON u.cedula = sm.cedula
                LEFT JOIN miembro m ON u.cedula = m.cedula
                WHERE u.cedula = %s
                """
                
                cur.execute(query, (cedula,))
                resultado = cur.fetchone()
                cur.close()
                
                if resultado:
                    return {
                        'nombre': resultado[0],
                        'cedula': resultado[1],
                        'telefono': resultado[2],
                        'correo': resultado[3],
                        'estadoMiembro': resultado[4],
                        'estadoSolicitud': resultado[5],
                        'idSolicitud': resultado[6] if resultado[6] else None,
                        'fechaSolicitud': str(resultado[7]) if resultado[7] else None
                    }
                else:
                    return {'mensaje': f'Usuario con cédula {cedula} no encontrado'}, 404
                    
            except Exception as e:
                return {'error': f'Error al buscar usuario: {str(e)}'}, 500

    # 🔥 NUEVO: Actualizar datos del usuario
    @api.route('/actualizar-usuario/<string:cedula>')
    class ActualizarUsuario(Resource):
        @api.expect(usuarioModelo)
        def put(self, cedula):
            """Actualizar datos del usuario por cédula"""
            try:
                data = request.json
                
                # Validar datos requeridos
                if not data.get('nombre') or not data.get('telefono') or not data.get('correo'):
                    return {'error': 'Nombre, teléfono y correo son requeridos'}, 400
                
                cur = mysql.connection.cursor()
                
                # Verificar que el usuario existe
                cur.execute("SELECT cedula FROM usuario WHERE cedula = %s", (cedula,))
                usuario_existe = cur.fetchone()
                
                if not usuario_existe:
                    cur.close()
                    return {'error': f'Usuario con cédula {cedula} no encontrado'}, 404
                
                # Actualizar datos del usuario
                cur.execute(
                    "UPDATE usuario SET nombre = %s, telefono = %s, correo = %s WHERE cedula = %s",
                    (data['nombre'], data['telefono'], data['correo'], cedula)
                )
                
                mysql.connection.commit()
                cur.close()
                
                return {'mensaje': f'Usuario con cédula {cedula} actualizado correctamente'}, 200
                
            except Exception as e:
                return {'error': f'Error al actualizar usuario: {str(e)}'}, 500

    @api.route('/<int:idSolicitud>')
    class SolicitudEspecifica(Resource):
        def get(self, idSolicitud):
            """Obtener solicitud por ID"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM solicitudmembresia WHERE idSolicitud = %s", (idSolicitud,))
            solicitud = cur.fetchone()
            cur.close()
            if solicitud:
                return {
                    'idSolicitud': solicitud[0],
                    'cedula': solicitud[1],
                    'fechaSolicitud': str(solicitud[2]),
                    'estado': solicitud[3]
                }
            else:
                return {'mensaje': 'Solicitud no encontrada'}, 404

        @api.expect(solicitudModelo)
        def put(self, idSolicitud):
            """Actualizar solicitud"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute(
                "UPDATE solicitudmembresia SET cedula=%s, fechaSolicitud=%s, estado=%s WHERE idSolicitud=%s",
                (data['cedula'], data['fechaSolicitud'], data.get('estado', 'pendiente'), idSolicitud)
            )
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Solicitud actualizada correctamente'}

        def delete(self, idSolicitud):
            """Eliminar solicitud"""
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM solicitudmembresia WHERE idSolicitud = %s", (idSolicitud,))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Solicitud eliminada correctamente'}

    @api.route('/cambiar-estado/<int:idSolicitud>')
    class CambiarEstadoSolicitud(Resource):
        def put(self, idSolicitud):
            """Actualizar solo el estado de una solicitud"""
            try:
                data = request.json
                nuevoEstado = data.get('estado')
                
                if not nuevoEstado:
                    return {'error': 'Estado requerido'}, 400
                
                cur = mysql.connection.cursor()
                
                # Actualizar estado de la solicitud
                cur.execute(
                    "UPDATE solicitudmembresia SET estado = %s WHERE idSolicitud = %s",
                    (nuevoEstado, idSolicitud)
                )
                
                # 🔥 OBTENER CÉDULA DE LA SOLICITUD
                cur.execute("SELECT cedula FROM solicitudmembresia WHERE idSolicitud = %s", (idSolicitud,))
                solicitud = cur.fetchone()
                
                if solicitud:
                    cedula = solicitud[0]
                    
                    if nuevoEstado.lower() == 'aceptada':
                        # 🔥 ACTIVAR MEMBRESÍA - Actualizar estado en tabla miembro
                        cur.execute(
                            "UPDATE miembro SET estado = 'activo' WHERE cedula = %s",
                            (cedula,)
                        )
                        print(f"✅ Membresía activada para cédula: {cedula}")
                        
                    elif nuevoEstado.lower() == 'rechazada':
                        # 🔥 DESACTIVAR MEMBRESÍA - Mantener como inactivo
                        cur.execute(
                            "UPDATE miembro SET estado = 'inactivo' WHERE cedula = %s",
                            (cedula,)
                        )
                        print(f"❌ Membresía desactivada para cédula: {cedula}")
                        
                    elif nuevoEstado.lower() == 'pendiente':
                        # 🔥 PENDIENTE - Mantener como inactivo
                        cur.execute(
                            "UPDATE miembro SET estado = 'inactivo' WHERE cedula = %s",
                            (cedula,)
                        )
                        print(f"⏳ Membresía en espera para cédula: {cedula}")
                
                mysql.connection.commit()
                cur.close()
                
                return {'mensaje': 'Estado de solicitud actualizado correctamente'}, 200
                
            except Exception as e:
                return {'error': f'Error al actualizar estado: {str(e)}'}, 500

    # 🔥 NUEVO ENDPOINT: Verificar estado de membresía del usuario
    @api.route('/estado-usuario/<string:cedula>')
    class EstadoUsuario(Resource):
        def get(self, cedula):
            """Obtener estado de membresía y solicitud del usuario"""
            try:
                cur = mysql.connection.cursor()
                
                query = """
                SELECT 
                    u.nombre,
                    u.cedula,
                    COALESCE(sm.estado, 'sin_solicitud') as estadoSolicitud,
                    COALESCE(m.estado, 'inactivo') as estadoMiembro,
                    sm.fechaSolicitud
                FROM usuario u
                LEFT JOIN solicitudmembresia sm ON u.cedula = sm.cedula
                LEFT JOIN miembro m ON u.cedula = m.cedula
                WHERE u.cedula = %s
                """
                
                cur.execute(query, (cedula,))
                resultado = cur.fetchone()
                cur.close()
                
                if resultado:
                    return {
                        'nombre': resultado[0],
                        'cedula': resultado[1],
                        'estadoSolicitud': resultado[2],
                        'estadoMiembro': resultado[3],
                        'fechaSolicitud': str(resultado[4]) if resultado[4] else None,
                        'puedeLoguearse': resultado[3] == 'activo',
                        'tieneSolicitudPendiente': resultado[2] == 'pendiente'
                    }
                else:
                    return {'error': 'Usuario no encontrado'}, 404
                    
            except Exception as e:
                return {'error': f'Error al obtener estado: {str(e)}'}, 500

    return api
