// frontend/src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMIDIHandler } from '@/lib/midiHandler';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import CTASection from '@/components/CTASection';
import ExerciseCard from '@/components/ExerciseCard';

export default function Home() {
  const [midiSupported, setMidiSupported] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
    const midiHandler = getMIDIHandler();
    setMidiSupported(midiHandler.isSupported());
    midiHandler.initialize();
  }, []);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-indigo-200 mx-auto mb-4 sm:mb-6"></div>
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-indigo-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="text-gray-600 text-base sm:text-lg font-medium">Preparando sua experiência musical...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Floating Music Notes Animation - Hidden on small screens for performance */}
      <div className="hidden lg:block fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 text-indigo-200 text-2xl animate-bounce" style={{animationDelay: '0s'}}>♪</div>
        <div className="absolute top-40 right-20 text-purple-200 text-lg animate-bounce" style={{animationDelay: '1s'}}>♫</div>
        <div className="absolute top-96 left-1/4 text-blue-200 text-xl animate-bounce" style={{animationDelay: '2s'}}>♬</div>
        <div className="absolute bottom-96 right-1/3 text-indigo-200 text-lg animate-bounce" style={{animationDelay: '3s'}}>♩</div>
        <div className="absolute top-80 right-10 text-purple-200 text-2xl animate-bounce" style={{animationDelay: '4s'}}>♪</div>
      </div>
      
      <main className="relative z-10 py-8 sm:py-12 lg:py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <HeroSection isAuthenticated={isAuthenticated} />

          {/* Stats Section */}
          <StatsSection />

          {/* MIDI Warning with Better Mobile Design */}
          {mounted && !midiSupported && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 sm:p-6 mb-12 sm:mb-16 rounded-xl sm:rounded-2xl max-w-5xl mx-auto shadow-lg">
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg sm:text-xl">⚠️</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-yellow-800 font-bold text-base sm:text-lg mb-2">Navegador com Suporte Limitado</h3>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    Seu navegador não oferece suporte completo para Web Audio API. Para a melhor experiência, 
                    recomendamos usar <strong>Chrome</strong>, <strong>Firefox</strong> ou <strong>Safari</strong> atualizado.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Exercise Cards Section */}
          <div className="mb-16 sm:mb-20">
            <div className="text-center mb-12 sm:mb-16 px-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                Escolha Sua Especialização
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Cada exercício foi desenvolvido por <strong>mestres em música</strong> e validado por <strong>neurocientistas</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4">
              <ExerciseCard 
                title="Identificação de Intervalos" 
                description="Domine a base da harmonia musical"
                href="/exercises/intervals"
                icon="🎯"
                bgIcon="🎼"
                color="indigo"
                difficulty="Iniciante"
                duration="15-30 min"
                isLocked={!isAuthenticated}
              />
              <ExerciseCard 
                title="Progressões Harmônicas" 
                description="Reconheça acordes como um profissional"
                href="/exercises/progressions"
                icon="🎼"
                bgIcon="🎹"
                color="purple"
                difficulty="Intermediário"
                duration="20-45 min"
                isLocked={!isAuthenticated}
              />
              <ExerciseCard 
                title="Ditado Melódico" 
                description="Transcreva melodias com precisão"
                href="/exercises/melodic"
                icon="🎵"
                bgIcon="🎶"
                color="blue"
                difficulty="Avançado"
                duration="30-60 min"
                isLocked={!isAuthenticated}
              />
              <ExerciseCard 
                title="Ditado Rítmico" 
                description="Desenvolva timing perfeito"
                href="/exercises/rhythmic"
                icon="🥁"
                bgIcon="⏱️"
                color="green"
                difficulty="Intermediário"
                duration="10-25 min"
                isLocked={!isAuthenticated}
              />
            </div>
          </div>

          {/* CTA Section for non-authenticated users */}
          {!isAuthenticated && <CTASection />}
        </div>
      </main>

      <Footer />
    </>
  );
}