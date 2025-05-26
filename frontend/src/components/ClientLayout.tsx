// ===================================
// src/components/ClientLayout.tsx
// ===================================
'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostrar loading enquanto não está montado ou AuthContext está carregando
  if (!mounted || isLoading) {
    return <Loading message="Carregando aplicação..." fullScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </AuthProvider>
  );
}