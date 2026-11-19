import multer from "multer";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB por imagen

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES, files: 2 },
}).fields([
    { name: "ine_frente", maxCount: 1 },
    { name: "ine_reverso", maxCount: 1 },
]);

export function subirIne(req: Request, res: Response, next: NextFunction) {
    upload(req, res, (error: unknown) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError) {
            const mensaje =
                error.code === "LIMIT_FILE_SIZE"
                    ? "Cada imagen de la INE debe pesar maximo 5 MB"
                    : "Archivos de la INE invalidos";
            return next(new AppError(400, mensaje));
        }

        next(error);
    });
}