import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.migration") });

const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: 5432,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    try {
        console.log(`🔍 Inspecting schemas in DB: ${process.env.PG_DATABASE}...`);
        const { rows: schemas } = await pool.query("SELECT schema_name FROM information_schema.schemata");
        console.log("Schemas found:", schemas.map(s => s.schema_name));

        const { rows: tables } = await pool.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    `);
        console.log("Total tables found:", tables.length);
        tables.forEach(t => console.log(`  - ${t.table_schema}.${t.table_name}`));

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await pool.end();
    }
}

run();
