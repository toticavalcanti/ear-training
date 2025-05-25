"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.upgradeSubscription = exports.changePassword = exports.updateProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Exercise_1 = __importDefault(require("../models/Exercise")); // Adicionando a importação
const ExerciseHistory_1 = __importDefault(require("../models/ExerciseHistory"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Atualizar perfil do usuário
const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const { name, email } = req.body;
        // Verificar se o email já está em uso (se estiver sendo alterado)
        if (email && email !== user.email) {
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                res.status(400).json({ message: 'Email já está em uso' });
                return;
            }
        }
        // Atualizar os campos
        const updateFields = {};
        if (name)
            updateFields.name = name;
        if (email)
            updateFields.email = email;
        // Atualizar o usuário
        const updatedUser = await User_1.default.findByIdAndUpdate(user._id, updateFields, { new: true, runValidators: true }).select('-passwordHash');
        if (!updatedUser) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
};
exports.updateProfile = updateProfile;
// Alterar senha do usuário
const changePassword = async (req, res) => {
    try {
        const user = req.user;
        const { currentPassword, newPassword } = req.body;
        // Verificar senha atual
        const userWithPassword = await User_1.default.findById(user._id);
        if (!userWithPassword) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        const isMatch = await userWithPassword.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({ message: 'Senha atual incorreta' });
            return;
        }
        // Hash da nova senha
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
        // Atualizar senha
        userWithPassword.passwordHash = passwordHash;
        await userWithPassword.save();
        res.json({ message: 'Senha alterada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ message: 'Erro ao alterar senha' });
    }
};
exports.changePassword = changePassword;
// Atualizar para assinatura premium (placeholder sem integração real com Stripe)
const upgradeSubscription = async (req, res) => {
    try {
        const user = req.user;
        // Para teste: simplesmente atualiza para premium
        // Em produção, você implementaria a integração com Stripe aqui
        const updatedUser = await User_1.default.findByIdAndUpdate(user._id, { subscription: 'premium' }, { new: true }).select('-passwordHash');
        if (!updatedUser) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.json({
            message: 'Assinatura atualizada com sucesso',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        res.status(500).json({ message: 'Erro ao atualizar assinatura' });
    }
};
exports.upgradeSubscription = upgradeSubscription;
// Obter estatísticas do usuário
const getUserStats = async (req, res) => {
    try {
        const user = req.user;
        // Estatísticas gerais
        const totalExercises = await ExerciseHistory_1.default.countDocuments({ user: user._id });
        const correctExercises = await ExerciseHistory_1.default.countDocuments({
            user: user._id,
            isCorrect: true
        });
        // Estatísticas por tipo de exercício
        const stats = {
            overall: {
                total: totalExercises,
                correct: correctExercises,
                accuracy: totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0
            },
            byType: {}
        };
        // Buscar estatísticas por tipo de exercício
        const exerciseTypes = ['interval', 'progression', 'melodic', 'rhythmic'];
        for (const type of exerciseTypes) {
            // Buscar IDs de exercícios deste tipo
            const exerciseList = await Exercise_1.default.find({ type }).select('_id');
            const exerciseIds = exerciseList.map((ex) => ex._id);
            if (exerciseIds.length > 0) {
                const typeTotal = await ExerciseHistory_1.default.countDocuments({
                    user: user._id,
                    exercise: { $in: exerciseIds }
                });
                const typeCorrect = await ExerciseHistory_1.default.countDocuments({
                    user: user._id,
                    exercise: { $in: exerciseIds },
                    isCorrect: true
                });
                stats.byType[type] = {
                    total: typeTotal,
                    correct: typeCorrect,
                    accuracy: typeTotal > 0 ? Math.round((typeCorrect / typeTotal) * 100) : 0
                };
            }
            else {
                stats.byType[type] = {
                    total: 0,
                    correct: 0,
                    accuracy: 0
                };
            }
        }
        // Adicionar assinatura ao retorno
        const userInfo = {
            name: user.name,
            email: user.email,
            subscription: user.subscription,
            lastActive: user.lastActive
        };
        res.json({
            user: userInfo,
            stats
        });
    }
    catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ message: 'Erro ao obter estatísticas' });
    }
};
exports.getUserStats = getUserStats;
