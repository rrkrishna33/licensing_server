import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const migrationsDir = path.join(__dirname, "../../migrations");
  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const fileName of files) {
    const fullPath = path.join(migrationsDir, fileName);
    const sql = await readFile(fullPath, "utf-8");
    await pool.query(sql);
    console.log(`Applied migration: ${fileName}`);
  }

  await pool.end();
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
