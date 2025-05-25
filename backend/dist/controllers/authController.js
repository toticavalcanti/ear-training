"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
// Registrar novo usuário
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Log para depuração
        console.log('Tentativa de registro:', { email, name });
        // Verificar se usuário já existe
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email já está em uso' });
            return;
        }
        // Hash da senha
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // Criar novo usuário
        const user = await User_1.default.create({
            name,
            email,
            passwordHash,
            subscription: 'free',
        });
        // Gerar token JWT
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '30d' });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                subscription: user.subscription,
            },
        });
    }
    catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
};
exports.register = register;
// Login de usuário
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Log para depuração
        console.log('Tentativa de login:', { email });
        // Buscar usuário
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }
        // Verificar senha
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }
        // Atualizar última atividade
        user.lastActive = new Date();
        await user.save();
        // Gerar token JWT
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '30d' });
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                subscription: user.subscription,
            },
        });
    }
    catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
};
exports.login = login;
// Obter perfil do usuário atual
const getMe = async (req, res) => {
    try {
        // O middleware auth já adiciona req.user
        const user = await User_1.default.findById(req.user.id).select('-passwordHash');
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Erro ao obter perfil:', error);
        res.status(500).json({ message: 'Erro ao obter perfil' });
    }
};
exports.getMe = getMe;
