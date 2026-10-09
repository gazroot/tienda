from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tienda_ropa.db')

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


@app.get('/')
def inicio():
    return send_from_directory('.', 'inicio.html')


@app.get('/<path:archivo>')
def archivos(archivo):
    return send_from_directory('.', archivo)

@app.get('/api/productos')
def productos():
    try:
        conn = get_db()

        rows = conn.execute('''
            SELECT
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                c.nombre AS categoria
            FROM Productos p
            LEFT JOIN Categorias c
                ON c.id_categoria = p.id_categoria
            ORDER BY p.id_producto
        ''').fetchall()

        conn.close()

        return jsonify([dict(row) for row in rows])

    except Exception as e:
        print("ERROR EN /api/productos:", e)
        return jsonify({
            "error": str(e)
        }), 500

@app.get('/api/productos/<int:id_producto>')
def obtener_producto(id_producto):
    try:
        conn = get_db()

        row = conn.execute('''
            SELECT
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                c.nombre AS categoria
            FROM Productos p
            LEFT JOIN Categorias c
                ON c.id_categoria = p.id_categoria
            WHERE p.id_producto = ?
        ''', (id_producto,)).fetchone()

        conn.close()

        if row is None:
            return jsonify({
                "error": "Producto no encontrado",
                "id_producto": id_producto
            }), 404

        return jsonify(dict(row))

    except Exception as e:
        print("ERROR AL OBTENER PRODUCTO:", e)
        return jsonify({
            "error": str(e)
        }), 500

@app.post('/api/productos/<int:id_producto>/vender')
def vender(id_producto):
    data = request.get_json(silent=True) or {}
    cantidad = int(data.get('cantidad', 1))

    if cantidad < 1:
        return jsonify({'error': 'La cantidad debe ser mayor que 0'}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT stock FROM Productos WHERE id_producto = ?', (id_producto,))
    row = cur.fetchone()

    if row is None:
        conn.close()
        return jsonify({'error': 'Producto no encontrado'}), 404

    if row['stock'] < cantidad:
        conn.close()
        return jsonify({'error': 'Stock insuficiente', 'stock': row['stock']}), 409

    cur.execute('''
        UPDATE Productos
        SET stock = stock - ?
        WHERE id_producto = ? AND stock >= ?
    ''', (cantidad, id_producto, cantidad))
    conn.commit()

    cur.execute('SELECT stock FROM Productos WHERE id_producto = ?', (id_producto,))
    nuevo_stock = cur.fetchone()['stock']
    conn.close()

    return jsonify({'ok': True, 'id_producto': id_producto, 'stock': nuevo_stock})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
