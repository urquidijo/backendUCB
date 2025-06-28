import { Router } from "express";
import {
  getRestaurantes,
  getRestaurante,
  createRestaurante,
  updateRestaurante,
  deleteRestaurante
} from "../controllers/restaurante.controller.js";

const router = Router();

router.get("/restaurantes", getRestaurantes);
router.get("/restaurantes/:id", getRestaurante);
router.post("/restaurantes", createRestaurante);
router.put("/restaurantes/:id", updateRestaurante);
router.delete("/restaurantes/:id", deleteRestaurante);

export default router;
