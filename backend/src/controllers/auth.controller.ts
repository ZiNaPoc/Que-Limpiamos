import {NextFunction, Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import {prisma} from "../config/prisma";
import { AppError } from "../errors/AppError";

export async function loginAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {
        const correo =
            typeof req.body?.correo === "string"
            ? req.body.correo.trim().toLowerCase()
            : "";

        const password =
            typeof req.body?.password === "string"
            ? req.body.password
            : "";

        if(!correo) {
            throw new AppError(400, "Hace falta el correo electronico");
        }

        if(!password) {
            throw new AppError(400, "Hace falta la contraseña");
        }

        const usuario = await prisma.usuarios.findUnique({
            where: {correo}
        });

        if(!usuario) {
            throw new AppError(401, "Credenciales invalidas");
        }

        const passwordValida = await bcrypt.compare(
            password,
            usuario.password_hash
        );

        if(!passwordValida) {
            throw new AppError(401, "Credenciales invalidas");
        }

        if(usuario.rol !== 'ADMIN') {
            throw new AppError(403, "No tienes permisos de administrador");
        }

        if(usuario.estado_cuenta !== 'ACTIVA') {
            throw new AppError(403, "La cuenta esta suspendida");
        }

        const secret = process.env.JWT_SECRET;
        const expiresInEnv = (process.env.JWT_EXPIRES_IN) as SignOptions["expiresIn"];

        if(!secret) {
            throw new Error("JWT no esta configurado");
        }

        const token = jwt.sign(
            {rol: usuario.rol},
            secret,
            {
                subject: String(usuario.id),
                expiresIn: expiresInEnv,
            }
        );

        //COOKIES
        res.cookie("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
            path: "/"
        });

        return res.status(200).json({
            mensaje: "Inicio de sesion exitoso",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        next(error);
    }
}

export function logoutAdmin( _req: Request, res: Response) {
    res.clearCookie("admin_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    return res.status(200).json({
        mensaje: "Sesion cerrada correctamente",
    });
}