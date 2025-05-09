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
      
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">
          Melhore seu ouvido musical com nossos exercícios interativos. Escolha entre diferentes
          tipos de treinamento para aprimorar suas habilidades.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <ExerciseCard 
            title="Identificação de Intervalos" 
            description="Aprenda a identificar a distância entre duas notas."
            href="/exercises/intervals"
          />
          <ExerciseCard 
            title="Progressões Harmônicas" 
            description="Treine seu ouvido para reconhecer progressões de acordes comuns."
            href="/exercises/progressions"
          />
          <ExerciseCard 
            title="Ditado Melódico" 
            description="Pratique a transcrição de melodias simples."
            href="/exercises/melodic"
          />
          <ExerciseCard 
            title="Ditado Rítmico" 
            description="Melhore suas habilidades de reconhecimento rítmico."
            href="/exercises/rhythmic"
          />
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ title, description, href }: { 
  title: string; 
  description: string; 
  href: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
      <h3 className="text-xl font-semibold mb-2 text-indigo-700">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link href={href} className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
        Iniciar Prática
      </Link>
    </div>
  );
}