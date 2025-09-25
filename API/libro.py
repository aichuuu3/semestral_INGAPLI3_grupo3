from flask import request
from flask_restx import Namespace, Resource, fields

def crearLibro(mysql):
    api = Namespace('libros', description='Operaciones de libros')

    libroModelo = api.model('Libro', {
        'isbn': fields.String(required=True, description='ISBN del libro'),
        'titulo': fields.String(required=True, description='Título del libro'),
        'autor': fields.String(required=True, description='Autor del libro'),
        'cantidad': fields.String(required=True, description='Cantidad de libros'),
        'fechaIngreso': fields.Date(required=True, description='Fecha de publicación del libro')
    })

    #funcion get
    @api.route('')
    class Libros(Resource):
        def get(self):
            """Obtener todos los libros"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM Libro")
            libros = cur.fetchall()
            cur.close()
            if libros:
                return [{
                    'isbn': libro[0],
                    'titulo': libro[1],
                    'autor': libro[2],
                    'cantidad': libro[3],
                    'fechaIngreso': libro[4],
                } for libro in libros]
            else:
                return {'mensaje': 'No se encontraron libros'}, 404

        #funcion post
        @api.expect(libroModelo)
        def post(self):
            """Crear nuevo libro"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO Libro (isbn, titulo, autor, cantidad, fechaIngreso) VALUES (%s, %s, %s, %s, %s)",
                        (data['isbn'], data['titulo'], data['autor'], data['cantidad'], data['fechaIngreso']))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Libro creado correctamente'}, 201

    #funcion get para buscar un libro en especifico (modificar)
    @api.route('/<string:isbn>')
    class LibroEspecifico(Resource):
        def get(self, isbn):
            """Obtener libro por ISBN"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM Libro WHERE isbn = %s", (isbn,))
            libro = cur.fetchone()
            cur.close()
            if libro:
                return {
                    'isbn': libro[0],
                    'titulo': libro[1],
                    'autor': libro[2],
                    'cantidad': libro[3],
                    'fechaIngreso': libro[4],
                }
            else:
                return {'mensaje': 'Libro no encontrado'}, 404

        #funcion put
        @api.expect(libroModelo)
        def put(self, isbn):
            """Actualizar libro"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("UPDATE Libro SET titulo=%s, autor=%s, cantidad=%s, fechaIngreso=%s WHERE isbn=%s",
                        (data['titulo'], data['autor'], data['cantidad'], data['fechaIngreso'], isbn))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Libro actualizado correctamente'}

        #funcion delete
        def delete(self, isbn):
            """Eliminar libro"""
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM Libro WHERE isbn = %s", (isbn,))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Libro eliminado correctamente'}

    return api