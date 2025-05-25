// src/index.ts - VERSÃO ATUALIZADA SIMPLES
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Rotas existentes
import authRoutes from './routes/authRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import userRoutes from './routes/userRoutes';
import stripeRoutes from './routes/stripeRoutes';

// NOVAS ROTAS - ADICIONE ESTAS LINHAS:
import gamificationRoutes from './routes/gamificationRoutes';
import adminRoutes from './routes/adminRoutes';

// LLM Service
import { LLMService } from './services/llm';

// Configuração
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// IMPORTANTE: Configurar webhook do Stripe ANTES do express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// CORREÇÃO: Middleware JSON para as demais rotas com mais opções
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// DEBUG MIDDLEWARE - ADICIONE ESTA LINHA TEMPORARIAMENTE
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    contentType: req.get('Content-Type')
  });
  next();
});

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('Conectado ao MongoDB');
    // Inicializar LLM Service após conexão com BD
    LLMService.initialize(process.env.LLM_PROVIDER || 'groq');
  })
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas existentes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);

// NOVAS ROTAS - ADICIONE ESTAS LINHAS:
app.use('/api/gamification', gamificationRoutes);
app.use('/api/admin', adminRoutes);

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