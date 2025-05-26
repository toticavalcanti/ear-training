// frontend/src/components/StatsSection.tsx
'use client';

import { useState, useEffect } from 'react';

export default function StatsSection() {
  const [animatedStats, setAnimatedStats] = useState({ users: 0, exercises: 0, improvement: 0 });

  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedStats({
          users: Math.floor(easeOut * 10000),
          exercises: Math.floor(easeOut * 50000),
          improvement: Math.floor(easeOut * 95)
        });
        
        if (step >= steps) clearInterval(timer);
      }, stepTime);
    };

    const timeout = setTimeout(animateStats, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto mb-16 sm:mb-20 lg:mb-24 px-4">
      {/* Stats Card 1 */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-indigo-200 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-indigo-600 mb-1 sm:mb-2">
            {animatedStats.users.toLocaleString()}+
          </div>
          <div className="text-gray-700 font-bold text-sm sm:text-base lg:text-lg">
            Músicos Evoluindo
          </div>
          <div className="text-indigo-500 text-xs sm:text-sm mt-1 sm:mt-2">
            🎯 Meta: 100K em 2024
          </div>
        </div>
      </div>
      
      {/* Stats Card 2 */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-purple-200 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-purple-600 mb-1 sm:mb-2">
            {animatedStats.exercises.toLocaleString()}+
          </div>
          <div className="text-gray-700 font-bold text-sm sm:text-base lg:text-lg">
            Exercícios Completados
          </div>
          <div className="text-purple-500 text-xs sm:text-sm mt-1 sm:mt-2">
            📈 +2.5K por semana
          </div>
        </div>
      </div>
      
      {/* Stats Card 3 */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-green-200 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-green-600 mb-1 sm:mb-2">
            {animatedStats.improvement}%
          </div>
          <div className="text-gray-700 font-bold text-sm sm:text-base lg:text-lg">
            Taxa de Sucesso
          </div>
          <div className="text-green-500 text-xs sm:text-sm mt-1 sm:mt-2">
            🏆 Comprovado cientificamente
          </div>
        </div>
      </div>
    </div>
  );
}