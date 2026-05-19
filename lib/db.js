import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Determinar la ruta de la base de datos (configurable vía env)
// Use `DATABASE_PATH` environment variable in production (e.g. /app/data/database.sqlite)
let dbPath = process.env.DATABASE_PATH || null;

if (!dbPath) {
  try {
    // Si estamos en Electron, usamos la carpeta de datos de usuario.
    // Usamos eval para evitar que Webpack intente resolver electron en tiempo de compilación.
    const electron = eval("require('electron')");
    const userDataPath = electron.app.getPath('userData');
    dbPath = path.join(userDataPath, 'database.sqlite');
  } catch (e) {
    // Si no estamos en Electron (ej: build de Next.js), usamos la carpeta actual.
    dbPath = path.join(process.cwd(), 'database.sqlite');
  }
}

// Asegurarse de que el directorio existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize the database connection
const db = new Database(dbPath);

// Create the valid_codes table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS valid_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    associated_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scans_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES valid_codes(id)
  );
`);

const defaultAdminUser = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const defaultScannerUser = process.env.DEFAULT_SCANNER_USERNAME || 'scanner';
const defaultScannerPassword = process.env.DEFAULT_SCANNER_PASSWORD || 'scanner123';

// Create default users if they do not exist.
// In production, set these values with environment variables.
const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get(defaultAdminUser);
if (!existingAdmin) {
  db.prepare('INSERT INTO users (username, password, role, active) VALUES (?, ?, ?, ?)').run(defaultAdminUser, defaultAdminPassword, 'admin', 1);
}

const existingScanner = db.prepare('SELECT * FROM users WHERE username = ?').get(defaultScannerUser);
if (!existingScanner) {
  db.prepare('INSERT INTO users (username, password, role, active) VALUES (?, ?, ?, ?)').run(defaultScannerUser, defaultScannerPassword, 'scanner', 1);
}

const userColumns = db.prepare("PRAGMA table_info(users)").all();
if (!userColumns.some((column) => column.name === 'active')) {
  db.prepare('ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1').run();
}

export default db;
