// frontend/src/app/exercises/chord-progressions/page.tsx - VERSÃO CORRIGIDA
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import ChordProgressionDifficultyPage from '@/components/ChordProgressionDifficultyPage';
import ChordProgressionExercise from '@/components/ChordProgressionExercise';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const ChordProgressionsPage: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [showExercise, setShowExercise] = useState<boolean>(false);

  const handleSelectDifficulty = (difficulty: Difficulty) => {
    // Verificar se o usuário tem permissão para o nível
    if ((difficulty === 'intermediate' || difficulty === 'advanced') && user?.subscription !== 'premium') {
      alert('Você precisa de uma assinatura premium para acessar este nível.');
      return;
    }
    
    console.log(`🎯 Nível selecionado: ${difficulty}`);
    console.log(`👤 Usuário: ${user?.email || 'N/A'}`);
    console.log(`💎 Assinatura: ${user?.subscription || 'N/A'}`);
    
    setSelectedDifficulty(difficulty);
    setShowExercise(true);
  };

  const handleBackToSelection = () => {
    console.log('🔙 Voltando para seleção de dificuldade');
    setShowExercise(false);
    setSelectedDifficulty(null);
  };

  const handleExerciseComplete = (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => {
    console.log('🎯 === EXERCÍCIO COMPLETADO ===');
    console.log(`✅ Correto: ${result.correct}`);
    console.log(`📝 Resposta do usuário: "${result.userAnswer}"`);
    console.log(`🎯 Resposta esperada: "${result.expected}"`);
    console.log(`⏱️ Tempo gasto: ${(result.timeSpent / 1000).toFixed(1)}s`);
    console.log(`📊 Nível: ${selectedDifficulty}`);
    
    // Aqui você pode adicionar lógica para:
    // - Salvar estatísticas no banco de dados
    // - Atualizar progresso do usuário
    // - Enviar eventos de analytics
    // - Etc.
  };

  // VALIDAÇÃO: Guarda de Carregamento
  if (isLoading) {
    return (
      <Loading 
        message="🔐 Verificando autenticação..." 
        fullScreen 
      />
    );
  }

  // VALIDAÇÃO: Guarda de Autenticação
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Acesso Restrito</h1>
          <p className="mb-6 text-gray-600">
            Você precisa estar logado para acessar os exercícios de progressões harmônicas.
          </p>
          <div className="space-y-3">
            <Link 
              href="/auth/login" 
              className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              🔑 Fazer Login
            </Link>
            <Link 
              href="/auth/register" 
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              📝 Criar Conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SELEÇÃO DE DIFICULDADE
  if (!showExercise || !selectedDifficulty) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header da página */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎼 Exercícios de Progressões Harmônicas
              </h1>
              <p className="text-gray-600">
                Sistema corrigido • Graus harmônicos puros • Sem mistura
              </p>
              <div className="mt-4 text-sm text-green-600 bg-green-50 rounded-lg p-3 inline-block">
                ✅ <strong>Sistema Corrigido:</strong> Agora trabalha exclusivamente com graus harmônicos
              </div>
            </div>
          </div>
        </div>

        {/* Informações do usuário */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">👤</div>
                <div>
                  <div className="font-medium text-blue-900">
                    Olá, {user?.name || user?.email || 'Usuário'}!
                  </div>
                  <div className="text-sm text-blue-700">
                    Assinatura: <span className="font-medium capitalize">{user?.subscription || 'Gratuita'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-700">Sistema</div>
                <div className="font-bold text-green-600">✅ Corrigido</div>
              </div>
            </div>
          </div>
        </div>

        {/* Componente de seleção de dificuldade */}
        <div className="max-w-4xl mx-auto px-4">
          <ChordProgressionDifficultyPage 
            onSelectDifficulty={handleSelectDifficulty}
          />
        </div>

        {/* Informações sobre as correções */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              🔧 O que foi corrigido?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✅</div>
                  <div>
                    <div className="font-medium text-purple-900">Sistema puramente baseado em graus</div>
                    <div className="text-sm text-purple-700">Não converte mais cifras automaticamente</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✅</div>
                  <div>
                    <div className="font-medium text-purple-900">Transposição matemática</div>
                    <div className="text-sm text-purple-700">Graus → Intervalos → Cifras na tonalidade alvo</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✅</div>
                  <div>
                    <div className="font-medium text-purple-900">Separação clara</div>
                    <div className="text-sm text-purple-700">Graus para análise, cifras para exibição</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✅</div>
                  <div>
                    <div className="font-medium text-purple-900">Voice leading otimizado</div>
                    <div className="text-sm text-purple-700">Reprodução natural com todas as sétimas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EXERCÍCIO ATIVO
  return (
    <div className="relative min-h-screen bg-gray-50">
      
      {/* Botão de volta posicionado absolutamente */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={handleBackToSelection}
          className="bg-white shadow-lg rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Voltar</span>
        </button>
      </div>

      {/* Badge de sistema corrigido */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          ✅ Sistema Corrigido
        </div>
      </div>
      
      {/* Componente do exercício */}
      <ChordProgressionExercise
        key={`${selectedDifficulty}-corrected`} // Key única para forçar recriação
        difficulty={selectedDifficulty}
        onComplete={handleExerciseComplete}
      />
    </div>
  );
};

export default ChordProgressionsPage;