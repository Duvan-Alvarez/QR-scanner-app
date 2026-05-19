import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'Validador de Código QR',
  description: 'Sistema seguro para validación de códigos QR mediante escáner web.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
