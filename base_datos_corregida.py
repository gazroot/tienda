import sqlite3

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tienda_ropa.db')

conn = sqlite3.connect(DB)
cursor = conn.cursor()

# Usuarios
cursor.execute('''
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefono TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Categorías
cursor.execute('''
CREATE TABLE IF NOT EXISTS Categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
)
''')

# Proveedores
cursor.execute('''
CREATE TABLE IF NOT EXISTS Proveedores (
    id_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_empresa TEXT NOT NULL,
    contacto TEXT,
    telefono TEXT,
    email TEXT
)
''')

# Productos / Stock
cursor.execute('''
CREATE TABLE IF NOT EXISTS Productos (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
    id_categoria INTEGER NOT NULL,
    id_proveedor INTEGER NOT NULL,
    imagen TEXT,
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor)
)
''')

# Datos iniciales
categorias = [
    ('Titanio', 'Prendas estructurales y de estética metálica.'),
    ('Neopreno', 'Prendas técnicas y de alto rendimiento.'),
    ('Seda técnica', 'Prendas ligeras de acabado premium.')
]

cursor.executemany('''
INSERT OR IGNORE INTO Categorias (nombre, descripcion)
VALUES (?, ?)
''', categorias)

proveedores = [
    ('AURA // NØIR Atelier', 'Departamento de producción', '3000000000', 'atelier@auranoir.com'),
    ('NØIR Materials', 'Departamento de materiales', '3000000001', 'materials@auranoir.com')
]

cursor.executemany('''
INSERT OR IGNORE INTO Proveedores (nombre_empresa, contacto, telefono, email)
VALUES (?, ?, ?, ?)
''', proveedores)

# Evita duplicar productos cada vez que se ejecuta este archivo.
productos = [
    ('CHAQUETA VORONOI', 'Chaqueta escultórica de corte estructural.', 350000, 10, 'Titanio', 'AURA // NØIR Atelier', 'img/chaqueta-voronoi.jpg'),
    ('PANTALÓN TECTÓNICO', 'Pantalón técnico de silueta arquitectónica.', 280000, 8, 'Titanio', 'AURA // NØIR Atelier', 'img/pantalon-tectonico.jpg'),
    ('BOMBER KINÉTICA', 'Bomber técnica de volumen contemporáneo.', 420000, 5, 'Neopreno', 'AURA // NØIR Atelier', 'img/bomber-kinetica.jpg'),
    ('BOTAS EXOESQUELETO', 'Botas de estética futurista y construcción robusta.', 390000, 6, 'Titanio', 'NØIR Materials', 'img/botas-exoesqueleto.jpg'),
    ('TOP VECTOR', 'Top técnico de líneas minimalistas.', 180000, 12, 'Neopreno', 'NØIR Materials', 'img/top-vector.jpg'),
    ('FALDA ÓRBITA', 'Falda de estructura asimétrica.', 240000, 7, 'Seda técnica', 'AURA // NØIR Atelier', 'img/falda-orbita.jpg'),
    ('CAMISA NEXO', 'Camisa ligera de inspiración industrial.', 210000, 9, 'Seda técnica', 'AURA // NØIR Atelier', 'img/camisa-nexo.jpg'),
    ('PANTALÓN FASE', 'Pantalón técnico de líneas limpias.', 295000, 11, 'Neopreno', 'NØIR Materials', 'img/pantalon-fase.jpg')
]

for nombre, descripcion, precio, stock, categoria, proveedor, imagen in productos:
    cursor.execute('''
        SELECT id_producto FROM Productos WHERE nombre = ?
    ''', (nombre,))
    if cursor.fetchone() is None:
        cursor.execute('''
            INSERT INTO Productos
            (nombre, descripcion, precio, stock, id_categoria, id_proveedor, imagen)
            SELECT ?, ?, ?, ?, c.id_categoria, p.id_proveedor, ?
            FROM Categorias c, Proveedores p
            WHERE c.nombre = ? AND p.nombre_empresa = ?
        ''', (nombre, descripcion, precio, stock, imagen, categoria, proveedor))

conn.commit()

print('\nBase de datos creada/alimentada correctamente.')
print('\nProductos en stock:')
for producto in cursor.execute('''
    SELECT id_producto, nombre, precio, stock FROM Productos ORDER BY id_producto
'''):
    print(producto)

conn.close()
