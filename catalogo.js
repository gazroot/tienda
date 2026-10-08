document.addEventListener("DOMContentLoaded", async () => {
    const productGrid = document.getElementById("product-grid");

    if (!productGrid) return;

    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/productos");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los productos");
        }

        const productos = await respuesta.json();

        productGrid.innerHTML = "";

        productos.forEach(producto => {
            const productoHTML = document.createElement("article");

            productoHTML.className = "product-item";

            productoHTML.innerHTML = `
                <div class="product-card">

                    <div class="product-image">
                        <div class="image-placeholder">
                            AURA // NØIR
                        </div>
                    </div>

                    <div class="product-info">
                        <h3>${producto.nombre}</h3>

                        <p>${producto.descripcion || ""}</p>

                        <p class="product-price">
                            $${Number(producto.precio).toLocaleString("es-CO")}
                        </p>

                        <p class="product-stock">
                            Stock: ${producto.stock}
                        </p>

                        ${
                            producto.stock > 0
                            ? `
                                <button
                                    class="add-to-bag-btn"
                                    data-id="${producto.id_producto}"
                                    data-name="${producto.nombre}"
                                    data-price="${producto.precio}"
                                >
                                    AÑADIR A LA BOLSA
                                </button>
                            `
                            : `
                                <button disabled>
                                    AGOTADO
                                </button>
                            `
                        }

                    </div>
                </div>
            `;

            productGrid.appendChild(productoHTML);
        });

        // Activar botones de compra
        document.querySelectorAll(".add-to-bag-btn").forEach(boton => {

            boton.addEventListener("click", () => {

                const producto = {
                    id: boton.dataset.id,
                    nombre: boton.dataset.name,
                    precio: Number(boton.dataset.price),
                    cantidad: 1
                };

                agregarAlCarrito(producto);
            });

        });

    } catch (error) {

        console.error("Error cargando productos:", error);

        productGrid.innerHTML = `
            <p>
                No se pudo conectar con el stock.
                Verifica que el servidor esté funcionando.
            </p>
        `;
    }
});


/* =====================================================
   CARRITO
===================================================== */

function agregarAlCarrito(producto) {

    let carrito = JSON.parse(
        localStorage.getItem("aura_noir_cart")
    ) || [];

    const productoExistente = carrito.find(
        item => item.id == producto.id
    );

    if (productoExistente) {

        productoExistente.cantidad += 1;

    } else {

        carrito.push(producto);

    }

    localStorage.setItem(
        "aura_noir_cart",
        JSON.stringify(carrito)
    );

    actualizarContadorCarrito();

    mostrarMensaje(
        `${producto.nombre} añadido a la bolsa`
    );
}


/* =====================================================
   CONTADOR DE BOLSA
===================================================== */

function actualizarContadorCarrito() {

    const carrito = JSON.parse(
        localStorage.getItem("aura_noir_cart")
    ) || [];

    const cantidad = carrito.reduce(
        (total, producto) =>
            total + producto.cantidad,
        0
    );

    const bolsa = document.querySelector(
        'a[data-path="bag"]'
    );

    if (bolsa) {

        const contador = bolsa.querySelector(
            ".cart-count"
        );

        if (contador) {
            contador.textContent = cantidad;
        }

    }
}


/* =====================================================
   MENSAJE
===================================================== */

function mostrarMensaje(texto) {

    let mensaje = document.getElementById(
        "status-toast"
    );

    if (!mensaje) {

        mensaje = document.createElement("div");

        mensaje.id = "status-toast";

        mensaje.style.position = "fixed";
        mensaje.style.bottom = "30px";
        mensaje.style.right = "30px";
        mensaje.style.zIndex = "9999";
        mensaje.style.padding = "15px 20px";
        mensaje.style.background = "#111";
        mensaje.style.color = "#fff";

        document.body.appendChild(mensaje);
    }

    mensaje.textContent = texto;

    mensaje.style.display = "block";

    setTimeout(() => {
        mensaje.style.display = "none";
    }, 2500);
}


/* =====================================================
   INICIAR CONTADOR
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    actualizarContadorCarrito
);