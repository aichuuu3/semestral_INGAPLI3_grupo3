
import mysql.connector

def obtener_conexion():
    conexion = mysql.connector.connect(
        host="localhost",
        user="root",      
        password="mySql2025", # contraseña
        database="APLIJ" # nombre de la base de datos
    )
    return conexion
