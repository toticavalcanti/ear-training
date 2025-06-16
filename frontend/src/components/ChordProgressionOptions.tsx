// src/components/ChordProgressionOptions.tsx - VERSÃO CORRIGIDA
// Remove formatChordSymbol bugado e usa cifras transpostas

import React from 'react';

// ✅ Interface CORRIGIDA - agora usa TransposedChordProgression
interface TransposedChordProgression {
  _id: string;
  name: string;
  degrees: string[];           // ✅ Graus puros para análise harmônica
  chords: string[];           // ✅ Cifras transpostas para exibição
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  mode: 'major' | 'minor';
  description: string;
  reference?: string;
}

interface ChordProgressionOptionsProps {
  options: TransposedChordProgression[];  // ✅ MUDOU AQUI
  selectedAnswer: string;
  showResult: boolean;
  correctAnswer: string;
  onSelect: (progressionName: string) => void;
  disabled?: boolean;
  currentKey?: string; // ✅ Nova prop para mostrar a tonalidade
}

const ChordProgressionOptions: React.FC<ChordProgressionOptionsProps> = ({
  options,
  selectedAnswer,
  showResult,
  correctAnswer,
  onSelect,
  disabled = false,
  currentKey = 'C' // ✅ Default C se não especificado
}) => {

  // ✅ FUNÇÃO CORRIGIDA - usa cifras já transpostas
  const formatProgressionCifras = (chords: string[]): string => {
    // Não precisa mais de formatChordSymbol bugado!
    return chords.join(' - ');
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
      {/* ✅ Header com tonalidade */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Qual progressão harmônica você ouviu?
        </h3>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block">
          <span className="font-mono text-lg">🎹 Tonalidade: {currentKey}</span>
        </div>
      </div>

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

                  {/* ✅ CIFRAS CORRIGIDAS - usa progression.chords */}
                  <div className="mb-3 p-3 bg-white bg-opacity-60 rounded-lg border">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">
                        Progressão em {currentKey}
                      </div>
                      <div className="font-mono font-bold text-lg text-gray-900 tracking-wide">
                        {formatProgressionCifras(progression.chords)}
                      </div>
                    </div>
                  </div>

                  {/* ✅ ANÁLISE HARMÔNICA - usa progression.degrees */}
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

      {/* ✅ LEGENDA CORRIGIDA */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">
          💡 Como Interpretar
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-800">
          <div className="space-y-1">
            <div><span className="font-bold">Progressão em {currentKey}:</span> Cifras na tonalidade atual</div>
            <div><span className="font-bold">Análise harmônica:</span> Graus funcionais universais</div>
          </div>
          <div className="space-y-1">
            <div><span className="font-mono font-bold">Cmaj7, Dm7</span> = Cifras específicas</div>
            <div><span className="font-mono font-bold">Imaj7, ii7</span> = Função harmônica</div>
          </div>
        </div>
        
        {/* ✅ Explicação sobre transposição */}
        <div className="mt-3 pt-3 border-t border-blue-300">
          <div className="text-xs text-blue-700">
            <span className="font-semibold">🔄 Transposição:</span> Os graus harmônicos (ii7, V7, Imaj7) são universais. 
            As cifras ({currentKey !== 'C' ? 'Dm7, G7, Cmaj7 em C' : 'Ex: Em Db seriam Ebm7, Ab7, Dbmaj7'}) mudam conforme a tonalidade.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordProgressionOptions;