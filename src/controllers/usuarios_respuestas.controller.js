import { pool } from "../db.js"; // ⬅️  named import, igual que en el controlador de usuarios
import { validationResult } from "express-validator";

function mapPreferencias(body) {
  const campos = [
    "frescos",
    "rapida",
    "saludable",
    "vegano",
    "dulce",
    "promo",
    "innovador",
    "tradicional",
    "precio",
    "ambiental",
  ];
  const prefs = {};
  for (const c of campos) {
    if (body[c] !== undefined) prefs[c] = Number(body[c]);
  }
  return prefs;
}

export const getAllRespuestas = async (req, res) => {
  try {
    const { usuario_id } = req.query;
    let consulta = "SELECT * FROM usuarios_respuestas";
    const params = [];

    if (usuario_id) {
      consulta += " WHERE usuario_id = $1";
      params.push(usuario_id);
    }

    const { rows } = await pool.query(consulta, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener respuestas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRespuestasByUsuario = async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT usuario_id,frescos,rapida,saludable,vegano,dulce,promo,innovador,tradicional,precio,ambiental FROM usuarios_respuestas WHERE usuario_id = $1",
      [usuario_id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay respuestas para este usuario" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener respuestas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/respuestas
 */
export const createRespuestas = async (req, res) => {
  // 1. Validaciones de express-validator (si las tienes definidas en el router)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Campos obligatorios
  const required = ["usuario_id", "frescos", "rapida", "saludable"];
  for (const f of required) {
    if (req.body[f] === undefined) {
      return res.status(400).json({
        errors: [{ path: f, msg: `${f} es requerido` }],
      });
    }
  }

  try {
    const prefs = mapPreferencias(req.body);

    // Dinámico -> para no escribir 10 columnas a mano
    const cols = Object.keys(prefs);
    const values = Object.values(prefs);
    const placeholders = cols.map((_, i) => `$${i + 2}`); // +2 por usuario_id primero

    const query = `
      INSERT INTO usuarios_respuestas (usuario_id, ${cols.join(", ")})
      VALUES ($1, ${placeholders.join(", ")})
      RETURNING *
    `;

    const { rows } = await pool.query(query, [req.body.usuario_id, ...values]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error?.code === "23505") {
      // violación de UNIQUE (usuario_id)
      return res.status(400).json({
        errors: [
          { path: "usuario_id", msg: "Ya existe registro para este usuario" },
        ],
      });
    }
    console.error("Error al crear respuestas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/respuestas/:usuario_id
 */
export const updateRespuestas = async (req, res) => {
  const { usuario_id } = req.params;

  // Nada que actualizar ➜ 400
  const prefs = mapPreferencias(req.body);
  if (Object.keys(prefs).length === 0) {
    return res.status(400).json({ message: "Sin campos para actualizar" });
  }

  // Construcción dinámica del SET
  const sets = Object.keys(prefs).map(
    (col, i) => `${col} = $${i + 2}` // +2 porque $1 es usuario_id en WHERE
  );
  const values = Object.values(prefs);

  try {
    const { rows } = await pool.query(
      `
      UPDATE usuarios_respuestas
      SET ${sets.join(", ")}
      WHERE usuario_id = $1
      RETURNING *
    `,
      [usuario_id, ...values]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay registro para actualizar" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar respuestas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/respuestas/:usuario_id
 */
export const deleteRespuestas = async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM usuarios_respuestas WHERE usuario_id = $1",
      [usuario_id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "No hay registro para eliminar" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar respuestas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
