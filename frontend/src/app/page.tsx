// ===================================
// src/app/page.tsx
// ===================================
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMIDIHandler } from '@/lib/midiHandler';

export default function Home() {
  const [midiSupported, setMidiSupported] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const midiHandler = getMIDIHandler();
    setMidiSupported(midiHandler.isSupported());
    midiHandler.initialize();
  }, []);

  return (
    <div className="py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Treinamento Auditivo Musical
      </h1>
      
      {mounted && !midiSupported && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 max-w-3xl mx-auto">
          <p className="font-bold">Atenção</p>
          <p>Seu navegador não suporta a API Web MIDI ou Web Audio. Alguns recursos podem não funcionar corretamente.</p>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="mb-6 text-center text-gray-600">
          Melhore seu ouvido musical com nossos exercícios interativos.
        </p>
        
        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/progress" className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2">📊 Meu Progresso</h3>
            <p className="text-white/90 text-sm">Veja suas estatísticas e conquistas</p>
          </Link>
          
          <Link href="/leaderboard" className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg p-6 text-white hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2">🏆 Rankings</h3>
            <p className="text-white/90 text-sm">Compare com outros usuários</p>
          </Link>
        </div>
        
        {/* Exercises */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Exercícios Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">🎵</div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Iniciante
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">Identificação de Intervalos</h3>
              <p className="text-gray-600 mb-4 text-sm">Aprenda a identificar a distância entre duas notas.</p>
              <Link href="/exercises/melodic-intervals" className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-medium">
                Iniciar Prática
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">🎹</div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  Intermediário
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">Progressões Harmônicas</h3>
              <p className="text-gray-600 mb-4 text-sm">Reconheça progressões de acordes comuns.</p>
              <Link href="/exercises/progressions" className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-medium">
                Iniciar Prática
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">🎶</div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  Intermediário
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">Ditado Melódico</h3>
              <p className="text-gray-600 mb-4 text-sm">Pratique a transcrição de melodias simples.</p>
              <Link href="/exercises/melodic" className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-medium">
                Iniciar Prática
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">🥁</div>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Avançado
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">Ditado Rítmico</h3>
              <p className="text-gray-600 mb-4 text-sm">Melhore suas habilidades de reconhecimento rítmico.</p>
              <Link href="/exercises/rhythmic" className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-medium">
                Iniciar Prática
              </Link>
            </div>
            
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Novo por aqui?</h3>
          <p className="text-gray-600 mb-4">
            Comece com os exercícios de intervalos para desenvolver seu ouvido musical.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/exercises/intervals" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Começar Agora
            </Link>
            <Link href="/progress" className="border border-indigo-600 text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
              Ver Meu Progresso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}