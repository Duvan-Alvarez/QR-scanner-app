import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET codes with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const totalCount = db.prepare('SELECT COUNT(*) as total FROM valid_codes').get().total;

    const query = `
      SELECT 
        vc.*, 
        (SELECT COUNT(*) FROM scans_log WHERE code_id = vc.id) as scan_count,
        (SELECT MAX(scanned_at) FROM scans_log WHERE code_id = vc.id) as last_scan
      FROM valid_codes vc
      ORDER BY vc.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const codes = db.prepare(query).all(limit, offset);
    
    return NextResponse.json({ 
      success: true, 
      codes,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching codes:', error);
    return NextResponse.json({ success: false, message: 'Error al obtener códigos' }, { status: 500 });
  }
}

// POST a new code
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, associated_data } = body;

    if (!code || !associated_data) {
      return NextResponse.json({ success: false, message: 'Código y datos asociados son requeridos' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO valid_codes (code, associated_data) VALUES (?, ?)');
    stmt.run(code, associated_data);

    return NextResponse.json({ success: true, message: 'Código agregado correctamente' });
  } catch (error) {
    console.error('Error adding code:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return NextResponse.json({ success: false, message: 'El código ya existe' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Error al agregar código' }, { status: 500 });
  }
}

// DELETE a code
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID no proporcionado' }, { status: 400 });
    }

    // First, delete associated scans
    const deleteScans = db.prepare('DELETE FROM scans_log WHERE code_id = ?');
    deleteScans.run(id);

    // Then, delete the code
    const deleteCode = db.prepare('DELETE FROM valid_codes WHERE id = ?');
    const result = deleteCode.run(id);

    if (result.changes > 0) {
      return NextResponse.json({ success: true, message: 'Código y su historial eliminados correctamente' });
    } else {
      return NextResponse.json({ success: false, message: 'Código no encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting code:', error);
    return NextResponse.json({ success: false, message: 'Error al eliminar código' }, { status: 500 });
  }
}
