// frontend/src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-white bg-opacity-20 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg">
              🎵
            </div>
            <div className="hidden sm:block">
              <span className="text-lg sm:text-xl font-bold">Ear Training</span>
              <span className="text-xs sm:text-sm text-indigo-200 block">Treinamento Musical</span>
            </div>
            <div className="sm:hidden">
              <span className="text-lg font-bold">Ear Training</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link href="/" className="hover:text-indigo-200 transition-colors font-medium text-sm lg:text-base">
              🏠 Início
            </Link>
            <Link href="/exercises" className="hover:text-indigo-200 transition-colors font-medium text-sm lg:text-base">
              🎯 Exercícios
            </Link>
            <Link href="/progress" className="hover:text-indigo-200 transition-colors font-medium text-sm lg:text-base">
              📈 Progresso
            </Link>
            <Link href="/leaderboard" className="hover:text-indigo-200 transition-colors font-medium text-sm lg:text-base">
              🏆 Ranking
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-indigo-200 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop User Area */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-indigo-100 font-medium text-sm lg:text-base">
                  Olá, {user?.name}!
                </span>
                {user?.subscription === 'premium' && (
                  <span className="bg-yellow-400 text-yellow-900 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                    ✨ PRO
                  </span>
                )}
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-3 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg text-sm lg:text-base"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-indigo-500">
            <div className="space-y-3">
              <Link 
                href="/" 
                className="block text-white hover:text-indigo-200 py-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Início
              </Link>
              <Link 
                href="/exercises" 
                className="block text-white hover:text-indigo-200 py-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                🎯 Exercícios
              </Link>
              <Link 
                href="/progress" 
                className="block text-white hover:text-indigo-200 py-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                📈 Progresso
              </Link>
              <Link 
                href="/leaderboard" 
                className="block text-white hover:text-indigo-200 py-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                🏆 Ranking
              </Link>
              
              {/* Mobile User Section */}
              <div className="border-t border-indigo-500 pt-3 mt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-indigo-100 font-medium">
                      Olá, {user?.name}!
                      {user?.subscription === 'premium' && (
                        <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold ml-2">
                          ✨ PRO
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium text-sm block"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-base block text-center hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}