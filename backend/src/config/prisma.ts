import "dotenv/config";
import {PrismaMariaDb} from "@prisma/adapter-mariadb";
import {PrismaClient} from "../../generated/prisma/client";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Falta la variable ${name}`);
    return value;
}

const adapter = new PrismaMariaDb({
    host: requireEnv("DATABASE_HOST"),
    port: Number(process.env.DATABASE_PORT ?? 4000),
    user: requireEnv("DATABASE_USER"),
    password: requireEnv("DATABASE_PASSWORD"),
    database: requireEnv("DATABASE_NAME"),
    connectionLimit: 5,
    connectTimeout: 10_000,
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true},
});

export const prisma = new PrismaClient({
    adapter,
})