import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";

import {
    rutaNoEncontrada,
    manejarErrores,
} from "./middleware/error.middleware";

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }),
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

app.get("/health", (_req, res) => res.json({ ok: true }));

export default app;