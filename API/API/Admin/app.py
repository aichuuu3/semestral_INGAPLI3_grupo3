# app.py
from flask import Flask
from flask_cors import CORS
import admin
import libros
import talleres 

app = Flask(__name__)
CORS(app)  # Permite solicitudes desde tu frontend

# Registramos rutas
admin.register_admin_routes(app)
libros.register_libro_routes(app)
talleres.register_taller_routes(app)

if __name__ == "__main__":
    app.run(debug=True)
