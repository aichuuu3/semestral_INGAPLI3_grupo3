from flask import request
from flask_restx import Namespace, Resource, fields

def crearPago(mysql):
    api = Namespace('pagos', description='Operaciones de pagos de cuotas')

    pagoModelo = api.model('Pago', {
        'idMiembro': fields.Integer(required=True, description='ID del miembro que realiza el pago'),
        'fechaPago': fields.String(required=True, description='Fecha del pago (YYYY-MM-DD)'),
        'monto': fields.Float(required=True, description='Monto del pago')
    })

    @api.route('')
    class Pagos(Resource):
        def get(self):
            """Obtener todos los pagos"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM pagarcuota")
            pagos = cur.fetchall()
            cur.close()
            if pagos:
                return [{
                    'idPago': pago[0],
                    'idMiembro': pago[1],
                    'fechaPago': str(pago[2]),
                    'monto': float(pago[3])
                } for pago in pagos]
            else:
                return {'mensaje': 'No se encontraron pagos'}, 404

        @api.expect(pagoModelo)
        def post(self):
            """Registrar un nuevo pago"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute(
                "INSERT INTO pagarcuota (idMiembro, fechaPago, monto) VALUES (%s, %s, %s)",
                (data['idMiembro'], data['fechaPago'], data['monto'])
            )
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Pago registrado correctamente'}, 201

    @api.route('/<int:idPago>')
    class PagoEspecifico(Resource):
        def get(self, idPago):
            """Obtener pago por ID"""
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM pagarcuota WHERE idPago = %s", (idPago,))
            pago = cur.fetchone()
            cur.close()
            if pago:
                return {
                    'idPago': pago[0],
                    'idMiembro': pago[1],
                    'fechaPago': str(pago[2]),
                    'monto': float(pago[3])
                }
            else:
                return {'mensaje': 'Pago no encontrado'}, 404

        @api.expect(pagoModelo)
        def put(self, idPago):
            """Actualizar un pago"""
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute(
                "UPDATE pagarcuota SET idMiembro=%s, fechaPago=%s, monto=%s WHERE idPago=%s",
                (data['idMiembro'], data['fechaPago'], data['monto'], idPago)
            )
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Pago actualizado correctamente'}

        def delete(self, idPago):
            """Eliminar un pago"""
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM pagarcuota WHERE idPago = %s", (idPago,))
            mysql.connection.commit()
            cur.close()
            return {'mensaje': 'Pago eliminado correctamente'}

    return api
