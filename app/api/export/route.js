import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // 1. Obtener Totales Generales
    const totalCodes = db.prepare('SELECT COUNT(*) as count FROM valid_codes').get().count;
    const totalScans = db.prepare('SELECT COUNT(*) as count FROM scans_log').get().count;

    // 2. Obtener Detalles
    const rows = db.prepare(`
      SELECT 
        associated_data as nombre,
        code as qr,
        (SELECT COUNT(*) FROM scans_log WHERE code_id = valid_codes.id) as total,
        (SELECT MAX(scanned_at) FROM scans_log WHERE code_id = valid_codes.id) as fecha
      FROM valid_codes
      ORDER BY total DESC
    `).all();

    const now = new Date().toLocaleString('es-ES');

    // 3. Diseño con Totales muy visibles
    let csv = "**************************************************\r\n";
    csv += "       RESUMEN GENERAL DE INGRESOS (TOTAL)        \r\n";
    csv += "**************************************************\r\n\r\n";
    
    csv += `TOTAL GLOBAL DE INGRESOS PROCESADOS:;>>> ${totalScans} <<<\r\n`;
    csv += `Total de Usuarios en el Sistema:;${totalCodes}\r\n`;
    csv += `Fecha del Reporte:;${now}\r\n\r\n`;

    csv += "==================================================\r\n";
    csv += "          DETALLE DE INGRESOS POR USUARIO         \r\n";
    csv += "==================================================\r\n\r\n";

    csv += "Nombre / Datos;Codigo QR;INGRESOS TOTALES;Ultimo Ingreso\r\n";
    csv += "--------------------------------------------------;-----------------;---------------;---------------\r\n";

    for (const row of rows) {
      const nombre = String(row.nombre || "Sin Nombre").replace(/;/g, ",");
      const qr = String(row.qr || "N/A").replace(/;/g, ",");
      const total = row.total || 0;
      const fecha = row.fecha || "Nunca";
      
      // Resaltamos con flechas los que tienen ingresos
      const totalDisplay = total > 0 ? `[ ${total} ]` : "0";
      
      csv += `${nombre};${qr};${totalDisplay};${fecha}\r\n`;
    }

    csv += "\r\n\r\n--- Fin del Reporte ---";

    const BOM = Buffer.from('\uFEFF', 'utf-16le');
    const content = Buffer.from(csv, 'utf-16le');
    const result = Buffer.concat([BOM, content]);

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-16le',
        'Content-Disposition': 'attachment; filename=Reporte_Inventario_Final.csv'
      }
    });

  } catch (error) {
    console.error('Error al exportar:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
