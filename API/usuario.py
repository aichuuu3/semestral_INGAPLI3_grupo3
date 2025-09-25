from flask import request
from flask_restx import Namespace, Resource, fields

def crearUsuario(mysql):
    api = Namespace('usuarios', description='Operaciones de usuarios')

    usuarioModelo = api.model('Usuario', {
        'cedula': fields.String(required=True, description='Cédula del usuario'),
        'nombre': fields.String(required=True, description='Nombre del usuario'),
        'telefono': fields.String(required=True, description='Teléfono del usuario'),
        'correo': fields.String(required=True, description='Correo del usuario'),
        'clave': fields.String(required=True, description='Contraseña del usuario'),
        'idTipoUsuario': fields.Integer(required=True, description='Tipo de usuario')
    })

    @api.route('')
    class Usuarios(Resource):
        def get(self):
            """Obtener todos los usuarios"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM Usuario")
            usuarios = cur.fetchall()
            cur.close()
            if usuarios:
                return [{
                    'idUsuario': usuario[0],
                    'cedula': usuario[1],
                    'nombre': usuario[2],
                    'telefono': usuario[3],
                    'correo': usuario[4],
                    'clave': usuario[5],
                    'idTipoUsuario': usuario[6]
                } for usuario in usuarios]
            else:
                return {'mensaje': 'No se encontraron usuarios'}, 404

        @api.expect(usuarioModelo)
        def post(self):
            """Crear nuevo usuario"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO Usuario (cedula, nombre, telefono, correo, clave, idTipoUsuario) VALUES (%s, %s, %s, %s, %s, %s)",
                        (data['cedula'], data['nombre'], data['telefono'], data['correo'], data['clave'], data['idTipoUsuario']))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Usuario creado correctamente'}, 201

    @api.route('/<string:cedula>')
    class UsuarioEspecifico(Resource):
        def get(self, cedula):
            """Obtener usuario por cédula"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM Usuario WHERE cedula = %s", (cedula,))
            usuario = cur.fetchone()
            cur.close()
            if usuario:
                return {
                    'idUsuario': usuario[0],
                    'cedula': usuario[1],
                    'nombre': usuario[2],
                    'telefono': usuario[3],
                    'correo': usuario[4],
                    'clave': usuario[5],
                    'idTipoUsuario': usuario[6]
                }
            else:
                return {'mensaje': 'Usuario no encontrado'}, 404

        @api.expect(usuarioModelo)
        def put(self, cedula):
            """Actualizar usuario"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("UPDATE Usuario SET nombre=%s, telefono=%s, correo=%s WHERE cedula=%s",
                        (data['nombre'], data['telefono'], data['correo'], cedula))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Usuario actualizado correctamente'}

        def delete(self, cedula):
            """Eliminar usuario"""
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM Usuario WHERE cedula = %s", (cedula,))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Usuario eliminado correctamente'}

    return api