import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getScannerCodeCandidates(code) {
  const rawCode = String(code || '').trim();
  const normalizedCode = rawCode
    .replace(/^https[^-]*--/i, 'https://')
    .replace(/^http[^-]*--/i, 'http://')
    .replace(/-qr-/i, '/qr/');

  return [...new Set([rawCode, normalizedCode])];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const codeCandidates = getScannerCodeCandidates(body.code);

    if (!codeCandidates[0]) {
      return NextResponse.json({ success: false, message: 'No se proporciono un codigo' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT * FROM valid_codes WHERE code IN (?, ?)');
    const result = stmt.get(codeCandidates[0], codeCandidates[1] || codeCandidates[0]);

    if (result) {
      if (result.active === 0) {
        return NextResponse.json({
          success: false,
          message: 'Codigo inactivo',
        }, { status: 403 });
      }

      db.prepare('INSERT INTO scans_log (code_id) VALUES (?)').run(result.id);

      const totalCount = db.prepare('SELECT COUNT(*) as total FROM scans_log').get();
      const individualCount = db.prepare('SELECT COUNT(*) as total FROM scans_log WHERE code_id = ?').get(result.id);

      return NextResponse.json({
        success: true,
        message: 'Codigo Valido',
        data: result.associated_data,
        total_scans: totalCount.total,
        individual_scans: individualCount.total,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Codigo Invalido o no registrado',
    }, { status: 404 });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
