// ===================================
// src/hooks/useProgress.ts
// ===================================
import { useState, useEffect } from 'react';
import { fetchProgress } from '@/lib/api';

export interface ProgressData {
  level: number;
  experience: number;
  totalExercises: number;
  perfectScores: number;
  averageScore: number;
  streakDays: number;
  levelProgress: {
    current: number;
    needed: number;
    percentage: number;
  };
  byType: {
    intervals: { completed: number; averageScore: number; bestTime: number; };
    rhythmic: { completed: number; averageScore: number; bestTime: number; };
    melodic: { completed: number; averageScore: number; bestTime: number; };
    progression: { completed: number; averageScore: number; bestTime: number; };
  };
  user: {
    name: string;
    subscription: string;
  };
}

export function useProgress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const result = await fetchProgress();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  return { data, loading, error };
}