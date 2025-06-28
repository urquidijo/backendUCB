export const clasificarGrupoUsuario = async (req, res) => {
  const {
    usuario_id,
    frescos,
    rapida,
    saludable,
    vegano,
    dulce,
    promo,
    innovador,
    tradicional,
    precio,
    ambiental
  } = req.body;

  try {
    // Lógica simple de agrupamiento (puedes reemplazar con IA real luego)
    let grupo = "";

    if (tradicional >= 8 && dulce >= 6) {
      grupo = "Tradicionalista Dulce";
    } else if (saludable >= 7 && vegano >= 4) {
      grupo = "Saludable Vegano";
    } else if (promo >= 6 || precio <= 3) {
      grupo = "Cazador de Ofertas";
    } else if (innovador >= 6) {
      grupo = "Innovador Curioso";
    } else if (rapida >= 7) {
      grupo = "Amante de la Comida Rápida";
    } else if (frescos >= 7) {
      grupo = "Frescura Natural";
    } else {
      grupo = "General";
    }

    // (Opcional) Guardar en base de datos si lo deseas
    // await pool.query("UPDATE usuario SET grupo = $1 WHERE id = $2", [grupo, usuario_id]);

    res.json({ grupo });
  } catch (error) {
    console.error("Error al clasificar grupo:", error);
    res.status(500).json({ message: "Error al clasificar grupo" });
  }
};
