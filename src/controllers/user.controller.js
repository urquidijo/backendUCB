import { pool } from "../db.js";
import bcryptjs from "bcryptjs";
import { validationResult } from "express-validator";

export const getUsers = async (req, res) => {
  try {
    const { nombre, ci, rol, sexo } = req.query;

    let query = `
      SELECT u.*
      FROM usuario u
    `;

    const params = [];
    let index = 1;

    if (nombre) {
      query += ` AND u.nombre ILIKE $${index++}`;
      params.push(`%${nombre}%`);
    }
    if (ci) {
      query += ` AND u.ci = $${index++}`;
      params.push(ci);
    }
    if (rol) {
      query += ` AND r.nombre = $${index++}`;
      params.push(rol);
    }
    if (sexo) {
      query += ` AND u.sexo = $${index++}`;
      params.push(sexo);
    }

    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "users not found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginProcess = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Consultar usuario real
    const { rows } = await pool.query(
      `SELECT u.* FROM usuario u WHERE u.correo = $1`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        errors: [{ path: "correo", msg: "Correo no registrado" }],
      });
    }

    const userToLogin = rows[0];
    const isOkThePassword = await bcryptjs.compare(
      password,
      userToLogin.contraseña
    );

    if (isOkThePassword) {
      delete userToLogin.contraseña;
      return res.status(200).json({
        token: "simple-token-for-demo",
        usuario: {
          id: userToLogin.id,
          usuario: userToLogin.usuario,
        },
        message: "Inicio de sesión exitoso",
      });
    }

    return res.status(400).json({
      errors: [{ path: "password", msg: "Contraseña incorrecta" }],
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM usuario WHERE correo = $1", [
    id,
  ]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "user not found" });
  }
  res.json(rows[0]);
};

export const createUser = async (req, res) => {
  try {
    const data = req.body;

    // Validación de campos obligatorios
    const requiredFields = ["correo", "usuario", "password"];
    for (let field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          errors: [
            {
              path: field,
              msg: `${field} es requerido`,
            },
          ],
        });
      }
    }

    // Hashear contraseña
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Insertar usuario
    const insertQuery = `
        INSERT INTO usuario 
        (correo, usuario, contraseña)
        VALUES ($1, $2, $3)
      `;
    const values = [data.correo, data.usuario, hashedPassword];

    const { rows } = await pool.query(insertQuery, values);

    return res.status(201).json({
      meta: { status: 201 },
      message: "Usuario creado con éxito",
      user: rows[0],
    });
  } catch (error) {
    if (error?.code === "23505") {
      const detail = error.detail || "";

      const errors = [];

      if (detail.includes("(correo)")) {
        errors.push({
          path: "correo",
          msg: "correo ya registrado",
        });
      }
      return res.status(400).json({ errors });
    }

    console.error("Error en createUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = userRes.rows[0].id;

    // Borrar de permiso_usuario
    const { rowCount } = await pool.query("DELETE FROM usuario WHERE id = $1", [
      id,
    ]);

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado con ese id" });
    }

    return res.status(204).send(); // Eliminado con éxito, sin contenido
  } catch (error) {
    console.error("Error al eliminar usuario por id:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const asignarRolYPermisos = async (req, res) => {
  const { id } = req.params; // id del usuario
  const { rol_id, permisos_ids } = req.body;

  try {
    await pool.query("BEGIN");

    // Actualizar el rol del usuario
    await pool.query("UPDATE usuario SET id_rol = $1 WHERE id = $2", [
      rol_id,
      id,
    ]);

    // Eliminar permisos anteriores del rol (opcional si deseas control manual)
    await pool.query("DELETE FROM permiso_rol WHERE id_rol = $1", [rol_id]);

    // Insertar nuevos permisos
    for (const permiso_id of permisos_ids) {
      await pool.query(
        "INSERT INTO permiso_rol (id_rol, id_permiso) VALUES ($1, $2)",
        [rol_id, permiso_id]
      );
    }

    await pool.query("COMMIT");
    res.json({ message: "Rol y permisos asignados correctamente" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error al asignar rol y permisos" });
  } finally {
    pool.release();
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const { rows } = await pool.query(
      `
      UPDATE usuario 
      SET 
        nombre = $1,
        correo = $2,
        telefono = $3,
        sexo = $4,
        domicilio = $5
      WHERE id = $6
      RETURNING id, ci, nombre, correo, telefono, sexo, domicilio, id_sucursal, id_rol
      `,
      [data.nombre, data.correo, data.telefono, data.sexo, data.domicilio, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
