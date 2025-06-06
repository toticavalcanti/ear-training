// src/components/AuthDebug.tsx
'use client';

import React, { useState, useEffect } from 'react';

// ✅ TIPOS ESPECÍFICOS PARA CADA RESPOSTA DA API
interface UserMeResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgressResponse {
  totalXp: number;
  currentLevel: number;
  xpForNextLevel: number;
  totalPoints: number;
  totalExercises: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  currentGlobalStreak: number;
  bestGlobalStreak: number;
  lastActiveDate: string;
}

interface UpdateProgressRequest {
  exerciseType: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  averageResponseTime: number;
}

interface UpdateProgressResponse {
  sessionResults: {
    pointsEarned: number;
    xpEarned: number;
    accuracy: number;
    levelUp: boolean;
    newLevel: number;
    newBadges: Array<{ id: string; name: string; description: string; icon: string }>;
  };
  updatedProgress: ProgressResponse;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

// ✅ UNION TYPE PARA TODAS AS POSSÍVEIS RESPOSTAS
type ApiResponse = UserMeResponse | ProgressResponse | UpdateProgressResponse | ErrorResponse | string;

interface TestResult {
  endpoint: string;
  status: number;
  success: boolean;
  data: ApiResponse;
  error?: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  isExpired?: boolean;
  expiresAt?: string;
  error?: string;
}

const AuthDebug: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Buscar token do localStorage
    const savedToken = localStorage.getItem('authToken') || '';
    setToken(savedToken);
  }, []);

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: UpdateProgressRequest): Promise<TestResult> => {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.text();
      let parsedData: ApiResponse;
      try {
        parsedData = JSON.parse(data) as ApiResponse;
      } catch {
        parsedData = data;
      }

      return {
        endpoint,
        status: response.status,
        success: response.ok,
        data: parsedData
      };
    } catch (err) {
      return {
        endpoint,
        status: 0,
        success: false,
        data: '',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      };
    }
  };

  const runAllTests = async (): Promise<void> => {
    setIsLoading(true);
    setTestResults([]);

    const testUpdateBody: UpdateProgressRequest = {
      exerciseType: 'melodic-intervals',
      difficulty: 'beginner',
      totalQuestions: 1,
      correctAnswers: 1,
      timeSpent: 5,
      averageResponseTime: 5
    };

    const tests = [
      () => testEndpoint('/api/users/me'),
      () => testEndpoint('/api/progress/user'),
      () => testEndpoint('/api/progress/update', 'POST', testUpdateBody),
      () => testEndpoint('/api/progress/leaderboard')
    ];

    const results: TestResult[] = [];
    for (const test of tests) {
      const result = await test();
      results.push(result);
      setTestResults([...results]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre testes
    }

    setIsLoading(false);
  };

  const decodeToken = (): TokenPayload | null => {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1])) as { userId: string; email: string; iat: number; exp: number };
      const now = Math.floor(Date.now() / 1000);
      
      return {
        ...payload,
        isExpired: payload.exp < now,
        expiresAt: new Date(payload.exp * 1000).toLocaleString()
      };
    } catch {
      return { 
        userId: '', 
        email: '', 
        iat: 0, 
        exp: 0, 
        error: 'Token inválido' 
      };
    }
  };

  const tokenInfo = decodeToken();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🔍 Debug de Autenticação</h2>

      {/* Token Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📱 Informações do Token</h3>
        
        <div className="space-y-2 text-sm">
          <div>
            <strong>Existe:</strong> {token ? '✅ Sim' : '❌ Não'}
          </div>
          
          {token && (
            <>
              <div>
                <strong>Tamanho:</strong> {token.length} caracteres
              </div>
              
              <div className="break-all">
                <strong>Token:</strong> {token.substring(0, 50)}...
              </div>
              
              {tokenInfo && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <strong>Payload decodificado:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(tokenInfo, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Cole o token aqui para testar"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={() => {
              localStorage.setItem('authToken', token);
              alert('Token salvo no localStorage!');
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar no localStorage
          </button>
        </div>
      </div>

      {/* Testes */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={runAllTests}
            disabled={isLoading || !token}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? '🔄 Testando...' : '🚀 Executar Todos os Testes'}
          </button>
          
          <button
            onClick={() => setTestResults([])}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🗑️ Limpar Resultados
          </button>
        </div>

        {!token && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
            ⚠️ Token não encontrado. Faça login primeiro ou cole um token válido.
          </div>
        )}
      </div>

      {/* Resultados */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📊 Resultados dos Testes</h3>
        
        {testResults.length === 0 && (
          <div className="p-4 bg-gray-50 rounded text-gray-600 text-center">
            Nenhum teste executado ainda
          </div>
        )}

        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.success
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <strong>{result.endpoint}</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {result.status} {result.success ? 'SUCCESS' : 'ERROR'}
                  </span>
                </div>
              </div>
              
              {result.error && (
                <div className="text-red-600 text-sm mb-2">
                  <strong>Erro:</strong> {result.error}
                </div>
              )}
              
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  Ver resposta completa
                </summary>
                <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
                  {typeof result.data === 'string' 
                    ? result.data 
                    : JSON.stringify(result.data, null, 2)
                  }
                </pre>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🔧 Ações Rápidas</h3>
        <div className="flex gap-3">
          <button
            onClick={() => {
              localStorage.removeItem('authToken');
              setToken('');
              alert('Token removido do localStorage!');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🗑️ Limpar Token
          </button>
          
          <button
            onClick={() => {
              const testToken = prompt('Cole um token para testar:');
              if (testToken) {
                setToken(testToken);
                localStorage.setItem('authToken', testToken);
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            📝 Testar Token Específico
          </button>
          
          <button
            onClick={() => {
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            🔐 Ir para Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;