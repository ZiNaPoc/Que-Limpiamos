import path from "path";

export const UPLOADS_DIR = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(process.cwd(), "uploads");

export const INE_DIR = path.join(UPLOADS_DIR, "ine");