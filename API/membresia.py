from flask import request
from flask_restx import Namespace, Resource, fields

def crearMembresia(mysql):
    api = Namespace('solicitudes', description='Operaciones de solicitudes de membresía')

    solicitudModelo = api.model('SolicitudMembresia', {
        'cedula': fields.String(required=True, description='Cédula del solicitante'),
        'fechaSolicitud': fields.String(required=True, description='Fecha de la solicitud (YYYY-MM-DD)'),
        'estado': fields.String(required=False, description="Estado de la solicitud (pendiente/aprobada/rechazada)")
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

    return api
