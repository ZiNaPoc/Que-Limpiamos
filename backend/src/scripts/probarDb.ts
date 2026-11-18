import "dotenv/config";
import mariadb from "mariadb";

async function main() {
  try {
    const conn = await mariadb.createConnection({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 4000),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectTimeout: 10_000,
      ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    });

    console.log(await conn.query("SELECT 1 AS ok"));
    await conn.end();
  } catch (error) {
    console.log("No conecto: ", error);
  }
}

main();
