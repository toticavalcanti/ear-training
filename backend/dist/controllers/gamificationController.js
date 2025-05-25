"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = exports.getUserRank = exports.getLeaderboard = exports.markAchievementsAsViewed = exports.getUserAchievements = exports.getUserProgress = exports.submitExercise = void 0;
const gamificationService_1 = require("../services/gamificationService");
const Exercise_1 = __importDefault(require("../models/Exercise"));
// ===================================
// SUBMISSÃO DE EXERCÍCIOS
// ===================================
/**
 * Submeter exercício com sistema de gamificação completo
 */
const submitExercise = async (req, res) => {
    try {
        const user = req.user;
        const { exerciseId, userAnswer, timeSpent, attempts = 1 } = req.body;
        // Validar dados obrigatórios
        if (!exerciseId || userAnswer === undefined || !timeSpent) {
            res.status(400).json({
                message: 'Dados obrigatórios: exerciseId, userAnswer, timeSpent'
            });
            return;
        }
        // Buscar o exercício para obter dados completos
        const exercise = await Exercise_1.default.findById(exerciseId);
        if (!exercise) {
            res.status(404).json({ message: 'Exercício não encontrado' });
            return;
        }
        // Verificar acesso premium se necessário
        if (exercise.requiresPremium && user.subscription !== 'premium') {
            res.status(403).json({
                message: 'Assinatura premium necessária para este exercício'
            });
            return;
        }
        console.log(`🎮 Submetendo exercício ${exerciseId} para usuário ${user._id}`);
        // Processar através do sistema de gamificação
        const result = await gamificationService_1.GamificationService.submitExercise(user._id.toString(), exerciseId, exercise.type, exercise.difficulty, userAnswer, exercise.answer, timeSpent, attempts);
        // Resposta completa com todos os dados de gamificação
        res.json({
            // Resultado básico
            isCorrect: result.score > 0,
            correctAnswer: exercise.answer,
            // Dados de gamificação
            score: result.score,
            accuracy: result.accuracy,
            experienceGained: result.experienceGained,
            isPerfect: result.isPerfect,
            // Progressão
            levelUp: result.levelUp,
            currentLevel: result.currentLevel,
            totalExperience: result.totalExperience,
            // Achievements
            newAchievements: result.newAchievements,
            // Mensagens para o frontend
            message: result.isPerfect ?
                `🎉 Perfeito! +${result.experienceGained} XP` :
                result.score > 0 ?
                    `✅ Correto! +${result.experienceGained} XP` :
                    '❌ Tente novamente!'
        });
    }
    catch (error) {
        console.error('Erro ao submeter exercício:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.submitExercise = submitExercise;
// ===================================
// PROGRESSO DO USUÁRIO
// ===================================
/**
 * Obter progresso detalhado do usuário atual
 */
const getUserProgress = async (req, res) => {
    try {
        const user = req.user;
        console.log(`📊 Buscando progresso para usuário ${user._id}`);
        const progress = await gamificationService_1.GamificationService.getUserProgress(user._id.toString());
        if (!progress) {
            res.status(404).json({ message: 'Progresso não encontrado' });
            return;
        }
        // Calcular XP necessário para próximo nível
        const xpForNextLevel = gamificationService_1.GamificationService.calculateXPForNextLevel(progress.level);
        const xpProgress = progress.experience - Math.pow(progress.level - 1, 2) * 100;
        const xpNeeded = xpForNextLevel - Math.pow(progress.level - 1, 2) * 100;
        res.json({
            // Informações básicas
            level: progress.level,
            experience: progress.experience,
            totalExercises: progress.totalExercises,
            perfectScores: progress.perfectScores,
            averageScore: Math.round(progress.averageScore * 10) / 10,
            streakDays: progress.streakDays,
            // Progresso do nível atual
            levelProgress: {
                current: xpProgress,
                needed: xpNeeded,
                percentage: Math.round((xpProgress / xpNeeded) * 100)
            },
            // Estatísticas por tipo de exercício
            byType: {
                intervals: progress.intervals,
                rhythmic: progress.rhythmic,
                melodic: progress.melodic,
                progression: progress.progression
            },
            // Estatísticas por dificuldade
            byDifficulty: {
                beginner: progress.beginner,
                intermediate: progress.intermediate,
                advanced: progress.advanced
            },
            // Informações de tempo
            lastActivityDate: progress.lastActivityDate,
            // Dados do usuário
            user: {
                name: user.name,
                subscription: user.subscription
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar progresso:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getUserProgress = getUserProgress;
// ===================================
// ACHIEVEMENTS
// ===================================
/**
 * Obter todos os achievements do usuário (desbloqueados e bloqueados)
 */
const getUserAchievements = async (req, res) => {
    try {
        const user = req.user;
        console.log(`🏆 Buscando achievements para usuário ${user._id}`);
        const achievements = await gamificationService_1.GamificationService.getUserAchievements(user._id.toString());
        // Processar achievements desbloqueados
        const unlockedFormatted = achievements.unlocked.map(ua => {
            const achievementData = ua.achievementData;
            return {
                id: (achievementData === null || achievementData === void 0 ? void 0 : achievementData.id) || ua.achievementId,
                name: (achievementData === null || achievementData === void 0 ? void 0 : achievementData.name) || 'Achievement',
                description: (achievementData === null || achievementData === void 0 ? void 0 : achievementData.description) || '',
                icon: (achievementData === null || achievementData === void 0 ? void 0 : achievementData.icon) || '🏆',
                category: (achievementData === null || achievementData === void 0 ? void 0 : achievementData.category) || 'progress',
                rarity: (achievementData === null || achievementData === void 0 ? void 0 : achievementData.rarity) || 'common',
                points: (achievementData === null || achievementData === void 0 ? void 0 : achievementData.points) || 0,
                unlockedAt: ua.unlockedAt,
                isNew: ua.isNew
            };
        });
        // Processar achievements bloqueados
        const lockedFormatted = achievements.locked.map(achievement => ({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            rarity: achievement.rarity,
            points: achievement.points,
            condition: achievement.condition,
            threshold: achievement.threshold,
            progress: 0 // TODO: calcular progresso atual baseado no userProgress
        }));
        // Calcular total de pontos desbloqueados
        const totalPoints = unlockedFormatted.reduce((sum, ua) => sum + ua.points, 0);
        res.json({
            achievements: {
                unlocked: unlockedFormatted,
                locked: lockedFormatted
            },
            summary: {
                total: achievements.total,
                unlocked: achievements.unlockedCount,
                locked: achievements.total - achievements.unlockedCount,
                completionPercentage: achievements.total > 0 ?
                    Math.round((achievements.unlockedCount / achievements.total) * 100) : 0,
                totalPoints: totalPoints
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar achievements:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getUserAchievements = getUserAchievements;
/**
 * Marcar achievements como visualizados (remover flag "isNew")
 */
const markAchievementsAsViewed = async (req, res) => {
    try {
        const user = req.user;
        const { achievementIds } = req.body;
        if (!Array.isArray(achievementIds)) {
            res.status(400).json({ message: 'achievementIds deve ser um array' });
            return;
        }
        // Importar modelo aqui para evitar dependência circular
        const UserAchievement = (await Promise.resolve().then(() => __importStar(require('../models/UserAchievement')))).default;
        // Atualizar flag isNew para false
        await UserAchievement.updateMany({
            userId: user._id.toString(),
            achievementId: { $in: achievementIds },
            isNew: true
        }, {
            isNew: false
        });
        res.json({
            message: 'Achievements marcados como visualizados',
            updatedCount: achievementIds.length
        });
    }
    catch (error) {
        console.error('Erro ao marcar achievements:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.markAchievementsAsViewed = markAchievementsAsViewed;
// ===================================
// LEADERBOARD E RANKINGS
// ===================================
/**
 * Obter leaderboard de usuários
 */
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, period = 'all' } = req.query;
        // Validar parâmetros
        const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        const validPeriods = ['week', 'month', 'all'];
        const periodStr = validPeriods.includes(period) ?
            period : 'all';
        console.log(`🏅 Gerando leaderboard: ${limitNum} usuários, período: ${periodStr}`);
        const leaderboard = await gamificationService_1.GamificationService.getLeaderboard(limitNum, periodStr);
        // Importar modelo User para buscar nomes
        const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
        // Enriquecer dados do leaderboard com informações do usuário
        const enrichedLeaderboard = await Promise.all(leaderboard.map(async (entry, index) => {
            try {
                const user = await User.findById(entry.userId).select('name');
                return {
                    rank: index + 1,
                    userId: entry.userId,
                    name: (user === null || user === void 0 ? void 0 : user.name) || 'Usuário Anônimo',
                    level: entry.level,
                    experience: entry.experience,
                    averageScore: Math.round(entry.averageScore * 10) / 10,
                    totalExercises: entry.totalExercises,
                    perfectScores: entry.perfectScores,
                    streakDays: entry.streakDays,
                    // Calcular estatísticas derivadas
                    perfectPercentage: entry.totalExercises > 0 ?
                        Math.round((entry.perfectScores / entry.totalExercises) * 100) : 0
                };
            }
            catch (error) {
                console.error(`Erro ao buscar usuário ${entry.userId}:`, error);
                return {
                    rank: index + 1,
                    userId: entry.userId,
                    name: 'Usuário Anônimo',
                    level: entry.level,
                    experience: entry.experience,
                    averageScore: Math.round(entry.averageScore * 10) / 10,
                    totalExercises: entry.totalExercises,
                    perfectScores: entry.perfectScores,
                    streakDays: entry.streakDays,
                    perfectPercentage: 0
                };
            }
        }));
        res.json({
            leaderboard: enrichedLeaderboard,
            meta: {
                period: periodStr,
                limit: limitNum,
                total: enrichedLeaderboard.length,
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Erro ao gerar leaderboard:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getLeaderboard = getLeaderboard;
/**
 * Obter posição do usuário atual no ranking
 */
const getUserRank = async (req, res) => {
    try {
        const user = req.user;
        const { period = 'all' } = req.query;
        const validPeriods = ['week', 'month', 'all'];
        const periodStr = validPeriods.includes(period) ?
            period : 'all';
        // Buscar leaderboard completo para encontrar posição
        const fullLeaderboard = await gamificationService_1.GamificationService.getLeaderboard(1000, periodStr);
        const userPosition = fullLeaderboard.findIndex(entry => entry.userId === user._id.toString());
        if (userPosition === -1) {
            res.json({
                rank: null,
                message: 'Usuário não encontrado no ranking',
                totalUsers: fullLeaderboard.length
            });
            return;
        }
        const userEntry = fullLeaderboard[userPosition];
        res.json({
            rank: userPosition + 1,
            totalUsers: fullLeaderboard.length,
            percentile: Math.round(((fullLeaderboard.length - userPosition) / fullLeaderboard.length) * 100),
            userData: {
                level: userEntry.level,
                experience: userEntry.experience,
                averageScore: Math.round(userEntry.averageScore * 10) / 10,
                totalExercises: userEntry.totalExercises,
                perfectScores: userEntry.perfectScores,
                streakDays: userEntry.streakDays
            },
            period: periodStr
        });
    }
    catch (error) {
        console.error('Erro ao buscar ranking do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getUserRank = getUserRank;
// ===================================
// ESTATÍSTICAS GERAIS
// ===================================
/**
 * Obter estatísticas gerais da plataforma
 */
const getPlatformStats = async (req, res) => {
    try {
        console.log(`📊 Gerando estatísticas da plataforma`);
        const stats = await gamificationService_1.GamificationService.getPlatformStats();
        // Importar modelo User para informações adicionais
        const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
        // Buscar estatísticas adicionais
        const [premiumUsers, activeUsersLastWeek, topPerformerDetails] = await Promise.all([
            User.countDocuments({ subscription: 'premium' }),
            User.countDocuments({
                lastActive: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }),
            stats.topPerformer ?
                User.findById(stats.topPerformer.userId).select('name') :
                null
        ]);
        res.json({
            users: {
                total: stats.totalUsers,
                premium: premiumUsers,
                free: stats.totalUsers - premiumUsers,
                activeLastWeek: activeUsersLastWeek
            },
            exercises: {
                totalCompleted: stats.totalExercises,
                averageScore: Math.round(stats.averageScore * 10) / 10
            },
            topPerformer: stats.topPerformer ? {
                name: (topPerformerDetails === null || topPerformerDetails === void 0 ? void 0 : topPerformerDetails.name) || 'Usuário Anônimo',
                level: stats.topPerformer.level,
                experience: stats.topPerformer.experience
            } : null,
            generatedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Erro ao gerar estatísticas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getPlatformStats = getPlatformStats;
