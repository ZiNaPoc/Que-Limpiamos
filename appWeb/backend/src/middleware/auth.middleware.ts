import type {NextFunction, Request, Response}  from "express";
import jwt from "jsonwebtoken";

import {prisma} from "../config/prisma";
import { AppError } from "../errors/AppError";

export async function requireAdmin(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    try { 
        const token = req.cookies?.admin_token;

        if(!token) {
            throw new AppError(401, 'No has iniciado sesion');
        }
        
        const secret = process.env.JWT_SECRET;

        if(!secret) {
            throw new Error("JWT_SECRET no esta cofigurado");
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
            decoded.rol !== 'ADMIN'
        ) {
            throw new AppError(401, 'No tienes permisos de administrador');
        }

        const id = Number(decoded.sub);

        if(!Number.isSafeInteger(id) || id <= 0) {
            throw new AppError(401, "Sesion invalida");
        }

        const usuario = await prisma.usuarios.findUnique({
            where: {id},
        });

        if(!usuario) {
            throw new AppError(401, "La sesion ya no es validad");
        }

        if (
            usuario.rol !== 'ADMIN' ||
            usuario.estado_cuenta !== 'ACTIVA'
        ) { 
            throw new AppError(403, 'No tienes autorizacion');
        }

        next();
    } catch(error) {
        next (error);
    }
}