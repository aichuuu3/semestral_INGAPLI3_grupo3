from flask import Flask
from flask_mysqldb import MySQL
from flask_restx import Api
from config import DB_CONFIG
from usuario import crearUsuario
from libros import crearLibros
from miembros import crearMiembros
from pagarCuotas import crearPagarCuotas
from solicitudMembresia import crearSolicitudMembresia
from talleres import crearTalleres
from tipoUsuario import crearTipoUsuario

app = Flask(__name__)
app.config.update(DB_CONFIG)
mysql = MySQL(app)

api = Api(app, doc='/docs/', title='API APLJ',
          description='API para gestión de usuarios, talleres y libros')

# Registrar el namespace de usuarios
api.add_namespace(crearUsuario(mysql), path='/usuarios')
api.add_namespace(crearLibros(mysql), path='/libros')
api.add_namespace(crearMiembros(mysql), path='/miembros')
api.add_namespace(crearPagarCuotas(mysql), path='/pagarCuotas')
api.add_namespace(crearSolicitudMembresia(mysql), path='/solicitudMembresia')
api.add_namespace(crearTalleres(mysql), path='/talleres')
api.add_namespace(crearTipoUsuario(mysql), path='/tipoUsuario')



if __name__ == '__main__':
    app.run(debug=True)