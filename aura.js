// ============================================================
// AURA // NØIR - JavaScript principal de la tienda
// ============================================================

(() => {
    "use strict";

    // ----------------------------------------------------------
    // CONFIGURACIÓN
    // ----------------------------------------------------------

    const CART_KEY = "aura_noir_cart";
    const RESERVATION_KEY = "aura_noir_reservation";

    // 15 minutos
    const RESERVATION_SECONDS = 900;


    // ----------------------------------------------------------
    // CARRITO
    // ----------------------------------------------------------

    function readCart() {
        try {
            const cart = JSON.parse(localStorage.getItem(CART_KEY));

            if (Array.isArray(cart)) {
                return cart;
            }

            return [];

        } catch (error) {
            console.error("Error leyendo el carrito:", error);
            return [];
        }
    }


    function saveCart(cart) {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

        updateCartCounter();
        updateSummary();
    }


    function getCartCount() {

        return readCart().reduce(
            (total, item) =>
                total + (Number(item.quantity) || 0),
            0
        );
    }


    function getCartTotal() {

        return readCart().reduce(
            (total, item) =>
                total +
                (Number(item.price) || 0) *
                (Number(item.quantity) || 0),
            0
        );
    }


    // ----------------------------------------------------------
    // FORMATO DE DINERO
    // ----------------------------------------------------------

    function formatMoney(value) {

        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }).format(value || 0);

    }


    // ----------------------------------------------------------
    // CONTADOR DE LA BOLSA
    // ----------------------------------------------------------

    function updateCartCounter() {

        const count = getCartCount();

        document
            .querySelectorAll(
                'a[data-path="bag"] span:last-child, [data-cart-count], #cart-count'
            )
            .forEach(element => {

                element.textContent = `[${count}]`;

            });
    }


    // ----------------------------------------------------------
    // NOTIFICACIÓN
    // ----------------------------------------------------------

    function showToast(productName) {

        let toast =
            document.getElementById("status-toast");


        // Si no existe, lo creamos
        if (!toast) {

            toast = document.createElement("div");

            toast.id = "status-toast";

            toast.className =
                "fixed bottom-6 right-6 z-[100] " +
                "bg-primary-fixed text-on-primary " +
                "px-space-md py-3 shadow-2xl " +
                "flex items-center gap-3 " +
                "translate-y-32 transition-transform duration-300";


            toast.innerHTML = `
                <span class="material-symbols-outlined">
                    check_circle
                </span>

                <div class="font-label-technical text-label-technical uppercase">
                    <b class="block">
                        PIEZA AÑADIDA CON ÉXITO
                    </b>

                    <span></span>
                </div>
            `;

            document.body.appendChild(toast);
        }


        const message =
            toast.querySelector("span:last-child");


        if (message) {

            message.textContent =
                `${productName} // BOLSA [${getCartCount()}]`;

        }


        toast.classList.remove("translate-y-32");


        clearTimeout(window.auraToast);


        window.auraToast =
            setTimeout(() => {

                toast.classList.add(
                    "translate-y-32"
                );

            }, 2500);
    }


    // ----------------------------------------------------------
    // OBTENER PRODUCTOS DESDE inicio.html
    // ----------------------------------------------------------

    function getProductsFromHTML() {

        return [
            ...document.querySelectorAll(".product-item")
        ].map((card, index) => {

            const text = card.textContent;


            // Buscar SKU
            const skuMatch =
                text.match(
                    /SKU:\s*([A-Z0-9-]+)/i
                );


            const sku =
                skuMatch
                    ? skuMatch[1]
                    : `PRODUCT-${index + 1}`;


            // Buscar precio
            const priceMatch =
                text.match(
                    /\$\s*([\d.]+)\s*COP/
                );


            const price =
                priceMatch
                    ? Number(
                        priceMatch[1]
                            .replace(/\./g, "")
                    )
                    : 0;


            // Buscar nombre
            const name =
                card.querySelector("h3")
                    ?.textContent
                    .trim()
                || "Producto";


            // Buscar imagen
            const image =
                card.querySelector("img")
                    ?.src
                || "";


            // Buscar descripción
            const description =
                card.querySelector("p")
                    ?.textContent
                    .trim()
                || "";


            return {

                id: sku,

                sku: sku,

                name: name,

                price: price,

                category:
                    card.dataset.category
                    || "all",

                image: image,

                description: description,

                quantity: 1

            };

        });
    }


    // ----------------------------------------------------------
    // AGREGAR PRODUCTO
    // ----------------------------------------------------------

    function addToCart(product) {

        const cart = readCart();


        const existing =
            cart.find(
                item =>
                    item.id === product.id
            );


        if (existing) {

            existing.quantity++;

        } else {

            cart.push(product);

        }


        saveCart(cart);


        // Iniciar/reiniciar reserva
        const expiration =
            Date.now() +
            RESERVATION_SECONDS * 1000;


        localStorage.setItem(
            RESERVATION_KEY,
            String(expiration)
        );


        showToast(product.name);
    }


    // ----------------------------------------------------------
    // BOTONES "AÑADIR A LA BOLSA"
    // ----------------------------------------------------------

    function setupProducts() {

        const cards =
            document.querySelectorAll(
                ".product-item"
            );


        cards.forEach(
            (card, index) => {

                const button =
                    card.querySelector(
                        ".add-to-bag-btn"
                    );


                if (!button) {
                    return;
                }


                button.addEventListener(
                    "click",
                    () => {

                        const products =
                            getProductsFromHTML();


                        const product =
                            products[index];


                        if (!product) {
                            return;
                        }


                        addToCart(product);


                        const originalText =
                            button.textContent;


                        button.textContent =
                            "AÑADIDO A LA BOLSA [ ✓ ]";


                        setTimeout(
                            () => {

                                button.textContent =
                                    originalText
                                    || "AÑADIR A LA BOLSA [ + ]";

                            },
                            1500
                        );

                    }
                );

            }
        );
    }


    // ----------------------------------------------------------
    // FILTROS DE PRODUCTOS
    // ----------------------------------------------------------

    function setupFilters() {

        const buttons =
            document.querySelectorAll(
                ".filter-btn"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const filter =
                            button.dataset.filter
                            || "all";


                        document
                            .querySelectorAll(
                                ".product-item"
                            )
                            .forEach(
                                product => {

                                    if (
                                        filter === "all"
                                        ||
                                        product.dataset.category
                                        === filter
                                    ) {

                                        product.style.display =
                                            "";

                                    } else {

                                        product.style.display =
                                            "none";

                                    }

                                }
                            );

                    }
                );

            }
        );
    }


    // ----------------------------------------------------------
    // BUSCADOR
    // ----------------------------------------------------------

    function setupSearch() {

        const search =
            document.querySelector(
                'input[placeholder="INDEX QUERY..."]'
            );


        if (!search) {
            return;
        }


        search.addEventListener(
            "input",
            () => {

                const query =
                    search.value
                        .toLowerCase()
                        .trim();


                document
                    .querySelectorAll(
                        ".product-item"
                    )
                    .forEach(
                        product => {

                            const text =
                                product.textContent
                                    .toLowerCase();


                            if (
                                !query
                                ||
                                text.includes(query)
                            ) {

                                product.style.display =
                                    "";

                            } else {

                                product.style.display =
                                    "none";

                            }

                        }
                    );

            }
        );
    }


    // ----------------------------------------------------------
    // ENLACE A LA BOLSA
    // ----------------------------------------------------------

    function setupBagLink() {

        document
            .querySelectorAll(
                'a[data-path="bag"]'
            )
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();


                            if (
                                !location.pathname
                                    .toLowerCase()
                                    .includes(
                                        "carrito.html"
                                    )
                            ) {

                                location.href =
                                    "carrito.html";

                            }

                        }
                    );

                }
            );
    }


    // ----------------------------------------------------------
    // CAMBIAR CANTIDAD
    // ----------------------------------------------------------

    function changeQuantity(
        productId,
        amount
    ) {

        const cart =
            readCart();


        const product =
            cart.find(
                item =>
                    item.id === productId
            );


        if (!product) {
            return;
        }


        product.quantity += amount;


        if (product.quantity <= 0) {

            const newCart =
                cart.filter(
                    item =>
                        item.id !== productId
                );


            saveCart(newCart);

        } else {

            saveCart(cart);

        }


        renderCart();
    }


    // ----------------------------------------------------------
    // ELIMINAR PRODUCTO
    // ----------------------------------------------------------

    function removeProduct(productId) {

        const cart =
            readCart();


        const newCart =
            cart.filter(
                item =>
                    item.id !== productId
            );


        saveCart(newCart);


        renderCart();
    }


    // ----------------------------------------------------------
    // MOSTRAR CARRITO
    // ----------------------------------------------------------

    function renderCart() {

        const cart =
            readCart();


        const articles =
            document.querySelectorAll(
                "main article"
            );


        articles.forEach(
            (article, index) => {

                const product =
                    cart[index];


                if (!product) {
                    return;
                }


                const buttons =
                    [
                        ...article.querySelectorAll(
                            "button"
                        )
                    ];


                // Botón -
                const minusButton =
                    buttons.find(
                        button =>
                            button.textContent
                                .trim()
                            === "-"
                    );


                // Botón +
                const plusButton =
                    buttons.find(
                        button =>
                            button.textContent
                                .trim()
                            === "+"
                    );


                // Botón eliminar
                const removeButton =
                    buttons.find(
                        button =>
                            button.textContent
                                .toUpperCase()
                                .includes(
                                    "REMOVER"
                                )
                    );


                // Cantidad
                const quantityElement =
                    [
                        ...article.querySelectorAll(
                            "span"
                        )
                    ].find(
                        span =>
                            /^\d{2}$/.test(
                                span.textContent.trim()
                            )
                    );


                if (quantityElement) {

                    quantityElement.textContent =
                        String(
                            product.quantity
                        ).padStart(2, "0");

                }


                // Evitar múltiples eventos
                if (minusButton) {

                    minusButton.onclick =
                        () =>
                            changeQuantity(
                                product.id,
                                -1
                            );

                }


                if (plusButton) {

                    plusButton.onclick =
                        () =>
                            changeQuantity(
                                product.id,
                                1
                            );

                }


                if (removeButton) {

                    removeButton.onclick =
                        () =>
                            removeProduct(
                                product.id
                            );

                }

            }
        );


        updateSummary();
    }


    // ----------------------------------------------------------
    // TOTAL DEL CARRITO
    // ----------------------------------------------------------

    function updateSummary() {

        const total =
            getCartTotal();


        const count =
            getCartCount();


        // Total
        document
            .querySelectorAll(
                "[data-cart-total], #cart-total, #subtotal, #total"
            )
            .forEach(
                element => {

                    element.textContent =
                        formatMoney(total);

                }
            );


        // Cantidad de productos
        document
            .querySelectorAll(
                "[data-cart-items], #cart-items"
            )
            .forEach(
                element => {

                    element.textContent =
                        count;

                }
            );
    }


    // ----------------------------------------------------------
    // SELECCIÓN DE COLOR
    // ----------------------------------------------------------

    function setupColors() {

        document
            .querySelectorAll(
                ".color-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const name =
                                button.dataset.color
                                ||
                                button.getAttribute(
                                    "aria-label"
                                )
                                ||
                                button.textContent
                                    .trim();


                            const selected =
                                document.getElementById(
                                    "selected-color-name"
                                );


                            if (selected) {

                                selected.textContent =
                                    name;

                            }


                            // Marcar botón seleccionado
                            document
                                .querySelectorAll(
                                    ".color-btn"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "ring-1",
                                            "ring-primary-fixed"
                                        );

                                    }
                                );


                            button.classList.add(
                                "ring-1",
                                "ring-primary-fixed"
                            );

                        }
                    );

                }
            );
    }


    // ----------------------------------------------------------
    // SELECCIÓN DE TALLA
    // ----------------------------------------------------------

    function setupSizes() {

        document
            .querySelectorAll(
                ".size-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelectorAll(
                                    ".size-btn"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "ring-1",
                                            "ring-primary-fixed"
                                        );

                                    }
                                );


                            button.classList.add(
                                "ring-1",
                                "ring-primary-fixed"
                            );

                        }
                    );

                }
            );
    }


    // ----------------------------------------------------------
    // CAMBIAR IMAGEN DEL PRODUCTO
    // ----------------------------------------------------------

    window.switchAngle =
        function(angle) {

            const image =
                document.getElementById(
                    "main-pdp-view"
                );


            if (!image) {
                return;
            }


            const newSource =
                image.dataset[angle];


            if (newSource) {

                image.src =
                    newSource;

            }

        };


    // ----------------------------------------------------------
    // CONTADOR DE RESERVA
    // ----------------------------------------------------------

    function updateCountdown() {

        const countdown =
            document.getElementById(
                "countdown"
            );


        if (!countdown) {
            return;
        }


        const expiration =
            Number(
                localStorage.getItem(
                    RESERVATION_KEY
                )
            ) || 0;


        if (!expiration) {

            return;
        }


        const remaining =
            Math.max(
                0,
                expiration - Date.now()
            );


        const seconds =
            Math.floor(
                remaining / 1000
            );


        const minutes =
            Math.floor(
                seconds / 60
            );


        const remainingSeconds =
            seconds % 60;


        countdown.textContent =
            `${String(minutes).padStart(2, "0")}:` +
            `${String(remainingSeconds).padStart(2, "0")}`;


        // Cuando llega a cero
        if (remaining <= 0) {

            localStorage.removeItem(
                RESERVATION_KEY
            );

            countdown.textContent =
                "00:00";
        }
    }


    // ----------------------------------------------------------
    // INICIALIZACIÓN
    // ----------------------------------------------------------

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            updateCartCounter();

            setupProducts();

            setupFilters();

            setupSearch();

            setupBagLink();

            setupColors();

            setupSizes();


            if (
                location.pathname
                    .toLowerCase()
                    .includes("carrito.html")
            ) {

                renderCart();

            }


            updateSummary();

            updateCountdown();


            setInterval(
                updateCountdown,
                1000
            );

        }
    );

})();