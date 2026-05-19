import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Usuario y contraseña requeridos' }, { status: 400 });
    }

    const user = db.prepare('SELECT id, username, role, active FROM users WHERE username = ? AND password = ?').get(username, password);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuario o contraseña inválidos' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ success: false, message: 'Usuario inactivo' }, { status: 403 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

    response.cookies.set('auth_user', JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
