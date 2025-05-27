// frontend/src/app/auth/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar imediatamente para home
    // O AuthContext vai capturar o token automaticamente
    router.replace('/');
  }, [router]);

  // Mostrar loading mínimo enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}