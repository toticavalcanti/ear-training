// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ear Training - Treinamento Auditivo Musical',
  description: 'Desenvolva sua percepção musical com exercícios interativos e científicos',
  keywords: 'ear training, treinamento auditivo, música, percepção musical, intervalos, harmonia',
  authors: [{ name: 'Ear Training Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4F46E5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}