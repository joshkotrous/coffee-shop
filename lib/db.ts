import { Pool, QueryResult } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    if (text.includes(";") && text.split(";").length > 2) {
      const statements = text.split(";").filter((stmt) => stmt.trim());
      let result: QueryResult | undefined;
      for (const statement of statements) {
        if (statement.trim()) {
          result = await client.query(statement.trim(), params);
        }
      }
      if (result) {
        return result;
      }
      // Return a minimal valid QueryResult if no result was produced
      return await client.query("SELECT NULL WHERE FALSE");
    } else {
      const result = await client.query(text, params);
      return result;
    }
  } finally {
    client.release();
  }
}

export default pool;
