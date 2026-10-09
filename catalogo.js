// Este archivo también utiliza Supabase; no requiere Flask ni localhost.
document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;
  try {
    if (!window.auraSupabase) throw new Error("Configura supabase-config.js.");
    const { data, error } = await window.auraSupabase
      .from("productos")
      .select("id_producto,nombre,descripcion,precio,stock,categorias(nombre)")
      .order("id_producto", { ascending: true });
    if (error) throw error;
    productGrid.innerHTML = "";
    (data || []).forEach(p => {
      const card = document.createElement("article");
      card.className = "product-item";
      const info = document.createElement("div");
      info.className = "product-info";
      const title = document.createElement("h3"); title.textContent = p.nombre;
      const desc = document.createElement("p"); desc.textContent = p.descripcion || "";
      const price = document.createElement("p"); price.className = "product-price";
      price.textContent = `$${Number(p.precio).toLocaleString("es-CO")} COP`;
      const stock = document.createElement("p"); stock.textContent = `Stock: ${p.stock}`;
      info.append(title, desc, price, stock);
      const details = document.createElement("a"); details.href = `modelo.html?id=${p.id_producto}`; details.textContent = "VER PRODUCTO";
      info.append(details); card.append(info); productGrid.append(card);
    });
  } catch (e) {
    console.error("Error cargando productos desde Supabase:", e);
    productGrid.textContent = "No se pudieron cargar los productos. Revisa supabase-config.js y las políticas RLS.";
  }
});
