import type { Request } from "express";

type ArchivoSubido = {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
};

declare global {
    namespace Express {
        interface Request {
            files?: {
                [campo: string]: ArchivoSubido[];
            };
        }
    }
}

export {};