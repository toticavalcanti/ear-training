// frontend/src/components/HeroSection.tsx
'use client';

import Link from 'next/link';

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export default function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <div className="text-center mb-16 sm:mb-24 lg:mb-32 relative px-4">
      {/* Sound Wave Background - Hidden on mobile for performance */}
      <div className="lg:block absolute inset-0 flex items-center justify-center opacity-5">
        <div className="flex space-x-1">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="bg-indigo-600 animate-pulse"
              style={{
                width: '3px',
                height: `${Math.random() * 60 + 15}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${Math.random() * 1.5 + 0.8}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-block mb-4 sm:mb-6 px-3 sm:px-6 py-2 sm:py-3 bg-white/70 backdrop-blur-sm border border-indigo-200 rounded-full shadow-lg">
          <span className="text-indigo-600 font-semibold text-xs sm:text-sm">
            🎵 Plataforma #1 em Ear Training
          </span>
        </div>
        
        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-tight">
          Desenvolva Sua 
          <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
            Percepção Musical
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
          Transforme seu ouvido musical com exercícios interativos baseados em 
          <span className="text-indigo-600 font-bold"> ciência cognitiva</span> e 
          <span className="text-purple-600 font-bold"> gamificação avançada</span>.
          
          {!isAuthenticated && (
            <span className="block mt-2 sm:mt-4 text-indigo-700 font-bold text-lg sm:text-xl animate-pulse">
              ✨ Comece gratuitamente e veja resultados em 7 dias!
            </span>
          )}
        </p>

        {/* CTA Buttons */}
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Link
              href="/auth/register"
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl sm:rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></span>
              <span className="relative flex items-center space-x-2">
                <span>🚀</span>
                <span className="hidden sm:inline">Começar Jornada Gratuita</span>
                <span className="sm:hidden">Começar Grátis</span>
              </span>
            </Link>
            
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-indigo-600 bg-white/80 backdrop-blur-sm border-2 border-indigo-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="hidden sm:inline">Já sou músico 🎼</span>
              <span className="sm:hidden">Entrar 🎼</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}