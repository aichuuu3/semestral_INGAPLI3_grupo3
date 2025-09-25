CREATE DATABASE APLIJ;

USE APLIJ; 
-- Tabla de tipos de usuario / roles
CREATE TABLE TipoUsuario (
  idTipoUsuario TINYINT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

-- Insertar los roles iniciales
INSERT INTO TipoUsuario (idTipoUsuario, nombre) VALUES
(1, 'Administrador'),
(2, 'Contador'),
(3, 'Miembro');

-- Tabla de usuarios
CREATE TABLE Usuario (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(12) UNIQUE NOT NULL, -- se normaliza para formato 00-0000-0000
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(15), -- se normaliza para formato telefono o celular en back
  correo VARCHAR(100) UNIQUE,
  clave VARCHAR(15) NOT NULL,
  idTipoUsuario TINYINT NOT NULL,
  FOREIGN KEY (idTipoUsuario) REFERENCES TipoUsuario(idTipoUsuario)
);

INSERT INTO Usuario (cedula, nombre, telefono, correo, clave, idTipoUsuario)
VALUES
('01-2345-6789', 'Juan Pérez', '6123-4567', 'juan.perez@email.com', '123456', 3),
('10-0000-0000', 'María Gómez', '0507-612-3456', 'maria.gomez@email.com', 'abcdef', 3);

CREATE TABLE SolicitudMembresia (
  idSolicitud INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(12) NOT NULL,
  fechaSolicitud DATE NOT NULL,
  estado ENUM('pendiente','aceptada','rechazada') DEFAULT 'pendiente',
  FOREIGN KEY (cedula) REFERENCES Usuario(cedula)
);

INSERT INTO SolicitudMembresia (cedula, fechaSolicitud)
VALUES
('01-2345-6789', '2025-09-23'),
('10-0000-0000', '2025-09-22');
 
CREATE TABLE Miembro (
  idMiembro INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(12) NOT NULL,
  idSolicitud INT NOT NULL,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  FOREIGN KEY (cedula) REFERENCES Usuario(cedula),
  FOREIGN KEY (idSolicitud) REFERENCES SolicitudMembresia(idSolicitud)
);

INSERT INTO Miembro (cedula, idSolicitud)
VALUES
('01-2345-6789', 1),
('10-0000-0000', 2);

CREATE TABLE PagarCuota (
  idPago INT AUTO_INCREMENT PRIMARY KEY,
  idMiembro INT NOT NULL,
  fechaPago DATE NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (idMiembro) REFERENCES Miembro(idMiembro) -- para traer en informes lo de morosidad o no
);

INSERT INTO PagarCuota (idMiembro, fechaPago, monto)
VALUES
(1, '2025-09-23', 50.00),
(2, '2025-09-23', 75.00);

CREATE TABLE Taller ( 
idTaller INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR (50) NOT NULL,
tipo ENUM('Literatura', 'Práctico', 'Arte', 'Ciencia', 'Tecnología') NOT NULL,
ubicacion VARCHAR (100) NOT NULL,
fecha DATE NOT NULL,
hora TIME NOT NULL
);

INSERT INTO Taller (nombre, tipo, ubicacion, fecha, hora)
VALUES
('Taller de Escritura Creativa', 'Literatura', 'Sala 101', '2025-10-05', '10:00:00'),
('Taller de Pintura', 'Arte', 'Aula de Arte', '2025-10-06', '14:30:00');

-- Crear tabla Libro
CREATE TABLE Libro (
  idLibro INT AUTO_INCREMENT PRIMARY KEY,
  isbn VARCHAR(7) UNIQUE,                -- ISBN sin guiones (10 o 13 dígitos)
  titulo VARCHAR(100) NOT NULL,                -- Título del libro
  autor VARCHAR(100) NOT NULL,                 -- Autor del libro
  cantidad INT NOT NULL , -- Cantidad disponible (no negativa)
  fechaIngreso DATE NOT NULL                   -- Fecha de ingreso del libro
);

-- Insertar libros de ejemplo
INSERT INTO Libro (isbn, titulo, autor, cantidad, fechaIngreso)
VALUES
('9783143', 'Cien Años de Soledad', 'Gabriel García Márquez', 5, '2025-09-23'),
('9780262', 'Introducción a Algoritmos', 'Thomas H. Cormen', 3, '2025-09-22');

DROP TABLE APLIJ; 
