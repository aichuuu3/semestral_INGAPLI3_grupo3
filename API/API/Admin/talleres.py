# talleres.py
from flask import jsonify, request
from conexion import obtener_conexion

def register_taller_routes(app):

    # GET: todos los talleres
    @app.route("/api/talleres", methods=["GET"])
    def get_talleres():
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Taller")
        talleres = cursor.fetchall()
        cursor.close()
        conexion.close()

        # Convertir DATE y TIME a string para JSON
        for taller in talleres:
            taller['fecha'] = taller['fecha'].strftime('%Y-%m-%d')
            taller['hora'] = str(taller['hora'])

        return jsonify(talleres)

    # GET: taller por ID
    @app.route("/api/talleres/<int:idTaller>", methods=["GET"])
    def get_taller(idTaller):
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Taller WHERE idTaller=%s", (idTaller,))
        taller = cursor.fetchone()
        cursor.close()
        conexion.close()

        if not taller:
            return jsonify({"mensaje": "Taller no encontrado"}), 404

        # Convertir DATE y TIME a string
        taller['fecha'] = taller['fecha'].strftime('%Y-%m-%d')
        taller['hora'] = str(taller['hora'])

        return jsonify(taller)

    # POST: crear taller
    @app.route("/api/talleres", methods=["POST"])
    def crear_taller():
        datos = request.get_json()
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        query = """
            INSERT INTO Taller (nombre, tipo, ubicacion, fecha, hora, estado, detalles)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            datos["nombre"],
            datos["tipo"],
            datos["ubicacion"],
            datos["fecha"],
            datos["hora"],
            datos.get("estado", "Activo"),
            datos.get("detalles", "")
        )
        cursor.execute(query, valores)
        conexion.commit()
        cursor.close()
        conexion.close()
        return jsonify({"mensaje": "Taller creado correctamente"}), 201

    # PUT: actualizar taller
    @app.route("/api/talleres/<int:idTaller>", methods=["PUT"])
    def actualizar_taller(idTaller):
        datos = request.get_json()
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        query = """
            UPDATE Taller
            SET nombre=%s, tipo=%s, fecha=%s, hora=%s, ubicacion=%s, detalles=%s
            WHERE idTaller=%s
        """
        valores = (
            datos["nombre"],
            datos["tipo"],
            datos["fecha"],
            datos["hora"],
            datos["ubicacion"],
            datos.get("detalles", ""),
            idTaller
        )
        
        cursor.execute(query, valores)
        conexion.commit()
        cursor.close()
        conexion.close()

        return jsonify({"mensaje": "Taller actualizado correctamente"})

    # DELETE: eliminar taller
    @app.route("/api/talleres/<int:idTaller>", methods=["DELETE"])
    def eliminar_taller(idTaller):
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute("DELETE FROM Taller WHERE idTaller=%s", (idTaller,))
        conexion.commit()
        cursor.close()
        conexion.close()
        return jsonify({"mensaje": "Taller eliminado correctamente"})
