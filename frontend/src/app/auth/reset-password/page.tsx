'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<{ email?: string; name?: string }>({});
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyToken(tokenFromUrl);
    } else {
      setError('Token não encontrado na URL');
      setTokenValid(false);
    }
  }, [searchParams]);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-token?token=${tokenToVerify}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
        setUserInfo({ email: data.email, name: data.name });
      } else {
        setTokenValid(false);
        setError(data.message || 'Token inválido ou expirado');
      }
    } catch (err) {
      console.error('Erro ao verificar token:', err);
      setTokenValid(false);
      setError('Erro ao verificar token');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Erro ao redefinir senha');
      }
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando token...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Senha redefinida!</h1>
            
            <p className="text-gray-600 mb-6">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
            </p>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Fazer login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Token invalid state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-2xl">❌</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Token inválido</h1>
            
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
            
            <p className="text-gray-600 mb-6">
              O link pode ter expirado ou já foi usado. Solicite uma nova recuperação de senha.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/forgot-password"
                className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
              >
                Solicitar nova recuperação
              </Link>
              
              <Link
                href="/auth/login"
                className="block w-full text-center text-gray-600 hover:text-gray-800 py-3 transition-colors"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Nova senha</h1>
            {userInfo.name && (
              <p className="text-gray-600 mt-2">Olá, {userInfo.name}!</p>
            )}
            <p className="text-gray-600 text-sm mt-1">Digite sua nova senha abaixo</p>
          </div>

          {/* User Info */}
          {userInfo.email && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📧 Redefinindo senha para: <span className="font-medium">{userInfo.email}</span>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nova senha
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32"></circle>
                  </svg>
                  Redefinindo...
                </span>
              ) : (
                'Redefinir senha'
              )}
            </button>
          </form>

          {/* Security Tips */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-medium text-gray-800 mb-2">🛡️ Dicas de segurança:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use uma senha única e forte</li>
              <li>• Combine letras, números e símbolos</li>
              <li>• Evite informações pessoais óbvias</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}