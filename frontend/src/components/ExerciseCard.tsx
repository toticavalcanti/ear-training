// frontend/src/components/ExerciseCard.tsx
'use client';

import Link from 'next/link';

interface ExerciseCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  bgIcon: string;
  color: string;
  difficulty: string;
  duration: string;
  isLocked?: boolean;
}

export default function ExerciseCard({ 
  title, 
  description, 
  href, 
  icon,
  bgIcon,
  color,
  difficulty,
  duration,
  isLocked = false 
}: ExerciseCardProps) {
  const colorClasses = {
    indigo: {
      gradient: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      bg: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200 hover:border-indigo-300',
      difficulty: 'text-indigo-600 bg-indigo-100'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200 hover:border-purple-300',
      difficulty: 'text-purple-600 bg-purple-100'
    },
    blue: {
      gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200 hover:border-blue-300',
      difficulty: 'text-blue-600 bg-blue-100'
    },
    green: {
      gradient: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200 hover:border-green-300',
      difficulty: 'text-green-600 bg-green-100'
    }
  };

  const currentColor = colorClasses[color as keyof typeof colorClasses];

  if (isLocked) {
    return (
      <div className={`group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 ${currentColor.border} shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[380px] sm:min-h-[420px] lg:min-h-[480px] flex flex-col overflow-hidden`}>
        {/* Background Icon - Hidden on mobile */}
        <div className="hidden sm:block absolute top-4 right-4 text-4xl sm:text-5xl lg:text-6xl opacity-5">
          {bgIcon}
        </div>

        <div className="flex flex-col h-full relative z-10">
          {/* Top Row - Difficulty Badge and Duration */}
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${currentColor.difficulty}`}>
              {difficulty}
            </span>
            <span className="text-xs text-gray-500 font-medium">{duration}</span>
          </div>

          {/* Icon */}
          <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${currentColor.bg} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
            <span className="text-2xl sm:text-3xl lg:text-4xl">{icon}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4 text-center leading-tight min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 sm:mb-6 text-center flex-1 flex items-start justify-center px-2">
            <span>{description}</span>
          </p>

          {/* Lock Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-dashed border-gray-300 mt-auto">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <span className="text-white text-base sm:text-lg lg:text-xl">🔒</span>
              </div>
              <p className="text-gray-700 font-bold mb-3 sm:mb-4 text-xs sm:text-sm">Acesso Premium Necessário</p>
              <Link 
                href="/auth/login" 
                className={`w-full bg-gradient-to-r ${currentColor.gradient} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-bold text-xs sm:text-sm hover:scale-105 transform shadow-lg hover:shadow-xl block`}
              >
                🚀 Desbloquear Agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className="group block">
      <div className={`relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 ${currentColor.border} shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 sm:hover:-translate-y-3 min-h-[380px] sm:min-h-[420px] lg:min-h-[480px] flex flex-col overflow-hidden`}>
        {/* Background Icon - Hidden on mobile */}
        <div className="hidden sm:block absolute top-4 right-4 text-4xl sm:text-5xl lg:text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
          {bgIcon}
        </div>

        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentColor.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl sm:rounded-3xl`}></div>

        <div className="flex flex-col h-full relative z-10">
          {/* Top Row - Difficulty Badge and Duration */}
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${currentColor.difficulty} group-hover:scale-105 transition-transform`}>
              {difficulty}
            </span>
            <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">{duration}</span>
          </div>

          {/* Icon */}
          <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${currentColor.bg} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
            <span className="text-2xl sm:text-3xl lg:text-4xl">{icon}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4 group-hover:text-indigo-600 transition-colors text-center leading-tight min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6 sm:mb-8 text-center flex-1 flex items-start justify-center group-hover:text-gray-700 transition-colors px-2">
            <span>{description}</span>
          </p>
          
          {/* Button */}
          <div className={`w-full bg-gradient-to-r ${currentColor.gradient} text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all font-bold shadow-lg transform group-hover:scale-105 group-hover:shadow-2xl mt-auto`}>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm sm:text-base">Iniciar Treinamento</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}