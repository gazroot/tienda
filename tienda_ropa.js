use("tienda_ropa");

// Crear colección de usuarios
const usuarios = db.getCollection("usuarios");

// Crear índice único para el correo electrónico
usuarios.createIndex(
    { email: 1 },
    { unique: true }
);