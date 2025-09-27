from flask import Flask
from flask_mysqldb import MySQL
from flask_restx import Api
from flask_cors import CORS
from config import DB_CONFIG
from usuario import crearUsuario
from tipoUsuario import crearTipoUsuario
from taller import crearTallercito
from pagarCuota import crearPago
from libro import crearLibro
from membresia import crearMembresia
from miembro import crearMiembro

app = Flask(__name__)
app.config.update(DB_CONFIG)

# Habilitar CORS
CORS(app)

mysql = MySQL(app)
CORS(app)

api = Api(app, doc='/docs/', title='API APLJ',
          description='API para gestión de usuarios, talleres y libros')

# Namespaces
api.add_namespace(crearUsuario(mysql), path='/usuarios')
api.add_namespace(crearTipoUsuario(mysql), path='/tipoUsuario')
api.add_namespace(crearTallercito(mysql), path='/talleres')
api.add_namespace(crearLibro(mysql), path='/libro')
api.add_namespace(crearMembresia(mysql), path='/membresia')
api.add_namespace(crearPago(mysql), path='/pagarCuota')
api.add_namespace(crearMiembro(mysql), path='/miembro')  

if __name__ == '__main__':
    app.run(debug=True)