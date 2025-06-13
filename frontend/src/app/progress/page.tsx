// ===================================
// src/app/progress/page.tsx
// ===================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchProgress } from '@/lib/api';

interface ProgressData {
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

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Verificar se tem token
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError('Faça login para ver seu progresso');
          setLoading(false);
          return;
        }

        const progressData = await fetchProgress();
        setData(progressData);
      } catch (err) {
        console.error('Erro ao carregar progresso:', err);
        if (err instanceof Error) {
          if (err.message.includes('401') || err.message.includes('Token')) {
            setError('Sessão expirada. Faça login novamente.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Erro ao conectar com o servidor');
        }
      } finally {
        setLoading(false);
      }
    };

    // Só executar no cliente
    if (typeof window !== 'undefined') {
      loadProgress();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Carregando progresso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-bold mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {/* Debug Info */}
          <div className="bg-gray-100 p-3 rounded text-sm text-left mb-4">
            <div><strong>Token:</strong> {localStorage.getItem('token') ? 'Presente' : 'Ausente'}</div>
            <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded">
              Voltar ao Início
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Sem Dados</h2>
          <p className="text-gray-600 mb-4">Complete alguns exercícios primeiro!</p>
          <Link href="/exercises/intervals" className="bg-indigo-600 text-white px-4 py-2 rounded">
            Começar Exercícios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          ← Voltar
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Progresso</h1>
        <p className="text-gray-600">Olá, {data.user.name}!</p>
      </div>

      {/* Level Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Nível {data.level}</h2>
            <p className="text-gray-600">{data.experience} XP</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {data.levelProgress.current} / {data.levelProgress.needed} XP
            </p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-indigo-600 h-4 rounded-full"
            style={{ width: `${data.levelProgress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-xl font-bold">{data.totalExercises}</div>
          <div className="text-sm text-gray-600">Exercícios</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-2">⭐</div>
          <div className="text-xl font-bold">{data.perfectScores}</div>
          <div className="text-sm text-gray-600">Perfeitos</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-xl font-bold">{data.averageScore.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Média</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-2">🔥</div>
          <div className="text-xl font-bold">{data.streakDays}</div>
          <div className="text-sm text-gray-600">Sequência</div>
        </div>
      </div>

      {/* Exercise Types */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Por Tipo de Exercício</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border rounded p-4">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">🎵</span>
              <span className="font-medium">Intervalos</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Completos: {data.byType.intervals.completed}</div>
              <div>Média: {data.byType.intervals.averageScore.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="border rounded p-4">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">🥁</span>
              <span className="font-medium">Rítmico</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Completos: {data.byType.rhythmic.completed}</div>
              <div>Média: {data.byType.rhythmic.averageScore.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="border rounded p-4">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">🎶</span>
              <span className="font-medium">Melódico</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Completos: {data.byType.melodic.completed}</div>
              <div>Média: {data.byType.melodic.averageScore.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="border rounded p-4">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">🎹</span>
              <span className="font-medium">Progressões</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Completos: {data.byType.progression.completed}</div>
              <div>Média: {data.byType.progression.averageScore.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}