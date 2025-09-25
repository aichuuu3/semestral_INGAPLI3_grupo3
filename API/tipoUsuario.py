from flask import request
from flask_restx import Namespace, Resource, fields

def crearTipoUsuario(mysql):
    api = Namespace('TipoUsuario', description='Operaciones de tipo de usuario')

    tipoUsuarioModelo = api.model('TipoUsuario', {
        'idTipoUsuario': fields.Integer(required=True, description='ID del tipo de usuario'),
        'nombre': fields.String(required=True, description='Nombre del tipo de usuario'),
    })

    @api.route('')
    class TipoUsuarios(Resource):
        def get(self):
            """Obtener todos los tipos de usuario"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM tipousuario")
            tipos_usuario = cur.fetchall()
            cur.close()
            if tipos_usuario:
                return [{
                    'idTipoUsuario': tipo[0],
                    'nombre': tipo[1],
                } for tipo in tipos_usuario]
            else:
                return {'mensaje': 'No se encontraron tipos de usuario'}, 404

        @api.expect(tipoUsuarioModelo)
        def post(self):
            """Crear nuevo tipo de usuario"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO tipousuario (nombre) VALUES (%s)", (data['nombre'],))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Tipo de usuario creado correctamente'}, 201

    @api.route('/<int:idTipoUsuario>')
    class TipoUsuarioEspecifico(Resource):
        def get(self, idTipoUsuario):
            """Obtener tipo de usuario por ID"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM tipousuario WHERE idTipoUsuario = %s", (idTipoUsuario,))
            tipo_usuario = cur.fetchone()
            cur.close()
            if tipo_usuario:
                return {
                    'idTipoUsuario': tipo_usuario[0],
                    'nombre': tipo_usuario[1],
                }
            else:
                return {'mensaje': 'Tipo de usuario no encontrado'}, 404

        @api.expect(tipoUsuarioModelo)
        def put(self, idTipoUsuario):
            """Actualizar tipo de usuario"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("UPDATE tipousuario SET nombre=%s WHERE idTipoUsuario=%s",
                         (data['nombre'], idTipoUsuario))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Tipo de usuario actualizado correctamente'}

        def delete(self, idTipoUsuario):
            """Eliminar tipo de usuario"""
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM tipousuario WHERE idTipoUsuario = %s", (idTipoUsuario,))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Tipo de usuario eliminado correctamente'}
    return api