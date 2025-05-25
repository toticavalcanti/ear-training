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
// ===================================
// src/routes/gamificationRoutes.ts
// ===================================
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Todas as rotas requerem autenticação
router.use(authMiddleware_1.protect);
// ===================================
// ROTA BÁSICA DE TESTE
// ===================================
router.get('/test', (req, res) => {
    res.json({
        message: 'Sistema de gamificação funcionando!',
        timestamp: new Date().toISOString()
    });
});
// ===================================
// SUBMETER EXERCÍCIO COM GAMIFICAÇÃO
// ===================================
router.post('/submit', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const user = req.user;
        const { exerciseId, userAnswer, timeSpent, attempts = 1 } = req.body;
        // Validações básicas
        if (!exerciseId || userAnswer === undefined || !timeSpent) {
            res.status(400).json({
                message: 'Dados obrigatórios: exerciseId, userAnswer, timeSpent'
            });
            return;
        }
        // Import dinâmico para evitar problemas de dependência circular
        const { GamificationService } = await Promise.resolve().then(() => __importStar(require('../services/gamificationService')));
        const Exercise = (await Promise.resolve().then(() => __importStar(require('../models/Exercise')))).default;
        // Buscar exercício
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            res.status(404).json({ message: 'Exercício não encontrado' });
            return;
        }
        // Processar através do sistema de gamificação
        const result = await GamificationService.submitExercise(user._id.toString(), exerciseId, exercise.type, exercise.difficulty, userAnswer, exercise.answer, timeSpent, attempts);
        // Resposta
        res.json({
            isCorrect: result.score > 0,
            correctAnswer: exercise.answer,
            score: result.score,
            accuracy: result.accuracy,
            experienceGained: result.experienceGained,
            isPerfect: result.isPerfect,
            levelUp: result.levelUp,
            currentLevel: result.currentLevel,
            totalExperience: result.totalExperience,
            newAchievements: result.newAchievements,
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
}));
// ===================================
// PROGRESSO DO USUÁRIO
// ===================================
router.get('/progress', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const user = req.user;
        const { GamificationService } = await Promise.resolve().then(() => __importStar(require('../services/gamificationService')));
        const progress = await GamificationService.getUserProgress(user._id.toString());
        if (!progress) {
            res.status(404).json({ message: 'Progresso não encontrado' });
            return;
        }
        // Calcular progresso do nível
        const xpForNextLevel = GamificationService.calculateXPForNextLevel(progress.level);
        const xpProgress = progress.experience - Math.pow(progress.level - 1, 2) * 100;
        const xpNeeded = xpForNextLevel - Math.pow(progress.level - 1, 2) * 100;
        res.json({
            level: progress.level,
            experience: progress.experience,
            totalExercises: progress.totalExercises,
            perfectScores: progress.perfectScores,
            averageScore: Math.round(progress.averageScore * 10) / 10,
            streakDays: progress.streakDays,
            levelProgress: {
                current: xpProgress,
                needed: xpNeeded,
                percentage: Math.round((xpProgress / xpNeeded) * 100)
            },
            byType: {
                intervals: progress.intervals,
                rhythmic: progress.rhythmic,
                melodic: progress.melodic,
                progression: progress.progression
            },
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
}));
// ===================================
// ACHIEVEMENTS DO USUÁRIO
// ===================================
router.get('/achievements', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const user = req.user;
        const { GamificationService } = await Promise.resolve().then(() => __importStar(require('../services/gamificationService')));
        const achievements = await GamificationService.getUserAchievements(user._id.toString());
        res.json({
            achievements: {
                unlocked: achievements.unlocked.map((ua) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    return ({
                        id: ((_a = ua.achievementData) === null || _a === void 0 ? void 0 : _a.id) || ua.achievementId,
                        name: ((_b = ua.achievementData) === null || _b === void 0 ? void 0 : _b.name) || 'Achievement',
                        description: ((_c = ua.achievementData) === null || _c === void 0 ? void 0 : _c.description) || '',
                        icon: ((_d = ua.achievementData) === null || _d === void 0 ? void 0 : _d.icon) || '🏆',
                        category: ((_e = ua.achievementData) === null || _e === void 0 ? void 0 : _e.category) || 'progress',
                        rarity: ((_f = ua.achievementData) === null || _f === void 0 ? void 0 : _f.rarity) || 'common',
                        points: ((_g = ua.achievementData) === null || _g === void 0 ? void 0 : _g.points) || 0,
                        unlockedAt: ua.unlockedAt,
                        isNew: ua.isNew
                    });
                }),
                locked: achievements.locked.map((achievement) => ({
                    id: achievement.id,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    category: achievement.category,
                    rarity: achievement.rarity,
                    points: achievement.points,
                    condition: achievement.condition,
                    threshold: achievement.threshold
                }))
            },
            summary: {
                total: achievements.total,
                unlocked: achievements.unlockedCount,
                locked: achievements.total - achievements.unlockedCount,
                completionPercentage: achievements.total > 0 ?
                    Math.round((achievements.unlockedCount / achievements.total) * 100) : 0
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar achievements:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// ===================================
// LEADERBOARD
// ===================================
router.get('/leaderboard', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { limit = 10, period = 'all' } = req.query;
        const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        const validPeriods = ['week', 'month', 'all'];
        const periodStr = validPeriods.includes(period) ?
            period : 'all';
        const { GamificationService } = await Promise.resolve().then(() => __importStar(require('../services/gamificationService')));
        const leaderboard = await GamificationService.getLeaderboard(limitNum, periodStr);
        const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
        // Enriquecer com dados do usuário
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
                    streakDays: entry.streakDays
                };
            }
            catch (error) {
                return {
                    rank: index + 1,
                    userId: entry.userId,
                    name: 'Usuário Anônimo',
                    level: entry.level,
                    experience: entry.experience,
                    averageScore: Math.round(entry.averageScore * 10) / 10
                };
            }
        }));
        res.json({
            leaderboard: enrichedLeaderboard,
            meta: {
                period: periodStr,
                limit: limitNum,
                total: enrichedLeaderboard.length
            }
        });
    }
    catch (error) {
        console.error('Erro ao gerar leaderboard:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
exports.default = router;
