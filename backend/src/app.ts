import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import solicitudesRoutes from "./routes/solicitudes.routes";
import authRoutes from "./routes/auth.routes";

import {
    rutaNoEncontrada,
    manejarErrores,
} from "./middleware/error.middleware";

const origenesPermitidos = (process.env.CORS_ORIGINS ?? "http://localhost:5173" )
    .split(",")
    .map((o) => o.trim());

const app = express();

app.use(express.json());

//PRUEBA DE RENDER
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(
    cors({
        origin: origenesPermitidos,
        credentials: true,
    }),
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/admin/solicitudes", solicitudesRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);
export default app;