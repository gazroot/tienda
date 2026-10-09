# AURA // NØIR — migración a Supabase + GitHub Pages

## Qué se cambió
- `catalogo.html`, `modelo.html` y `catalogo.js` consultan Supabase en lugar de Flask/localhost.
- `supabase-config.js` centraliza la URL y la clave pública.
- `supabase_schema.sql` crea las tablas `categorias`, `proveedores` y `productos`, carga los 8 productos actuales y activa políticas RLS de solo lectura pública.
- El carrito sigue guardado en `localStorage` con la clave `aura_noir_cart`; este paquete no implementa pedidos, pagos ni descuento real de stock al finalizar una compra.
- `app.py`, `base_datos.py`, `base_datos_corregida.py` y `tienda_ropa.db` se conservan como referencia/versión local antigua. GitHub Pages no ejecuta Flask ni SQLite.

## Pasos para activarlo
1. Crea un proyecto en https://supabase.com.
2. En **SQL Editor → New query**, pega `supabase_schema.sql` completo y pulsa **Run**.
3. En **Project Settings → API** (o **Connect**) copia la **Project URL** y la clave **publishable/anon**. Nunca uses `service_role` ni una clave secreta en el navegador.
4. Abre `supabase-config.js` y reemplaza los dos valores `PEGA_AQUI...` por los datos de tu proyecto.
5. Sube los archivos a GitHub en la misma carpeta/nivel, incluido `supabase-config.js`.
6. Publica desde **Settings → Pages** y prueba `catalogo.html` y el detalle de un producto.

## Límites y seguridad
- Las tablas de catálogo solo permiten lectura pública; no se permite modificar precios o stock desde el navegador.
- El carrito es local del navegador; no hay todavía registro de pedidos, pagos ni reducción de stock al comprar.
- El ZIP no incluye carpeta `img`, aunque la base conserva esas rutas; para mostrar fotos, sube los archivos al repositorio o a Supabase Storage.
- `inicio.html`, `carrito.html` y `aura.js` se conservan. `app.py` y los scripts SQLite quedan solo como referencia local y no son necesarios en GitHub Pages.
