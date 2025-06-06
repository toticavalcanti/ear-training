// backend/src/app/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface User {
  id: string
  name: string
  email: string
  subscription: string
  avatar?: string
  isGoogleUser: boolean
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Verificar se voltou do Google OAuth
        const urlParams = new URLSearchParams(window.location.search)
        const googleAuthSuccess = urlParams.get('googleAuthSuccess')
        
        if (googleAuthSuccess) {
          // Limpar URL
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        // Tentar pegar token do cookie ou localStorage
        const getCookie = (name: string): string | null => {
          const value = `; ${document.cookie}`
          const parts = value.split(`; ${name}=`)
          if (parts.length === 2) return parts.pop()?.split(';').shift() || null
          return null
        }

        const token = getCookie('googleAuthToken') || localStorage.getItem('authToken')
        
        if (token) {
          // Buscar dados do usuário
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          } else {
            // Token inválido, remover
            localStorage.removeItem('authToken')
            document.cookie = 'googleAuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    deleteCookie('googleAuthToken')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {user ? (
            // Usuário logado
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {user.avatar && (
                    <Image 
                      src={user.avatar} 
                      alt="Avatar do usuário" 
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Olá, {user.name}! 👋
                    </h1>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      {user.isGoogleUser ? 'Conta Google' : 'Conta Tradicional'} • {user.subscription}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sair
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">🎵 Exercícios</h3>
                  <p className="text-blue-600">Pratique intervalos, acordes e ritmos</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">📊 Progresso</h3>
                  <p className="text-green-600">Acompanhe seu desenvolvimento</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">🏆 Conquistas</h3>
                  <p className="text-purple-600">Desbloqueie achievements</p>
                </div>
              </div>
            </div>
          ) : (
            // Usuário não logado
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🎵 Ear Training App
              </h1>
              <p className="text-gray-600 mb-8">
                Desenvolva seu ouvido musical com exercícios interativos
              </p>

              <div className="space-y-4 max-w-sm mx-auto">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>🔑</span>
                  Entrar com Google
                </button>

                <div className="text-gray-500">ou</div>

                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Login Tradicional
                </button>

                <button
                  onClick={() => window.location.href = '/auth/register'}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Criar Conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}