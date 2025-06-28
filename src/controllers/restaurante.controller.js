import { pool } from "../db.js";
import { validationResult } from "express-validator";

// GET /restaurantes?categoria=Pastas
export const getRestaurantes = async (req, res) => {
  try {
    const { categoria } = req.query;
    let query = `
      SELECT 
        r.*, 
        z.nombre as zona_nombre,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT cc.nombre), NULL) AS categorias
      FROM restaurante r
      LEFT JOIN zona z ON r.zona_id = z.id
      LEFT JOIN lote_sobrante ls ON ls.restaurante_id = r.id
      LEFT JOIN categoria_comida cc ON ls.categoria_id = cc.id
      WHERE 1=1
    `;
    const params = [];
    if (categoria && categoria !== 'Todos') {
      params.push(categoria);
      query += ` AND cc.nombre = $${params.length}`;
    }
    query += `
      GROUP BY r.id, z.nombre
      ORDER BY r.nombre
    `;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener restaurantes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRestaurante = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT r.*, z.nombre as zona_nombre FROM restaurante r LEFT JOIN zona z ON r.zona_id = z.id WHERE r.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Restaurante no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener restaurante:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createRestaurante = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { nombre, descripcion, zona_id, direccion, latitud, longitud, telefono, activo } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO restaurante (nombre, descripcion, zona_id, direccion, latitud, longitud, telefono, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nombre, descripcion, zona_id, direccion, latitud, longitud, telefono, activo]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear restaurante:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRestaurante = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, zona_id, direccion, latitud, longitud, telefono, activo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE restaurante SET nombre=$1, descripcion=$2, zona_id=$3, direccion=$4, latitud=$5, longitud=$6, telefono=$7, activo=$8 WHERE id=$9 RETURNING *`,
      [nombre, descripcion, zona_id, direccion, latitud, longitud, telefono, activo, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Restaurante no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar restaurante:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRestaurante = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM restaurante WHERE id = $1`,
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Restaurante no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar restaurante:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
