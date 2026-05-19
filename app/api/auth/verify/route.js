import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const cookie = request.cookies.get('auth_user');

    if (!cookie) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const user = JSON.parse(cookie.value);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error in verify:', error);
    return NextResponse.json({ success: false, message: 'Error en la verificación' }, { status: 500 });
  }
}
