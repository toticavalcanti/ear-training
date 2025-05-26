// frontend/src/types/types.ts
export interface User {
    id: string;
    name?: string; // Name is optional
    email: string;
    // TODO: Adicionar mais campos conforme necessário
    // por exemplo, avatar, preferências, progresso, etc.
    subscription?: 'free' | 'premium'; // Marcar como opcional se nem todos os usuários tiverem
    avatarUrl?: string; // Adicionado para consistência com o backend
    googleId?: string;
    createdAt?: Date; // Tipar como Date
    updatedAt?: Date; // Tipar como Date
    lastActive?: Date; // Tipar como Date
  }