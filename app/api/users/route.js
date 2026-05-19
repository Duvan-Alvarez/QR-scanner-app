import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getAuthUser(request) {
  const cookie = request.cookies.get('auth_user');
  if (!cookie) return null;
  try {
    return JSON.parse(cookie.value);
  } catch (e) {
    return null;
  }
}

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    if (authUser.role !== 'admin') return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });

    const rows = db.prepare('SELECT id, username, role, active, created_at FROM users ORDER BY id DESC').all();
    return NextResponse.json({ success: true, users: rows });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    if (authUser.role !== 'admin') return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });

    const body = await request.json();
    const { username, password, role, active } = body;

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, message: 'Campos requeridos' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id, active FROM users WHERE username = ?').get(username);
    if (existing) {
      const newActive = typeof active === 'number' ? active : existing.active;
      db.prepare('UPDATE users SET password = ?, role = ?, active = ? WHERE username = ?').run(password, role, newActive, username);
      return NextResponse.json({ success: true, message: 'Usuario actualizado' });
    }

    const isActive = typeof active === 'number' ? active : 1;
    db.prepare('INSERT INTO users (username, password, role, active) VALUES (?, ?, ?, ?)').run(username, password, role, isActive);
    return NextResponse.json({ success: true, message: 'Usuario creado' });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    if (authUser.role !== 'admin') return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });

    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    if (!username) return NextResponse.json({ success: false, message: 'username requerido' }, { status: 400 });

    const body = await request.json();
    const { active } = body;
    if (typeof active !== 'boolean') {
      return NextResponse.json({ success: false, message: 'active debe ser booleano' }, { status: 400 });
    }

    db.prepare('UPDATE users SET active = ? WHERE username = ?').run(active ? 1 : 0, username);
    return NextResponse.json({ success: true, message: active ? 'Usuario activado' : 'Usuario inactivado' });
  } catch (error) {
    console.error('Error in PATCH /api/users:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    if (authUser.role !== 'admin') return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });

    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    if (!username) return NextResponse.json({ success: false, message: 'username requerido' }, { status: 400 });

    db.prepare('DELETE FROM users WHERE username = ?').run(username);
    return NextResponse.json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error in DELETE /api/users:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
