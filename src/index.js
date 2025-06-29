import express from "express";
import { PORT } from "./config.js";
import userRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import productosRoutes from "./routes/productos.routes.js";
import { FRONTEND_URL } from "./config.js";
import usuariosRespuestasRoutes from "./routes/usuarios_respuestas.routes.js";
import restauranteRoutes from "./routes/restaurante.routes.js";
import iaRoutes from "./routes/ia.routes.js";

const allowedOrigins = [FRONTEND_URL, "http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

const app = express();

const __filename = fileURLToPath(import.meta.url);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", true);

app.use("/api/uploads", express.static(path.resolve("uploads")));
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", authRoutes);

app.use("/api", usuariosRespuestasRoutes);
app.use("/api", iaRoutes);
app.use("/api/productos", productosRoutes);

app.use("/api", restauranteRoutes);

app.listen(PORT);
console.log("server on port ", PORT);
