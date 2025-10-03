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

    # NUEVO MODELO PARA LOGIN ADMINISTRATIVO
    loginModelo = api.model('Login', {
        'correo': fields.String(required=True, description='Correo del usuario'),
        'clave': fields.String(required=True, description='Contraseña del usuario')
    })

    @api.route('')
    class Usuarios(Resource):
        def get(self):
            """Obtener todos los usuarios con tipo de usuario"""
            try:
                cur = mysql.connection.cursor()
                cur.execute("""
                    SELECT u.idUsuario, u.cedula, u.nombre, u.telefono, u.correo, u.clave, u.idTipoUsuario, t.nombre
                    FROM usuario u
                    INNER JOIN tipousuario t ON u.idTipoUsuario = t.idTipoUsuario
                """)
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
                        'idTipoUsuario': usuario[6],
                        'tipoUsuario': usuario[7]
                    } for usuario in usuarios]
                else:
                    return {'mensaje': 'No se encontraron usuarios'}, 404
            except Exception as e:
                return {'error': f'Error al obtener usuarios: {str(e)}'}, 500

        @api.expect(usuarioModelo)
        def post(self):
            """Crear nuevo usuario - SIEMPRE TIPO 3 (MIEMBRO)"""
            try:
                if request.content_type and 'application/json' in request.content_type:
                    data = request.json
                    cedula = data['cedula']
                    nombre = data['nombre']
                    telefono = data['telefono']
                    correo = data['correo']
                    clave = data['clave'] 
                    idTipoUsuario = 3  # Solo miembros pueden registrarse
                else:
                    cedula = request.form.get('cedula')
                    nombre = request.form.get('nombre')
                    telefono = request.form.get('telefono')
                    correo = request.form.get('correo')
                    clave = request.form.get('clave') 
                    idTipoUsuario = 3  # Solo miembros pueden registrarse
                
                if not all([cedula, nombre, telefono, correo, clave]):
                    return {'error': 'Todos los campos son requeridos'}, 400
                
                if len(clave) < 6:
                    return {'error': 'La contraseña debe tener al menos 6 caracteres'}, 400
                
                cur = mysql.connection.cursor()
                
                cur.execute("SELECT cedula FROM usuario WHERE cedula = %s", (cedula,))
                if cur.fetchone():
                    cur.close()
                    return {'error': 'Ya existe un usuario con esta cédula'}, 400
                
                cur.execute("SELECT correo FROM usuario WHERE correo = %s", (correo,))
                if cur.fetchone():
                    cur.close()
                    return {'error': 'Ya existe un usuario con este correo electrónico'}, 400
                
                cur.execute("""
                    INSERT INTO usuario (cedula, nombre, telefono, correo, clave, idTipoUsuario) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (cedula, nombre, telefono, correo, clave, idTipoUsuario))
                
                mysql.connection.commit()
                cur.close()
                
                return {'mensaje': 'Solicitud de membresía enviada correctamente'}, 201
                
            except Exception as e:
                return {'error': f'Error al crear usuario: {str(e)}'}, 500

    # ENDPOINT PARA LOGIN DE MIEMBROS (TIPO 3 SOLAMENTE)
    @api.route('/login')
    class Login(Resource):
        @api.expect(loginModelo)
        def post(self):
            """Iniciar sesión SOLO PARA MIEMBROS (tipo 3)"""
            try:
                if request.content_type and 'application/json' in request.content_type:
                    data = request.json
                    correo = data.get('correo')
                    clave = data.get('clave')
                else:
                    correo = request.form.get('correo')
                    clave = request.form.get('clave')
                
                if not correo or not clave:
                    return {'error': 'El correo y la contraseña son obligatorios'}, 400
                
                cur = mysql.connection.cursor()
                
                # SOLO PERMITIR TIPO 3 (MIEMBROS) EN ESTE ENDPOINT
                cur.execute("""
                    SELECT u.idUsuario, u.cedula, u.nombre, u.telefono, u.correo, u.idTipoUsuario, t.nombre
                    FROM usuario u
                    INNER JOIN tipousuario t ON u.idTipoUsuario = t.idTipoUsuario
                    WHERE u.correo = %s AND u.clave = %s AND u.idTipoUsuario = 3
                """, (correo, clave))
                
                usuario = cur.fetchone()
                
                if usuario:
                    cur.close()
                    return {
                        'mensaje': 'Inicio de sesión exitoso',
                        'usuario': {
                            'idUsuario': usuario[0],
                            'cedula': usuario[1],
                            'nombre': usuario[2],
                            'telefono': usuario[3],
                            'correo': usuario[4],
                            'idTipoUsuario': usuario[5],
                            'tipoUsuario': usuario[6],
                            'redirigirA': 'inicio.html'  # Redirección específica
                        }
                    }, 200
                else:
                    # Verificar si existe pero no es miembro
                    cur.execute("""
                        SELECT u.idTipoUsuario, t.nombre
                        FROM usuario u
                        INNER JOIN tipousuario t ON u.idTipoUsuario = t.idTipoUsuario
                        WHERE u.correo = %s AND u.clave = %s
                    """, (correo, clave))
                    
                    usuario_no_miembro = cur.fetchone()
                    cur.close()
                    
                    if usuario_no_miembro:
                        tipo_usuario = usuario_no_miembro[1]
                        return {'error': f'Acceso denegado. Este portal es solo para miembros. Tu tipo de usuario es: {tipo_usuario}. Contacta al administrador para acceder a tu panel correspondiente.'}, 403
                    else:
                        return {'error': 'Correo electrónico o contraseña incorrectos'}, 401
                    
            except Exception as e:
                return {'error': f'Error en el inicio de sesión: {str(e)}'}, 500

    # NUEVO ENDPOINT PARA LOGIN ADMINISTRATIVO (TODOS LOS TIPOS)
    @api.route('/login-admin')
    class LoginAdmin(Resource):
        @api.expect(loginModelo)
        def post(self):
            """Iniciar sesión para ADMINISTRADORES Y CONTADORES"""
            try:
                if request.content_type and 'application/json' in request.content_type:
                    data = request.json
                    correo = data.get('correo')
                    clave = data.get('clave')
                else:
                    correo = request.form.get('correo')
                    clave = request.form.get('clave')
                
                if not correo or not clave:
                    return {'error': 'El correo y la contraseña son obligatorios'}, 400
                
                cur = mysql.connection.cursor()
                
                # PERMITIR TODOS LOS TIPOS DE USUARIO
                cur.execute("""
                    SELECT u.idUsuario, u.cedula, u.nombre, u.telefono, u.correo, u.idTipoUsuario, t.nombre
                    FROM usuario u
                    INNER JOIN tipousuario t ON u.idTipoUsuario = t.idTipoUsuario
                    WHERE u.correo = %s AND u.clave = %s
                """, (correo, clave))
                
                usuario = cur.fetchone()
                cur.close()
                
                if usuario:
                    # Determinar redirección según tipo de usuario
                    redireccion_map = {
                        1: 'API/Administrador/MenuAdmin.html',  # Administrador
                        2: 'Contador/generarInformes.html',     # Contador
                        3: 'inicio.html'                        # Miembro
                    }
                    
                    tipo_usuario_id = usuario[5]
                    redirigir_a = redireccion_map.get(tipo_usuario_id, 'inicio.html')
                    
                    return {
                        'mensaje': 'Inicio de sesión exitoso',
                        'usuario': {
                            'idUsuario': usuario[0],
                            'cedula': usuario[1],
                            'nombre': usuario[2],
                            'telefono': usuario[3],
                            'correo': usuario[4],
                            'idTipoUsuario': usuario[5],
                            'tipoUsuario': usuario[6],
                            'redirigirA': redirigir_a
                        }
                    }, 200
                else:
                    return {'error': 'Correo electrónico o contraseña incorrectos'}, 401
                    
            except Exception as e:
                return {'error': f'Error en el inicio de sesión: {str(e)}'}, 500

    @api.route('/<string:cedula>')
    class UsuarioEspecifico(Resource):
        def get(self, cedula):
            """Obtener usuario por cédula"""
            try:
                cur = mysql.connection.cursor()
                cur.execute("""
                    SELECT u.idUsuario, u.cedula, u.nombre, u.telefono, u.correo, u.clave, u.idTipoUsuario, t.nombre
                    FROM usuario u
                    INNER JOIN tipousuario t ON u.idTipoUsuario = t.idTipoUsuario
                    WHERE u.cedula = %s
                """, (cedula,))
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
                        'idTipoUsuario': usuario[6],
                        'tipoUsuario': usuario[7]
                    }
                else:
                    return {'mensaje': 'Usuario no encontrado'}, 404
            except Exception as e:
                return {'error': f'Error al buscar usuario: {str(e)}'}, 500

        @api.expect(usuarioModelo)
        def put(self, cedula):
            """Actualizar usuario"""
            try:
                data = request.json
                cur = mysql.connection.cursor()
                cur.execute("""
                    UPDATE usuario 
                    SET nombre=%s, telefono=%s, correo=%s 
                    WHERE cedula=%s
                """, (data['nombre'], data['telefono'], data['correo'], cedula))
                mysql.connection.commit()
                cur.close()
                return {'mensaje': 'Usuario actualizado correctamente'}
            except Exception as e:
                return {'error': f'Error al actualizar usuario: {str(e)}'}, 500

        def delete(self, cedula):
            """Eliminar usuario"""
            try:
                cur = mysql.connection.cursor()
                cur.execute("DELETE FROM usuario WHERE cedula = %s", (cedula,))
                mysql.connection.commit()
                cur.close()
                return {'mensaje': 'Usuario eliminado correctamente'}
            except Exception as e:
                return {'error': f'Error al eliminar usuario: {str(e)}'}, 500

    @api.route('/solicitar-membresia')
    class SolicitarMembresia(Resource):
        def post(self):
            """Solicitar membresía - Crear usuario, solicitud y miembro inactivo"""
            try:
                data = request.json
                
                # Validar campos requeridos
                campos_requeridos = ['nombre', 'cedula', 'telefono', 'correo', 'clave']
                for campo in campos_requeridos:
                    if not data.get(campo):
                        return {'error': f'El campo {campo} es requerido'}, 400
                
                # Validaciones adicionales
                if len(data['clave']) < 6:
                    return {'error': 'La contraseña debe tener al menos 6 caracteres'}, 400
                
                cur = mysql.connection.cursor()
                
                # Verificar si ya existe usuario con esa cédula
                cur.execute("SELECT cedula FROM usuario WHERE cedula = %s", (data['cedula'],))
                if cur.fetchone():
                    cur.close()
                    return {'error': 'Ya existe un usuario con esta cédula'}, 409
                
                # Verificar si ya existe usuario con ese correo
                cur.execute("SELECT correo FROM usuario WHERE correo = %s", (data['correo'],))
                if cur.fetchone():
                    cur.close()
                    return {'error': 'Ya existe un usuario con este correo electrónico'}, 409
                
                # PASO 1: Crear el usuario (tipo 3 = miembro, pero inactivo)
                cur.execute("""
                    INSERT INTO usuario (cedula, nombre, telefono, correo, clave, idTipoUsuario) 
                    VALUES (%s, %s, %s, %s, %s, 3)
                """, (data['cedula'], data['nombre'], data['telefono'], data['correo'], data['clave']))
                
                # PASO 2: Crear la solicitud de membresía
                fecha_solicitud = data.get('fechaSolicitud', '2025-10-03')  # Fecha actual por defecto
                cur.execute("""
                    INSERT INTO solicitudmembresia (cedula, fechaSolicitud, estado) 
                    VALUES (%s, %s, 'pendiente')
                """, (data['cedula'], fecha_solicitud))
                
                # OBTENER EL ID DE LA SOLICITUD RECIÉN CREADA
                id_solicitud = cur.lastrowid
                
                # PASO 3: Crear registro en tabla miembro con estado "inactivo" e idSolicitud
                cur.execute("""
                    INSERT INTO miembro (cedula, idSolicitud, estado) 
                    VALUES (%s, %s, 'inactivo')
                """, (data['cedula'], id_solicitud))
                
                mysql.connection.commit()
                cur.close()
                
                return {
                    'mensaje': 'Solicitud de membresía registrada correctamente',
                    'datos': {
                        'cedula': data['cedula'],
                        'nombre': data['nombre'],
                        'estado': 'Pendiente de aprobación',
                        'fechaSolicitud': fecha_solicitud
                    }
                }, 201
                
            except Exception as e:
                return {'error': f'Error al procesar solicitud: {str(e)}'}, 500

    return api