# libros.py
from flask import jsonify, request
from conexion import obtener_conexion

def register_libro_routes(app):
    # GET: todos los libros
    @app.route("/api/libros", methods=["GET"])
    def get_libros():
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Libro")
        libros = cursor.fetchall()
        cursor.close()
        conexion.close()
        return jsonify(libros)

    # GET: libro por ID
    @app.route("/api/libros/<int:idLibro>", methods=["GET"])
    def get_libro(idLibro):
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Libro WHERE idLibro=%s", (idLibro,))
        libro = cursor.fetchone()
        cursor.close()
        conexion.close()
        if libro:
            return jsonify(libro)
        else:
            return jsonify({"mensaje": "Libro no encontrado"}), 404

    # POST: crear libro
    @app.route("/api/libros", methods=["POST"])
    def crear_libro():
        datos = request.get_json()
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        query = """
            INSERT INTO Libro (isbn, titulo, autor, cantidad, fechaIngreso, estado, categoria)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            datos["isbn"],
            datos["titulo"],
            datos["autor"],
            datos["cantidad"],
            datos["fechaIngreso"],
            datos.get("estado", "disponible"),
            datos["categoria"]
        )
        cursor.execute(query, valores)
        conexion.commit()
        cursor.close()
        conexion.close()
        return jsonify({"mensaje": "Libro creado correctamente"}), 201

    # PUT: actualizar libro
    @app.route("/api/libros/<int:idLibro>", methods=["PUT"])
    def actualizar_libro(idLibro):
        datos = request.get_json()
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        query = """
            UPDATE Libro
            SET isbn=%s, titulo=%s, autor=%s, cantidad=%s, fechaIngreso=%s, estado=%s, categoria=%s
            WHERE idLibro=%s
        """
        valores = (
            datos["isbn"],
            datos["titulo"],
            datos["autor"],
            datos["cantidad"],
            datos["fechaIngreso"],
            datos["estado"],
            datos["categoria"],
            idLibro
        )
        cursor.execute(query, valores)
        conexion.commit()
        cursor.close()
        conexion.close()
        return jsonify({"mensaje": "Libro actualizado correctamente"})
