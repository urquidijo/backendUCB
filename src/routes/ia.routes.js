import { clasificarGrupoUsuario } from "../controllers/ia.controller.js";
import { Router } from "express";
const router = Router();
router.post("/clasificar-grupo", clasificarGrupoUsuario);

export default router;