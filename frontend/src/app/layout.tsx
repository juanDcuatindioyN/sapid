import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAPID - Sistema Automatizado de Pesaje',
  description: 'Sistema Automatizado de Pesaje e Integración Digital',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
