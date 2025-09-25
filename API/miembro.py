from flask import request
from flask_restx import Namespace, Resource, fields

def crearMiembro(mysql):
    api = Namespace('miembros', description='Operaciones de miembros')

    miembroModelo = api.model('Miembro', {
        'cedula': fields.String(required=True, description='Cédula del miembro'),
        'idSolicitud': fields.Integer(required=True, description='ID de la solicitud'),
        'estado': fields.String(required=False, description="Estado del miembro (activo/inactivo)")
    })

    @api.route('')
    class Miembros(Resource):
        def get(self):
            """Obtener todos los miembros"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM miembro")
            miembros = cur.fetchall()
            cur.close()
            if miembros:
                return [{
                    'idMiembro': miembro[0],
                    'cedula': miembro[1],
                    'idSolicitud': miembro[2],
                    'estado': miembro[3]
                } for miembro in miembros]
            else:
                return {'mensaje': 'No se encontraron miembros'}, 404

        @api.expect(miembroModelo)
        def post(self):
            """Crear nuevo miembro"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute(
                "INSERT INTO miembro (cedula, idSolicitud, estado) VALUES (%s, %s, %s)",
                (data['cedula'], data['idSolicitud'], data.get('estado', 'activo'))
            )
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Miembro creado correctamente'}, 201

    @api.route('/<string:cedula>')
    class MiembroEspecifico(Resource):
        def get(self, cedula):
            """Obtener miembro por cédula"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM miembro WHERE cedula = %s", (cedula,))
            miembro = cur.fetchone()
            cur.close()
            if miembro:
                return {
                    'idMiembro': miembro[0],
                    'cedula': miembro[1],
                    'idSolicitud': miembro[2],
                    'estado': miembro[3]
                }
            else:
                return {'mensaje': 'Miembro no encontrado'}, 404

        @api.expect(miembroModelo)
        def put(self, cedula):
            """Actualizar miembro"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute(
                "UPDATE miembro SET idSolicitud=%s, estado=%s WHERE cedula=%s",
                (data['idSolicitud'], data.get('estado', 'activo'), cedula)
            )
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Miembro actualizado correctamente'}

        def delete(self, cedula):
            """Eliminar miembro"""
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM miembro WHERE cedula = %s", (cedula,))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Miembro eliminado correctamente'}

    return api
