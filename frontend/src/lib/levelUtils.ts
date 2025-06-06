// src/lib/levelUtils.ts

/**
 * Calcula o XP necessário para alcançar um nível específico
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  
  // Fórmula progressiva: XP = 100 * level^1.5
  // Nível 2: 283 XP, Nível 3: 520 XP, Nível 4: 800 XP, etc.
  return Math.round(100 * Math.pow(level, 1.5));
}

/**
 * Calcula o XP necessário para o próximo nível
 */
export function getXpForNextLevel(currentLevel: number): number {
  return getXpForLevel(currentLevel + 1);
}

/**
 * Calcula o nível baseado no XP total
 */
export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  
  while (getXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  
  return level;
}

/**
 * Calcula a porcentagem de progresso para o próximo nível
 */
export function getLevelProgress(currentXp: number, currentLevel: number): number {
  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  const progressXp = currentXp - currentLevelXp;
  const neededXp = nextLevelXp - currentLevelXp;
  
  if (neededXp <= 0) return 100;
  
  return Math.min(100, Math.max(0, (progressXp / neededXp) * 100));
}

/**
 * Calcula quanto XP falta para o próximo nível
 */
export function getXpToNextLevel(currentXp: number, currentLevel: number): number {
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  return Math.max(0, nextLevelXp - currentXp);
}

/**
 * Informações detalhadas do nível atual
 */
export function getLevelInfo(currentXp: number) {
  const currentLevel = getLevelFromXp(currentXp);
  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  const progressXp = currentXp - currentLevelXp;
  const neededXp = nextLevelXp - currentLevelXp;
  const progressPercentage = getLevelProgress(currentXp, currentLevel);
  
  return {
    currentLevel,
    currentXp,
    currentLevelXp,
    nextLevelXp,
    progressXp,
    neededXp,
    progressPercentage,
    xpToNextLevel: getXpToNextLevel(currentXp, currentLevel),
  };
}

/**
 * Verifica se houve level up
 */
export function checkLevelUp(oldXp: number, newXp: number): {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
} {
  const oldLevel = getLevelFromXp(oldXp);
  const newLevel = getLevelFromXp(newXp);
  
  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
}

/**
 * Lista de marcos de XP importantes
 */
export const LEVEL_MILESTONES = [
  { level: 1, xp: 0, title: 'Iniciante' },
  { level: 2, xp: 283, title: 'Explorador' },
  { level: 5, xp: 1118, title: 'Estudante' },
  { level: 10, xp: 3162, title: 'Praticante' },
  { level: 20, xp: 8944, title: 'Músico' },
  { level: 50, xp: 35355, title: 'Virtuoso' },
  { level: 100, xp: 100000, title: 'Mestre' },
];