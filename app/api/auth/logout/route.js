import { NextResponse } from 'next/server';

export async function POST(request) {
  const response = NextResponse.json({ success: true, message: 'Logout exitoso' });
  response.cookies.set('auth_user', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  });
  return response;
}
