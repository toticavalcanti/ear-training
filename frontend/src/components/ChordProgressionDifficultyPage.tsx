// src/components/ChordProgressionDifficultyPage.tsx
// Página de seleção de dificuldade com cifras bonitas

'use client';

import React from 'react';
import { formatChordSymbol } from './VoiceLeadingSystem';

interface DifficultyPageProps {
  onSelectDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
}

const ChordProgressionDifficultyPage: React.FC<DifficultyPageProps> = ({
  onSelectDifficulty
}) => {

  // Converter graus em cifras bonitas
  const formatExampleProgression = (degrees: string[]): string => {
    return degrees.map(degree => formatChordSymbol(degree)).join(' - ');
  };

  // Dados das dificuldades com exemplos reais
  const difficulties = [
    {
      id: 'beginner' as const,
      title: 'Iniciante',
      subtitle: 'Progressões básicas e populares',
      description: 'Tríades simples e progressões fundamentais da música popular',
      icon: '🌱',
      color: 'green',
      examples: [
        { degrees: ['I', 'V', 'vi', 'IV'], name: 'Pop Clássico' },
        { degrees: ['ii', 'V', 'I'], name: 'Jazz Básico' },
        { degrees: ['vi', 'IV', 'I', 'V'], name: 'Folk Popular' }
      ]
    },
    {
      id: 'intermediate' as const,
      title: 'Intermediário', 
      subtitle: 'Progressões com acordes de sétima',
      description: 'Acordes de sétima e dominantes secundárias',
      icon: '🎯',
      color: 'yellow',
      examples: [
        { degrees: ['I^maj7', 'vi7', 'ii7', 'V7'], name: 'Jazz Standard' },
        { degrees: ['vi', 'IV', 'I', 'V7'], name: 'Pop com V7' },
        { degrees: ['iii7', 'VI7', 'ii7', 'V7'], name: 'Circle of Fifths' }
      ]
    },
    {
      id: 'advanced' as const,
      title: 'Avançado',
      subtitle: 'Progressões complexas e modais',
      description: 'Empréstimos modais, substituições e progressões jazzísticas',
      icon: '🚀',
      color: 'red',
      examples: [
        { degrees: ['I^maj7', 'bIII^maj7', 'bVI^maj7', 'bII^maj7'], name: 'Modal Interchange' },
        { degrees: ['i', 'bVI', 'bVII', 'iv'], name: 'Dorian Popular' },
        { degrees: ['I^maj7#11', 'V7sus4', 'vi7', 'ii7b5'], name: 'Jazz Avançado' }
      ]
    }
  ];

  const colorClasses: Record<string, {
    bg: string;
    border: string;
    text: string;
    button: string;
    accent: string;
  }> = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      button: 'bg-green-600 hover:bg-green-700',
      accent: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200', 
      text: 'text-yellow-800',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      accent: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800', 
      button: 'bg-red-600 hover:bg-red-700',
      accent: 'text-red-600'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎼</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Progressões de Acordes
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Desenvolva seu ouvido harmônico identificando sequências de acordes.
          </p>
          <p className="text-lg text-gray-500">
            Ouça progressões e identifique qual padrão harmônico está sendo tocado.
          </p>
        </div>

        {/* Título da seção */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Escolha sua dificuldade
          </h2>
          <p className="text-gray-600">
            Cada nível apresenta progressões com complexidade crescente
          </p>
        </div>

        {/* Cards de dificuldade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {difficulties.map((difficulty) => {
            const colors = colorClasses[difficulty.color];
            
            return (
              <div
                key={difficulty.id}
                className={`
                  ${colors.bg} ${colors.border} ${colors.text}
                  border-2 rounded-xl p-6 
                  hover:shadow-lg transition-all duration-200
                  flex flex-col h-full
                `}
              >
                {/* Header do card */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{difficulty.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{difficulty.title}</h3>
                  <p className="text-sm font-medium mb-3">{difficulty.subtitle}</p>
                  <p className="text-xs opacity-80">{difficulty.description}</p>
                </div>

                {/* Exemplos com cifras bonitas */}
                <div className="flex-1 mb-6">
                  <div className="text-center mb-4">
                    <span className="text-sm font-semibold opacity-75">Exemplos:</span>
                  </div>
                  
                  <div className="space-y-3">
                    {difficulty.examples.map((example, index) => (
                      <div key={index} className="bg-white bg-opacity-60 rounded-lg p-3 border">
                        {/* Nome da progressão */}
                        <div className="text-xs font-medium opacity-75 mb-1 text-center">
                          {example.name}
                        </div>
                        
                        {/* Cifras formatadas - DESTAQUE PRINCIPAL */}
                        <div className="text-center mb-2">
                          <div className="font-mono font-bold text-sm tracking-wide text-gray-900">
                            {formatExampleProgression(example.degrees)}
                          </div>
                        </div>
                        
                        {/* Graus romanos pequenos */}
                        <div className="text-center">
                          <div className="font-mono text-xs opacity-60">
                            {example.degrees.join(' - ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão - sempre na mesma posição */}
                <div className="mt-auto">
                  <button
                    onClick={() => onSelectDifficulty(difficulty.id)}
                    className={`
                      w-full py-3 px-6 rounded-lg font-bold text-white
                      ${colors.button}
                      transition-all duration-200
                      shadow-md hover:shadow-lg transform hover:scale-[1.02]
                    `}
                  >
                    Começar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Como funciona */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Como funciona?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="font-bold text-lg mb-2">1. Ouça</h3>
              <p className="text-gray-600 text-sm">
                Clique em Tocar Progressão para ouvir a sequência de acordes com voice leading suave
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-lg mb-2">2. Identifique</h3>
              <p className="text-gray-600 text-sm">
                Escolha qual progressão harmônica você ouviu entre as opções com cifras estilo Real Book
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-bold text-lg mb-2">3. Confirme</h3>
              <p className="text-gray-600 text-sm">
                Confirme sua resposta e receba feedback imediato com análise harmônica na pauta
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-bold text-lg mb-2">4. Evolua</h3>
              <p className="text-gray-600 text-sm">
                Ganhe pontos e XP, acompanhe seu progresso e develop seu ouvido harmônico
              </p>
            </div>
          </div>
        </div>

        {/* Características destacadas */}
        <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-4 text-center">
            🎼 Características do Treinamento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎹</span>
              <span><strong>Voice leading otimizado</strong> - Condução suave entre acordes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎼</span>
              <span><strong>Cifras Real Book</strong> - Notação profissional (C∆7, Dm7, etc.)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span><strong>Pauta musical</strong> - Visualização após cada resposta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span><strong>Velocidade ajustável</strong> - De 40 a 120 BPM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span><strong>Análise harmônica</strong> - Função de cada acorde</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📈</span>
              <span><strong>Progresso salvo</strong> - Acompanhe sua evolução</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordProgressionDifficultyPage;