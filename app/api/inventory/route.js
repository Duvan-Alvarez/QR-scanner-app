import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE vc.code LIKE ? OR vc.associated_data LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }

    // Obtener el total filtrado
    const totalQuery = `
      SELECT COUNT(*) as total 
      FROM scans_log sl
      JOIN valid_codes vc ON sl.code_id = vc.id
      ${whereClause}
    `;
    const totalResult = db.prepare(totalQuery).get(...params);
    const total = totalResult ? totalResult.total : 0;

    // Fetch logs with associated code data, search and pagination
    const query = `
      SELECT 
        sl.id, 
        vc.code, 
        vc.associated_data, 
        sl.scanned_at 
      FROM scans_log sl
      JOIN valid_codes vc ON sl.code_id = vc.id
      ${whereClause}
      ORDER BY sl.scanned_at DESC
      LIMIT ? OFFSET ?
    `;
    const logs = db.prepare(query).all(...params, limit, offset);

    return NextResponse.json({ 
      success: true, 
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ success: false, message: 'Error al obtener el historial' }, { status: 500 });
  }
}
