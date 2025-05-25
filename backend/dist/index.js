"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts - VERSÃO ATUALIZADA SIMPLES
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Rotas existentes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const stripeRoutes_1 = __importDefault(require("./routes/stripeRoutes"));
// NOVAS ROTAS - ADICIONE ESTAS LINHAS:
const gamificationRoutes_1 = __importDefault(require("./routes/gamificationRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
// LLM Service
const llm_1 = require("./services/llm");
// Configuração
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
// IMPORTANTE: Configurar webhook do Stripe ANTES do express.json()
app.use('/api/stripe/webhook', express_1.default.raw({ type: 'application/json' }));
// Middleware JSON para as demais rotas
app.use(express_1.default.json());
// Conexão com o MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || '')
    .then(() => {
    console.log('Conectado ao MongoDB');
    // Inicializar LLM Service após conexão com BD
    llm_1.LLMService.initialize(process.env.LLM_PROVIDER || 'groq');
})
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));
// Rotas existentes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/exercises', exerciseRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/stripe', stripeRoutes_1.default);
// NOVAS ROTAS - ADICIONE ESTAS LINHAS:
app.use('/api/gamification', gamificationRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
console.log('Rotas registradas com sucesso!');
console.log('🎮 Sistema de gamificação ativo em /api/gamification');
console.log('⚙️ Painel administrativo em /api/admin');
// Rota de teste de saúde da API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API funcionando corretamente',
        gamification: '✅ Sistema de gamificação ativo',
        timestamp: new Date().toISOString()
    });
});
// Páginas existentes de pagamento...
app.get('/payment-success', (req, res) => {
    res.send(`
    <html>
      <head><title>Pagamento bem-sucedido</title></head>
      <body>
        <h1>Pagamento bem-sucedido!</h1>
        <p>Sua assinatura premium foi ativada com sucesso.</p>
        <p>Session ID: ${req.query.session_id}</p>
      </body>
    </html>
  `);
});
app.get('/payment-cancelled', (req, res) => {
    res.send(`
    <html>
      <head><title>Pagamento cancelado</title></head>
      <body>
        <h1>Pagamento cancelado</h1>
        <p>Você cancelou o processo de pagamento.</p>
      </body>
    </html>
  `);
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`🎮 Gamificação: http://localhost:${PORT}/api/gamification/test`);
    console.log(`⚙️ Admin: http://localhost:${PORT}/api/admin/achievements`);
    console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
});
