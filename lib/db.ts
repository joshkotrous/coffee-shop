import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    if (text.includes(";") && text.split(";").length > 2) {
      const statements = text.split(";").filter((stmt) => stmt.trim());
      let result;
      for (const statement of statements) {
        if (statement.trim()) {
          result = await client.query(statement.trim(), params);
        }
      }
      return result;
    } else {
      const result = await client.query(text, params);
      return result;
    }
  } finally {
    client.release();
  }
}

export default pool;
