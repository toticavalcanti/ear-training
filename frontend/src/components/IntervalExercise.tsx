// src/components/IntervalExercise.tsx
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import BeautifulPianoKeyboard from './BeautifulPianoKeyboard';

declare global {
  interface Window {
    playPianoNote?: (note: string, frequency: number) => Promise<void>;
  }
}

// =============================================
//  Definição dos intervalos por dificuldade
// =============================================
const intervalsByDifficulty = {
  beginner: [
    { name: 'Unísono', semitones: 0, displayName: 'Unísono (0 semitons)' },
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor (1 semitom)' },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior (2 semitons)' },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor (3 semitons)' },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior (4 semitons)' },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa (7 semitons)' },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava (12 semitons)' }
  ],
  intermediate: [
    { name: 'Unísono', semitones: 0, displayName: 'Unísono' },
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor' },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior' },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor' },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior' },
    { name: 'Quarta justa', semitones: 5, displayName: 'Quarta justa' },
    { name: 'Trítono', semitones: 6, displayName: 'Trítono' },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa' },
    { name: 'Sexta menor', semitones: 8, displayName: 'Sexta menor' },
    { name: 'Sexta maior', semitones: 9, displayName: 'Sexta maior' },
    { name: 'Sétima menor', semitones: 10, displayName: 'Sétima menor' },
    { name: 'Sétima maior', semitones: 11, displayName: 'Sétima maior' },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava' }
  ],
  advanced: [
    { name: 'Unísono', semitones: 0, displayName: 'Unísono' },
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor' },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior' },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor' },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior' },
    { name: 'Quarta justa', semitones: 5, displayName: 'Quarta justa' },
    { name: 'Trítono', semitones: 6, displayName: 'Trítono' },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa' },
    { name: 'Sexta menor', semitones: 8, displayName: 'Sexta menor' },
    { name: 'Sexta maior', semitones: 9, displayName: 'Sexta maior' },
    { name: 'Sétima menor', semitones: 10, displayName: 'Sétima menor' },
    { name: 'Sétima maior', semitones: 11, displayName: 'Sétima maior' },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava' },
    { name: 'Nona menor', semitones: 13, displayName: 'Nona menor' },
    { name: 'Nona maior', semitones: 14, displayName: 'Nona maior' }
  ]
};

interface IntervalExerciseProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => void;
}

const IntervalExercise: React.FC<IntervalExerciseProps> = ({
  difficulty,
  onComplete
}) => {
  // -------------------------------------------------------
  //  Estados do exercício de intervalos
  // -------------------------------------------------------
  const [currentInterval, setCurrentInterval] = useState<{
    name: string;
    semitones: number;
    displayName: string;
  } | null>(null);

  const [baseNote, setBaseNote] = useState<number>(60); // C4
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Obtém o array de intervalos baseado na dificuldade
  const availableIntervals = useMemo(
    () => intervalsByDifficulty[difficulty] || [],
    [difficulty]
  );

  // -------------------------------------------------------
  //  Funções utilitárias
  // -------------------------------------------------------

  // Converte número MIDI em frequência (Hz)
  const midiToFrequency = useCallback((midi: number): number => {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }, []);

  // Converte número MIDI em nome da nota (ex: 60 -> "C4")
  const getNoteNameFromMidi = useCallback((midiNote: number): string => {
    const noteNames = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B'
    ];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
  }, []);

  // -------------------------------------------------------
  //  Função que toca o intervalo
  // -------------------------------------------------------
  const playInterval = useCallback(async () => {
    if (!currentInterval) return;

    setIsPlaying(true);

    try {
      const baseName = getNoteNameFromMidi(baseNote);
      const topName = getNoteNameFromMidi(baseNote + currentInterval.semitones);

      const baseFreq = midiToFrequency(baseNote);
      const topFreq = midiToFrequency(baseNote + currentInterval.semitones);

      console.log(`🎵 Tocando intervalo: ${baseName} → ${topName}`);

      // Verificar se a função do piano está disponível
      if (typeof window.playPianoNote === 'function') {
        // Tocar primeira nota
        await window.playPianoNote(baseName, baseFreq);

        // Após 1.2s, toca a segunda nota
        setTimeout(async () => {
          if (typeof window.playPianoNote === 'function') {
            await window.playPianoNote(topName, topFreq);
          }
          setTimeout(() => setIsPlaying(false), 800);
        }, 1200);
      } else {
        console.error('❌ Função playPianoNote não está disponível no window');
        setIsPlaying(false);
      }

    } catch (err) {
      console.error('❌ Erro ao tocar intervalo:', err);
      setIsPlaying(false);
    }
  }, [baseNote, currentInterval, getNoteNameFromMidi, midiToFrequency]);

  // -------------------------------------------------------
  //  Gera um novo exercício aleatório
  // -------------------------------------------------------
  const generateNewExercise = useCallback(() => {
    if (availableIntervals.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableIntervals.length);
    const randomInterval = availableIntervals[randomIndex];
    const maxBaseNote = 84 - randomInterval.semitones; // Até C6
    const minBaseNote = 48; // C3
    const randomBaseNote = minBaseNote + Math.floor(Math.random() * (maxBaseNote - minBaseNote + 1));

    setCurrentInterval(randomInterval);
    setBaseNote(randomBaseNote);
    setUserAnswer('');
    setShowResult(false);
    setStartTime(Date.now());

    console.log(`🎯 Novo exercício: ${randomInterval.displayName} a partir de ${getNoteNameFromMidi(randomBaseNote)}`);
  }, [availableIntervals, getNoteNameFromMidi]);

  // -------------------------------------------------------
  //  Verifica a resposta do usuário
  // -------------------------------------------------------
  const checkAnswer = useCallback(() => {
    if (!currentInterval || !userAnswer) return;
    const correct = userAnswer === currentInterval.name;
    const timeSpent = Date.now() - startTime;

    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    if (correct) {
      setScore(prev => prev + 1);
    }
    if (onComplete) {
      onComplete({
        correct,
        userAnswer,
        expected: currentInterval.name,
        timeSpent
      });
    }
  }, [currentInterval, onComplete, startTime, userAnswer]);

  // Próxima questão
  const nextQuestion = useCallback(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // -------------------------------------------------------
  //  Ao montar: gera o primeiro exercício
  // -------------------------------------------------------
  useEffect(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // -------------------------------------------------------
  //  Se ainda não houver um intervalo definido, mostra loading
  // -------------------------------------------------------
  if (!currentInterval) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-gray-600">Preparando exercício...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg space-y-6">
      {/* ====================================== */}
      {/*      Cabeçalho do Exercício          */}
      {/* ====================================== */}
      <div className="text-center">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Identificação de Intervalos
          </h2>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            Pontuação: {score}/{totalQuestions}{' '}
            {totalQuestions > 0
              ? `(${Math.round((score / totalQuestions) * 100)}%)`
              : ''}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Dificuldade:</strong>{' '}
            {difficulty === 'beginner'
              ? 'Iniciante'
              : difficulty === 'intermediate'
              ? 'Intermediário'
              : 'Avançado'}
          </p>
          <p className="text-blue-700 text-sm mt-1">
            Ouça o intervalo e identifique qual tipo é. Use o piano para experimentar.
          </p>
        </div>
      </div>

      {/* ====================================== */}
      {/*     Exercício Atual e Botão          */}
      {/* ====================================== */}
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">🎵 Exercício Atual</h3>
          <button
            onClick={playInterval}
            disabled={isPlaying}
            className={`w-full py-3 sm:py-4 px-6 rounded-lg font-semibold text-base sm:text-lg transition-colors ${
              isPlaying
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isPlaying
              ? '🎵 Tocando...'
              : '🎵 Tocar Intervalo'}
          </button>
          <div className="mt-3 text-center text-sm text-gray-600">
            Clique para ouvir o intervalo (primeira nota → segunda nota)
          </div>
        </div>

        {/* ====================================== */}
        {/*      Lista de Opções de Resposta      */}
        {/* ====================================== */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Qual intervalo você ouviu?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableIntervals.map((interval) => (
              <button
                key={interval.name}
                onClick={() => setUserAnswer(interval.name)}
                className={`p-3 sm:p-4 rounded-lg text-left transition-colors ${
                  userAnswer === interval.name
                    ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-800'
                    : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {interval.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* ====================================== */}
        {/*         Botão Confirmar Resposta       */}
        {/* ====================================== */}
        {userAnswer && !showResult && (
          <button
            onClick={checkAnswer}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            ✅ Confirmar Resposta
          </button>
        )}

        {/* ====================================== */}
        {/*         Exibição do Resultado        */}
        {/* ====================================== */}
        {showResult && (
          <div
            className={`p-4 rounded-lg ${
              isCorrect
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div
              className={`font-semibold ${
                isCorrect ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {isCorrect ? '✅ Correto!' : '❌ Incorreto'}
            </div>
            <div
              className={`text-sm mt-1 ${
                isCorrect ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {isCorrect
                ? `Muito bem! Era realmente ${currentInterval.displayName}.`
                : `A resposta correta era: ${currentInterval.displayName}`}
            </div>
            <button
              onClick={nextQuestion}
              className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ➡️ Próximo Exercício
            </button>
          </div>
        )}

        {/* ====================================== */}
        {/*      Exibe o Piano Virtual abaixo     */}
        {/* ====================================== */}
        <div className="border-t border-gray-200 pt-6">
          <BeautifulPianoKeyboard />
        </div>
      </div>
    </div>
  );
};

export default IntervalExercise;