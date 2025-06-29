import { pool } from "../db.js";

// GET /productos
export const getProductos = async (req, res) => {
  try {
    // Puedes agregar filtros por nombre si lo deseas como en users
    const { nombre } = req.query;

    let query = `SELECT id, nombre, descripcion, imagen_url, precio,precio_descuento FROM producto`;
    const params = [];
    if (nombre) {
      query += ` WHERE nombre ILIKE $1`;
      params.push(`%${nombre}%`);
    }
    query += ` ORDER BY nombre ASC`;

    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron productos" });
    }
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// GET /productos/:id
export const getProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT id, nombre, descripcion, imagen_url FROM producto WHERE id = $1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener producto por id:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
