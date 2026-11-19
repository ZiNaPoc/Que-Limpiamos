import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";

export async function requireCliente(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            throw new AppError(401, "No has iniciado sesion");
        }

        const token = header.slice(7).trim();
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET no esta configurado");
        }

        let decoded: string | jwt.JwtPayload;

        try {
            decoded = jwt.verify(token, secret);
        } catch {
            throw new AppError(401, "Sesion invalida o expirada");
        }

        if (
            typeof decoded === "string" ||
            !decoded.sub ||
            decoded.rol !== "CLIENTE"
        ) {
            throw new AppError(401, "Sesion invalida");
        }

        const id = Number(decoded.sub);

        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new AppError(401, "Sesion invalida");
        }

        const usuario = await prisma.usuarios.findUnique({ where: { id } });

        if (!usuario || usuario.rol !== "CLIENTE") {
            throw new AppError(401, "La sesion ya no es valida");
        }

        if (usuario.estado_cuenta !== "ACTIVA") {
            throw new AppError(403, "La cuenta esta suspendida");
        }

        res.locals.cliente = usuario;
        next();
    } catch (error) {
        next(error);
    }
}