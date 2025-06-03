// ===================================
// src/lib/api.ts
// ===================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getAuthHeaders() {
  if (typeof window === 'undefined') {
    throw new Error('getAuthHeaders só pode ser chamado no cliente');
  }
  
  // Usar 'jwtToken' em vez de 'token' para consistência com AuthContext
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('Token de autenticação não encontrado');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function fetchProgress() {
  const response = await fetch(`${API_BASE_URL}/gamification/progress`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Remove token inválido
      localStorage.removeItem('jwtToken');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    throw new Error(`Erro ${response.status}: Falha ao carregar progresso`);
  }
  
  return response.json();
}

export async function fetchAchievements() {
  const response = await fetch(`${API_BASE_URL}/gamification/achievements`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('jwtToken');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    throw new Error('Erro ao carregar achievements');
  }
  
  return response.json();
}

export async function fetchLeaderboard() {
  const response = await fetch(`${API_BASE_URL}/gamification/leaderboard`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('jwtToken');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    throw new Error('Erro ao carregar leaderboard');
  }
  
  return response.json();
}

export async function submitExercise(exerciseData: {
  exerciseId: string;
  userAnswer: string;
  timeSpent: number;
  attempts?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/gamification/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(exerciseData)
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('jwtToken');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    throw new Error('Erro ao submeter exercício');
  }
  
  return response.json();
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('jwtToken');
}

export function logout(): void {
  localStorage.removeItem('jwtToken');
  window.location.href = '/';
}