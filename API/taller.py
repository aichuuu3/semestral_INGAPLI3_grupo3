from flask import request
from flask_restx import Namespace, Resource, fields

def crearTallercito(mysql):
    api = Namespace('talleres', description='Operaciones de talleres')

    tallerModelo = api.model('Taller', {
        'idTaller': fields.Integer(required=True, description='ID del taller'),
        'nombre': fields.String(required=True, description='Nombre del taller'),
        'tipo': fields.String(required=True, description='Tipo de taller'),
        'ubicacion': fields.Integer(required=True, description='Ubicacion del taller'),
        'fecha': fields.Date(required=True, description='Fecha del taller'),
        'hora': fields.Date(required=True, description='Hora del taller'),
    })

    @api.route('')
    class Talleres(Resource):
        def get(self):
            """Obtener todos los talleres"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM taller")
            talleres = cur.fetchall()
            cur.close()
            if talleres:
                return [{
                    'idTaller': taller[0],
                    'nombre': taller[1],
                    'tipo': taller[2],
                    'ubicacion': taller[3],
                    'fecha': taller[4],
                    'hora': taller[5]
                } for taller in talleres]
            else:
                return {'mensaje': 'No se encontraron talleres'}, 404

        @api.expect(tallerModelo)
        def post(self):
            """Crear nuevo taller"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO taller (nombre, tipo, ubicacion, fecha, hora) VALUES (%s, %s, %s, %s, %s)",
                        (data['nombre'], data['tipo'], data['ubicacion'], data['fecha'], data['hora']))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Taller creado correctamente'}, 201

    @api.route('/<int:idTaller>')
    class TallerEspecifico(Resource):
        def get(self, idTaller):
            """Obtener taller por ID"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM taller WHERE idTaller = %s", (idTaller,))
            taller = cur.fetchone()
            cur.close()
            if taller:
                return {
                    'idTaller': taller[0],
                    'nombre': taller[1],
                    'tipo': taller[2],
                    'ubicacion': taller[3],
                    'fecha': taller[4],
                    'hora': taller[5]
                }
            else:
                return {'mensaje': 'Taller no encontrado'}, 404

        @api.expect(tallerModelo)
        def put(self, idTaller):
            """Actualizar taller"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("UPDATE taller SET nombre=%s, tipo=%s, ubicacion=%s, fecha=%s, hora=%s WHERE idTaller=%s",
                        (data['nombre'], data['tipo'], data['ubicacion'], data['fecha'], data['hora'], idTaller))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Taller actualizado correctamente'}

        def delete(self, idTaller):
            """Eliminar taller"""
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM taller WHERE idTaller = %s", (idTaller,))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Taller eliminado correctamente'}

    return api