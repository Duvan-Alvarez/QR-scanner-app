const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Create the valid_codes table
db.exec(`
  CREATE TABLE IF NOT EXISTS valid_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    associated_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some dummy data for testing
const stmt = db.prepare('INSERT OR IGNORE INTO valid_codes (code, associated_data) VALUES (?, ?)');

const testCodes = [
  { code: 'VIP-2024-ABC', data: 'Acceso VIP - Juan Perez' },
  { code: 'TICKET-9876', data: 'Entrada General - Maria Lopez' },
  { code: 'EMP-001', data: 'Empleado - Carlos Garcia' },
  { code: 'https://example.com/qr/1', data: 'URL Demo' }
];

const insertMany = db.transaction((codes) => {
  for (const item of codes) {
    stmt.run(item.code, item.data);
  }
});

insertMany(testCodes);

console.log('Database seeded successfully with dummy QR codes.');
db.close();
// Create a scanner-only account for non-admin scanning
const existingScanner = db.prepare('SELECT * FROM users WHERE username = ?').get('scanner');
if (!existingScanner) {
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('scanner', 'scanner123', 'scanner');
}
