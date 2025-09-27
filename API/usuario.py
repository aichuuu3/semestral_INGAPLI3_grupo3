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
            cur.execute("SELECT * FROM usuario")
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

        def post(self):
            """Crear nuevo usuario (soporta JSON y form-data)"""
            try:
                # Intentar obtener datos como JSON primero
                if request.content_type and 'application/json' in request.content_type:
                    data = request.json
                    cedula = data['cedula']
                    nombre = data['nombre']
                    telefono = data['telefono']
                    correo = data['correo']
                    clave = data.get('clave', 'temp123')  # Clave temporal por defecto
                    idTipoUsuario = data.get('idTipoUsuario', 3)  # 3 = miembro
                else:
                    # Obtener datos como form-data (desde el formulario)
                    cedula = request.form.get('cedula')
                    nombre = request.form.get('nombre')
                    telefono = request.form.get('telefono')
                    correo = request.form.get('correo')
                    clave = request.form.get('clave')  # Obtener la contraseña del formulario
                    idTipoUsuario = 3  # 3 = miembro (cambiado de 2 a 3)
                    
                    # Manejar archivo de foto si existe
                    foto = request.files.get('foto')
                    if foto:
                        # Aquí podrías guardar la foto si lo necesitas
                        print(f"Foto recibida: {foto.filename}")
                
                # Validar que todos los campos requeridos estén presentes
                if not all([cedula, nombre, telefono, correo, clave]):
                    return {'error': 'Todos los campos son requeridos (incluyendo contraseña)'}, 400
                
                # Validar longitud mínima de contraseña
                if len(clave) < 6:
                    return {'error': 'La contraseña debe tener al menos 6 caracteres'}, 400
                
                cur = mysql.connection.cursor()
                
                # Verificar si el usuario ya existe
                cur.execute("SELECT cedula FROM usuario WHERE cedula = %s", (cedula,))
                if cur.fetchone():
                    cur.close()
                    return {'error': 'Ya existe un usuario con esta cédula'}, 400
                
                # Verificar si el correo ya existe
                cur.execute("SELECT correo FROM usuario WHERE correo = %s", (correo,))
                if cur.fetchone():
                    cur.close()
                    return {'error': 'Ya existe un usuario con este correo electrónico'}, 400
                
                # Crear el usuario con tipo 3 = Miembro
                cur.execute("""
                    INSERT INTO usuario (cedula, nombre, telefono, correo, clave, idTipoUsuario) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (cedula, nombre, telefono, correo, clave, idTipoUsuario))
                
                mysql.connection.commit()
                cur.close()
                
                return {'mensaje': 'Solicitud de membresía enviada correctamente'}, 201
                
            except Exception as e:
                return {'error': f'Error al crear usuario: {str(e)}'}, 500

    @api.route('/<string:cedula>')
    class UsuarioEspecifico(Resource):
        def get(self, cedula):
            """Obtener usuario por cédula"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM usuario WHERE cedula = %s", (cedula,))
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
            cur.execute("UPDATE usuario SET nombre=%s, telefono=%s, correo=%s WHERE cedula=%s",
                        (data['nombre'], data['telefono'], data['correo'], cedula))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Usuario actualizado correctamente'}

        def delete(self, cedula):
            """Eliminar usuario"""
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM usuario WHERE cedula = %s", (cedula,))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Usuario eliminado correctamente'}

    return api