import { Router } from "express";
import {
    getAllRespuestas,
    getRespuestasByUsuario,
    createRespuestas,
    updateRespuestas,
    deleteRespuestas,
} from "../controllers/usuarios_respuestas.controller.js";

const router = Router();
router.get("/respuestas", getAllRespuestas);
router.get("/respuestas/:usuarioId", getRespuestasByUsuario);

router.post("/respuestas", createRespuestas);

router.put("/respuestas/:usuario_id", updateRespuestas);

router.delete("/respuestas/:usuario_id", deleteRespuestas);

export default router;
