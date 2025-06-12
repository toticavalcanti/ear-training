// Componente para mostrar opções com cifras bonitas
// src/components/ChordProgressionOptions.tsx

import React from 'react';
import { formatChordSymbol } from './VoiceLeadingSystem';

interface ChordProgression {
  _id: string;
  name: string;
  degrees: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  mode: 'major' | 'minor';
  description: string;
  reference?: string;
}

interface ChordProgressionOptionsProps {
  options: ChordProgression[];
  selectedAnswer: string;
  showResult: boolean;
  correctAnswer: string;
  onSelect: (progressionName: string) => void;
  disabled?: boolean;
}

const ChordProgressionOptions: React.FC<ChordProgressionOptionsProps> = ({
  options,
  selectedAnswer,
  showResult,
  correctAnswer,
  onSelect,
  disabled = false
}) => {

  // Converter graus em cifras formatadas
  const formatProgressionCifras = (degrees: string[]): string => {
    return degrees.map(degree => formatChordSymbol(degree)).join(' - ');
  };

  // Cor baseada no resultado
  const getOptionColor = (progressionName: string) => {
    if (!showResult) {
      return selectedAnswer === progressionName
        ? 'bg-blue-100 border-blue-500 text-blue-900'
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
    }

    // Depois do resultado
    if (progressionName === correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-900'; // Resposta correta
    } else if (progressionName === selectedAnswer && progressionName !== correctAnswer) {
      return 'bg-red-100 border-red-500 text-red-900'; // Resposta incorreta escolhida
    } else {
      return 'bg-gray-50 border-gray-200 text-gray-600'; // Outras opções
    }
  };

  // Ícone baseado no resultado
  const getResultIcon = (progressionName: string) => {
    if (!showResult) return null;

    if (progressionName === correctAnswer) {
      return <span className="text-green-600 text-xl">✅</span>;
    } else if (progressionName === selectedAnswer && progressionName !== correctAnswer) {
      return <span className="text-red-600 text-xl">❌</span>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
        Qual progressão harmônica você ouviu?
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {options.map((progression) => {
          return (
            <button
              key={progression._id}
              onClick={() => !disabled && onSelect(progression.name)}
              disabled={disabled || showResult}
              className={`
                p-5 rounded-lg text-left transition-all duration-200 border-2
                ${getOptionColor(progression.name)}
                ${!disabled && !showResult ? 'hover:shadow-md transform hover:scale-[1.01]' : ''}
                ${disabled || showResult ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Nome da progressão e ícone de resultado */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg">
                      {progression.name}
                    </h4>
                    {getResultIcon(progression.name)}
                  </div>

                  {/* Cifras da progressão - DESTAQUE PRINCIPAL */}
                  <div className="mb-3 p-3 bg-white bg-opacity-60 rounded-lg border">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">
                        Progressão
                      </div>
                      <div className="font-mono font-bold text-lg text-gray-900 tracking-wide">
                        {formatProgressionCifras(progression.degrees)}
                      </div>
                    </div>
                  </div>

                  {/* Graus romanos (menor destaque) */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Análise harmônica:</div>
                    <div className="font-mono text-sm text-gray-700">
                      {progression.degrees.join(' - ')}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="text-sm text-gray-600 mb-3">
                    {progression.description}
                  </div>

                  {/* Tags informativas */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`
                      px-2 py-1 rounded font-medium
                      ${progression.mode === 'major' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                      }
                    `}>
                      {progression.mode === 'major' ? 'Maior' : 'Menor'}
                    </span>
                    
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium capitalize">
                      {progression.category}
                    </span>
                    
                    <span className={`
                      px-2 py-1 rounded font-medium
                      ${progression.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        progression.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}
                    `}>
                      {progression.difficulty === 'beginner' ? 'Iniciante' : 
                       progression.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                    </span>
                  </div>

                  {/* Referência musical */}
                  {progression.reference && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Referência:</div>
                      <div className="text-sm text-purple-600 font-medium">
                        🎵 {progression.reference}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legenda de cifras */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">
          💡 Guia de Cifras (Estilo Real Book)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800">
          <div><span className="font-mono font-bold">C</span> = Maior</div>
          <div><span className="font-mono font-bold">Cm</span> = Menor</div>
          <div><span className="font-mono font-bold">C7</span> = Dominante</div>
          <div><span className="font-mono font-bold">C∆7</span> = Maior com 7ª</div>
          <div><span className="font-mono font-bold">Cm7</span> = Menor com 7ª</div>
          <div><span className="font-mono font-bold">C7sus4</span> = Dominante suspenso</div>
          <div><span className="font-mono font-bold">C7alt</span> = Dominante alterado</div>
          <div><span className="font-mono font-bold">C°7</span> = Diminuto</div>
        </div>
      </div>
    </div>
  );
};

export default ChordProgressionOptions;