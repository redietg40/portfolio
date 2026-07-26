// scripts/02-add-contact-table.ts

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

async function addContactTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Adding Contact table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Contact" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "subject" VARCHAR(255),
        "message" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "isRead" BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("Contact table created successfully!");
  } catch (error) {
    console.error("Error creating Contact table:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addContactTable();