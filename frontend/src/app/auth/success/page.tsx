// // ===================================
// // src/app/auth/success/page.tsx
// // ===================================
// 'use client';

// import { useEffect, useState, Suspense } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';

// function AuthSuccessContent() {
//   const [countdown, setCountdown] = useState(3);
//   const [hasProcessed, setHasProcessed] = useState(false);
//   const router = useRouter();
//   const { user, isAuthenticated, isLoading } = useAuth();

//   useEffect(() => {
//     // Só processar uma vez
//     if (hasProcessed) return;
    
//     // Aguardar AuthContext carregar
//     if (isLoading) return;

//     // Marcar como processado para evitar re-execuções
//     setHasProcessed(true);
    
//     console.log('AuthSuccess - Estado:', { isAuthenticated, user: user?.name });
    
//     // Se não está autenticado, redirecionar para login
//     if (!isAuthenticated) {
//       setTimeout(() => {
//         router.push('/auth/login');
//       }, 2000);
//       return;
//     }

//     // Se está autenticado, iniciar countdown
//     const timer = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           console.log('Redirecionando para homepage...');
//           // Usar window.location como fallback
//           window.location.href = '/';
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [isLoading, hasProcessed, isAuthenticated, router]);

//   // Ainda carregando
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
//         <div className="max-w-md w-full mx-auto p-6">
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Processando Login</h2>
//             <p className="text-gray-600">Verificando autenticação...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Não autenticado
//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
//         <div className="max-w-md w-full mx-auto p-6">
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//             <div className="text-red-500 text-6xl mb-6">❌</div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro no Login</h2>
//             <p className="text-gray-600 mb-4">Redirecionando para login...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Autenticado - sucesso!
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
//       <div className="max-w-md w-full mx-auto p-6">
//         <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//           <div className="text-green-500 text-6xl mb-6">✅</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Realizado!</h2>
//           <p className="text-gray-600 mb-4">Bem-vindo, {user?.name}!</p>
//           <p className="text-sm text-gray-500">Redirecionando em {countdown} segundos...</p>
          
//           <div className="mt-6">
//             <button 
//               onClick={() => window.location.href = '/'}
//               className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
//             >
//               Ir para Início
//             </button>
//           </div>

//           {/* Debug Info em desenvolvimento */}
//           {process.env.NODE_ENV === 'development' && (
//             <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-left">
//               <strong>Debug Info:</strong>
//               <div>Autenticado: {isAuthenticated ? 'Sim' : 'Não'}</div>
//               <div>Usuário: {user?.name || 'N/A'}</div>
//               <div>Loading: {isLoading ? 'Sim' : 'Não'}</div>
//               <div>Processado: {hasProcessed ? 'Sim' : 'Não'}</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AuthSuccessPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Carregando...</p>
//         </div>
//       </div>
//     }>
//       <AuthSuccessContent />
//     </Suspense>
//   );
// }