//src\app\auth\forgot-password\page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmailSent(true);
      } else {
        setError(data.message || 'Erro ao enviar email de recuperação');
      }
    } catch (err) {
      console.error('Erro ao solicitar recuperação:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green-600 text-2xl">✉️</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Email enviado!</h1>
            
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {message}
            </div>
            
            <div className="text-sm text-gray-600 mb-6 space-y-2">
              <p>📧 Verifique sua caixa de entrada e spam</p>
              <p>⏰ O link expira em 1 hora</p>
              <p>🔒 Pode ser usado apenas uma vez</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setMessage('');
                }}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Enviar para outro email
              </button>
              
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Esqueci minha senha</h1>
            <p className="text-gray-600 mt-2">Digite seu email para receber as instruções</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email da sua conta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="seu@email.com"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enviaremos um link para redefinir sua senha
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32"></circle>
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar instruções'
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Como funciona:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Você receberá um email com link seguro</li>
              <li>• Clique no link para criar nova senha</li>
              <li>• O link expira em 1 hora por segurança</li>
            </ul>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link 
              href="/auth/login" 
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              ← Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}