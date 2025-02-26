import sqlite, { executeQuery, setdbPath, fetchOne } from "sqlite-electron";
import { hashPassword } from "./password_helpers";

export async function initializeDatabase() {
  try {
    const dbPath = "./database.db";
    const isUri = false;
    await setdbPath(dbPath, isUri);
    initializeBatchesTable();
    initializeUsersTable();
    initializeProductsTable();
    initializeLabelsTable();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database", error);
  }
}

async function initializeUsersTable() {
  const sql = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
  await executeQuery(sql);

  const hashedPassword = await hashPassword("admin");  // Hash password
  const insertAdminSql = `
      INSERT INTO users (username, password) VALUES ('admin', ?);
    `;
  await executeQuery(insertAdminSql, [hashedPassword]);  // Use parameterized query to prevent SQL injection
}

async function initializeBatchesTable() {
  const sql = `
        CREATE TABLE IF NOT EXISTS batches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          batch_no TEXT NOT NULL,
          product_id TEXT NOT NULL,
          timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
  await executeQuery(sql);
}

async function initializeProductsTable() {
  const sql = `
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          brand TEXT NOT NULL,
          model TEXT NOT NULL,
          type TEXT NOT NULL,
          rating TEXT NOT NULL,
          size TEXT NOT NULL,
          timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
  await executeQuery(sql);
}

async function initializeLabelsTable() {
  const sql = `
        CREATE TABLE IF NOT EXISTS labels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          serial TEXT NOT NULL,
          qr TEXT NOT NULL,
          status TEXT NOT NULL,
          batch_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
  await executeQuery(sql);
}