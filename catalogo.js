
document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  try {
    if (!window.auraSupabase) {
      throw new Error("Configura supabase-config.js.");
    }

    const { data, error } = await window.auraSupabase
      .from("productos")
      .select("id_producto,nombre,descripcion,precio,stock,categorias(nombre),imagen")
      .order("id_producto", { ascending: true });

    if (error) throw error;

    productGrid.innerHTML = "";

    (data || []).forEach((p) => {
      const card = document.createElement("article");
      card.className = "product-item";

      // Imagen del producto
      const imagen = document.createElement("img");
      imagen.src = (p.imagen || "").trim();
      imagen.alt = p.nombre || "Producto AURA // NØIR";
      imagen.loading = "lazy";
      imagen.style.width = "100%";
      imagen.style.height = "320px";
      imagen.style.objectFit = "cover";
      imagen.style.display = "block";

      imagen.onerror = () => {
        console.error(
          "No se pudo cargar la imagen:",
          p.nombre,
          p.imagen
        );
        imagen.alt = "Imagen no disponible: " + (p.nombre || "producto");
      };

      imagen.onload = () => {
        console.log("Imagen cargada:", p.nombre);
      };

      // Información del producto
      const info = document.createElement("div");
      info.className = "product-info";

      const title = document.createElement("h3");
      title.textContent = p.nombre || "Producto";

      const desc = document.createElement("p");
      desc.textContent = p.descripcion || "";

      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent =
        `$${Number(p.precio).toLocaleString("es-CO")} COP`;

      const stock = document.createElement("p");
      stock.textContent = `Stock: ${p.stock}`;

      const details = document.createElement("a");
      details.href = `modelo.html?id=${encodeURIComponent(p.id_producto)}`;
      details.textContent = "VER PRODUCTO";

      info.append(title, desc, price, stock, details);

      // Añadir imagen e información a la tarjeta
      card.append(imagen, info);
      productGrid.appendChild(card);
    });

  } catch (e) {
    console.error("Error cargando productos desde Supabase:", e);
    productGrid.textContent =
      "No se pudieron cargar los productos. Revisa la conexión con Supabase.";
  }
});
