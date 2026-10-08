import sqlite3
conn = sqlite3.connect('tienda_ropa.db')
cursor = conn.cursor()
cursor.execute('''create table if not exists usuario(id_usuario int auto_increment primary key,nombre varchar(100) not null,apellido varchar(100) not null,email varchar(150) not null unique,telefono varchar(20), fecha_registro datetime default current_timestamp )''')
cursor.execute('''create table if not exists direcciones(id_dirreccion int auto_increment primary key,calle varchar (150) not null,ciudad varchar(100) not null,departamento varchar(100),codigo_postal varchar(15),pais varchar(100) not null, es_principal    BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_direccion_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
        ON DELETE CASCADE  )''')
cursor.execute('''CREATE TABLE Categorias ( id_categoria    INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     VARCHAR(255))''')
cursor.execute('''CREATE TABLE Proveedores (
    id_proveedor    INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa  VARCHAR(150) NOT NULL,
    contacto        VARCHAR(100),
    telefono        VARCHAR(20),
    email           VARCHAR(150)
)''')
cursor.execute('''CREATE TABLE Productos (
    id_producto     INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     TEXT,
    precio          DECIMAL(10,2) NOT NULL,
    stock           INT NOT NULL DEFAULT 0,
    id_categoria    INT NOT NULL,
    id_proveedor    INT NOT NULL,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria),
    CONSTRAINT fk_producto_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor)''')
cursor.execute('''CREATE TABLE Metodos_Pago (
    id_metodo_pago  INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,   -- Tarjeta, Transferencia, PayPal, etc.
    descripcion     VARCHAR(255)
)''')
cursor.execute('''CREATE TABLE Pedidos (
    id_pedido       INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    id_direccion    INT NOT NULL,
    fecha_pedido    DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_envio    ENUM('pendiente','procesando','enviado','entregado','cancelado') DEFAULT 'pendiente',
    total           DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    CONSTRAINT fk_pedido_direccion
        FOREIGN KEY (id_direccion) REFERENCES Direcciones(id_direccion)
)''')
cursor.execute('''CREATE TABLE Detalles_Pedidos (
    id_detalle          INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido           INT NOT NULL,
    id_producto          INT NOT NULL,
    cantidad             INT NOT NULL,
    precio_unitario       DECIMAL(10,2) NOT NULL, -- precio del producto al momento de la compra
    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
)''')
cursor.execute('''CREATE TABLE Transacciones (
    id_transaccion  INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido       INT NOT NULL,
    id_metodo_pago  INT NOT NULL,
    monto           DECIMAL(10,2) NOT NULL,
    fecha_pago      DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_pago     ENUM('pendiente','aprobado','rechazado','reembolsado') DEFAULT 'pendiente',
    referencia      VARCHAR(100),
    CONSTRAINT fk_transaccion_pedido
        FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    CONSTRAINT fk_transaccion_metodo
        FOREIGN KEY (id_metodo_pago) REFERENCES Metodos_Pago(id_metodo_pago)
)''')
cursor.execute('''CREATE TABLE Resenas (
    id_resena       INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    id_producto     INT NOT NULL,
    calificacion    TINYINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario      TEXT,
    fecha_resena    DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resena_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    CONSTRAINT fk_resena_producto
        FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
)''')
conn.commit()
conn.close()
