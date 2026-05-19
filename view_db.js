const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

console.log("\n--- TABLA: valid_codes (Códigos Registrados) ---");
const codes = db.prepare('SELECT id, code, associated_data FROM valid_codes LIMIT 10').all();
console.table(codes);

console.log("\n--- TABLA: scans_log (Últimos 10 ingresos) ---");
const scans = db.prepare(`
    SELECT sl.id, vc.associated_data, sl.scanned_at 
    FROM scans_log sl 
    JOIN valid_codes vc ON sl.code_id = vc.id 
    ORDER BY sl.scanned_at DESC 
    LIMIT 10
`).all();
console.table(scans);

db.close();
