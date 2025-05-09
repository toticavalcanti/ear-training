'use client';

import Link from 'next/link';
import IntervalExercise from '@/components/IntervalExercise';

export default function IntervalsPage() {
  const handleExerciseComplete = (result: { 
    correct: boolean; 
    userAnswer: string; 
    expected: string; 
    timeSpent: number 
  }) => {
    console.log('Exercise result:', result);
    // Aqui você pode implementar lógica para salvar resultados no backend
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-4">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          ← Voltar para a página inicial
        </Link>
      </div>
      
      <IntervalExercise 
        difficulty="beginner"
        onComplete={handleExerciseComplete}
      />
    </div>
  );
}