"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Middleware para proteger rotas
const protect = async (req, res, next) => {
    try {
        let token;
        // Verificar se o token está no header
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            // Pegar token do header
            token = req.headers.authorization.split(' ')[1];
        }
        // Verificar se o token existe
        if (!token) {
            res.status(401).json({ message: 'Não autorizado, token não encontrado' });
            return;
        }
        // Verificar token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
        // Adicionar usuário à requisição
        const user = await User_1.default.findById(decoded.id).select('-passwordHash');
        if (!user) {
            res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
            return;
        }
        // Adicionar usuário ao request
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
};
exports.protect = protect;
// Adicionar um alias para manter compatibilidade com código existente
exports.authMiddleware = exports.protect;
