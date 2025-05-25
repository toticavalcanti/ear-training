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
// src/routes/adminRoutes.ts
// ===================================
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Middleware de autenticação
router.use(authMiddleware_1.protect);
// Middleware de autorização admin (simplificado)
const requireAdmin = (req, res, next) => {
    const user = req.user;
    // Para desenvolvimento ou usuário de teste
    if (user.email === 'teste@exemplo.com' || process.env.NODE_ENV === 'development') {
        next();
    }
    else {
        res.status(403).json({
            message: 'Acesso negado. Privilégios de administrador necessários.'
        });
    }
};
router.use(requireAdmin);
// ===================================
// POPULAR ACHIEVEMENTS
// ===================================
router.post('/seed-achievements', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const Achievement = (await Promise.resolve().then(() => __importStar(require('../models/Achievement')))).default;
        // Achievements básicos para começar
        const basicAchievements = [
            {
                id: 'first_steps',
                name: 'Primeiros Passos',
                description: 'Complete seu primeiro exercício',
                icon: '🎯',
                category: 'progress',
                condition: 'total_exercises',
                threshold: 1,
                points: 10,
                rarity: 'common',
                isActive: true
            },
            {
                id: 'getting_started',
                name: 'Começando Bem',
                description: 'Complete 5 exercícios',
                icon: '🚀',
                category: 'progress',
                condition: 'total_exercises',
                threshold: 5,
                points: 25,
                rarity: 'common',
                isActive: true
            },
            {
                id: 'first_perfect',
                name: 'Primeira Perfeição',
                description: 'Obtenha seu primeiro score perfeito',
                icon: '⭐',
                category: 'mastery',
                condition: 'perfect_scores',
                threshold: 1,
                points: 20,
                rarity: 'common',
                isActive: true
            },
            {
                id: 'daily_habit',
                name: 'Hábito Diário',
                description: 'Pratique por 3 dias consecutivos',
                icon: '🔥',
                category: 'streak',
                condition: 'streak_days',
                threshold: 3,
                points: 30,
                rarity: 'common',
                isActive: true
            },
            {
                id: 'level_5',
                name: 'Novato Graduado',
                description: 'Alcance o nível 5',
                icon: '🎓',
                category: 'progress',
                condition: 'reach_level',
                threshold: 5,
                points: 50,
                rarity: 'common',
                isActive: true
            }
        ];
        // Verificar se já existem
        const existingCount = await Achievement.countDocuments();
        if (existingCount > 0 && req.query.force !== 'true') {
            res.json({
                message: `⚠️ Já existem ${existingCount} achievements. Use ?force=true para substituir.`,
                existing: existingCount
            });
            return;
        }
        // Deletar existentes se force=true
        if (req.query.force === 'true') {
            await Achievement.deleteMany({});
        }
        // Inserir novos
        const result = await Achievement.insertMany(basicAchievements);
        res.json({
            message: '✅ Achievements populados com sucesso!',
            count: result.length,
            achievements: result.map(a => ({
                id: a.id,
                name: a.name,
                category: a.category,
                points: a.points
            }))
        });
    }
    catch (error) {
        console.error('Erro ao popular achievements:', error);
        res.status(500).json({
            message: 'Erro ao popular achievements',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
}));
// ===================================
// LISTAR ACHIEVEMENTS
// ===================================
router.get('/achievements', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const Achievement = (await Promise.resolve().then(() => __importStar(require('../models/Achievement')))).default;
        const achievements = await Achievement.find({}).sort({ category: 1, points: 1 });
        res.json({
            total: achievements.length,
            achievements: achievements.map(a => ({
                id: a.id,
                name: a.name,
                description: a.description,
                icon: a.icon,
                category: a.category,
                condition: a.condition,
                threshold: a.threshold,
                points: a.points,
                rarity: a.rarity,
                isActive: a.isActive
            }))
        });
    }
    catch (error) {
        console.error('Erro ao listar achievements:', error);
        res.status(500).json({ message: 'Erro ao listar achievements' });
    }
}));
// ===================================
// ESTATÍSTICAS DO SISTEMA
// ===================================
router.get('/stats', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const [User, UserProgress, UserScore, Achievement] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/User'))).then(m => m.default),
            Promise.resolve().then(() => __importStar(require('../models/UserProgress'))).then(m => m.default),
            Promise.resolve().then(() => __importStar(require('../models/UserScore'))).then(m => m.default),
            Promise.resolve().then(() => __importStar(require('../models/Achievement'))).then(m => m.default)
        ]);
        const [totalUsers, totalProgress, totalScores, totalAchievements] = await Promise.all([
            User.countDocuments(),
            UserProgress.countDocuments(),
            UserScore.countDocuments(),
            Achievement.countDocuments()
        ]);
        res.json({
            overview: {
                totalUsers,
                usersWithProgress: totalProgress,
                totalExercisesCompleted: totalScores,
                availableAchievements: totalAchievements
            },
            generatedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Erro ao gerar estatísticas:', error);
        res.status(500).json({ message: 'Erro ao gerar estatísticas' });
    }
}));
exports.default = router;
