import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizeScannerCode(code) {
  return String(code)
    .trim()
    .replace(/^httpsÑ--/i, 'https://')
    .replace(/^httpÑ--/i, 'http://')
    .replace(/-qr-/i, '/qr/');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const code = normalizeScannerCode(body.code);

    if (!code) {
      return NextResponse.json({ success: false, message: 'No se proporcionó un código' }, { status: 400 });
    }

    // Prepare statement to find the code
    const stmt = db.prepare('SELECT * FROM valid_codes WHERE code = ?');
    const result = stmt.get(code);

    if (result) {
      // Log the successful scan
      db.prepare('INSERT INTO scans_log (code_id) VALUES (?)').run(result.id);
      
      // Get total scans count
      const totalCount = db.prepare('SELECT COUNT(*) as total FROM scans_log').get();

      // Get individual count for this specific code
      const individualCount = db.prepare('SELECT COUNT(*) as total FROM scans_log WHERE code_id = ?').get(result.id);

      // Code is valid and found in DB
      return NextResponse.json({
        success: true,
        message: 'Código Válido',
        data: result.associated_data,
        total_scans: totalCount.total,
        individual_scans: individualCount.total
      });
    } else {
      // Code not found
      return NextResponse.json({
        success: false,
        message: 'Código Inválido o no registrado'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
