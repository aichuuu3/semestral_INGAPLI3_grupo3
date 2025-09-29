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

mysql = MySQL(app)

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

# Endpoint simple para probar la API
@app.route('/test')
def test():
    return {'mensaje': 'API funcionando correctamente', 'status': 'OK'}

# Endpoint para probar conexión a la base de datos
@app.route('/test-db')
def test_db():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT 1")
        result = cur.fetchone()
        cur.close()
        return {'mensaje': 'Conexión a la base de datos exitosa', 'status': 'OK'}
    except Exception as e:
        return {'error': f'Error de conexión a la base de datos: {str(e)}', 'status': 'ERROR'}, 500

# Configurar CORS para permitir peticiones desde cualquier origen
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)