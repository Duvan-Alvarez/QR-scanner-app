import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = db.prepare('SELECT COUNT(*) as total FROM scans_log').get();
    return NextResponse.json({ success: true, total: result.total });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ success: false, total: 0 });
  }
}
