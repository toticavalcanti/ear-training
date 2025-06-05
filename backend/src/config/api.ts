// src/config/api.ts - este arquivo centraliza as URLs
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://seu-backend.herokuapp.com' 
  : 'http://localhost:8000';

export const API_ENDPOINTS = {
  GAMIFICATION: {
    PROGRESS: `${API_BASE_URL}/api/gamification/progress`,
    SUBMIT_FRONTEND: `${API_BASE_URL}/api/gamification/submit-frontend`,
    ACHIEVEMENTS: `${API_BASE_URL}/api/gamification/achievements`,
    LEADERBOARD: `${API_BASE_URL}/api/gamification/leaderboard`,
  },
  // Outros endpoints...
};

// Função helper para fazer requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};