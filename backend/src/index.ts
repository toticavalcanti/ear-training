// src/index.ts - VERSÃO ATUALIZADA COM GOOGLE OAUTH
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

// Configuração - CARREGAR ANTES DE TUDO!
dotenv.config();

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

// 🆕 IMPORTAR CONFIGURAÇÃO PASSPORT APÓS dotenv.config()
import './config/passport';

const app = express();
const PORT = process.env.PORT || 5000;

// ===================================
// MIDDLEWARES
// ===================================

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true // Importante para cookies de sessão
}));

// IMPORTANTE: Configurar webhook do Stripe ANTES do express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// 🆕 CONFIGURAÇÃO DE SESSÃO (necessária para Passport Google OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu-secret-super-seguro-para-sessao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS em produção
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true, // Segurança contra XSS
  }
}));

// 🆕 INICIALIZAR PASSPORT (necessário para Google OAuth)
app.use(passport.initialize());
app.use(passport.session());

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

// ===================================
// CONEXÃO MONGODB
// ===================================

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('✅ Conectado ao MongoDB');
    // Inicializar LLM Service após conexão com BD
    LLMService.initialize(process.env.LLM_PROVIDER || 'groq');
    console.log('✅ LLM Service inicializado');
  })
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// ===================================
// ROTAS
// ===================================

// Rotas existentes
app.use('/api/auth', authRoutes); // Agora inclui Google OAuth!
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);

// NOVAS ROTAS - ADICIONE ESTAS LINHAS:
app.use('/api/gamification', gamificationRoutes);
app.use('/api/admin', adminRoutes);

console.log('✅ Rotas registradas com sucesso!');
console.log('🔐 Google OAuth ativo em /api/auth/google');
console.log('🎮 Sistema de gamificação ativo em /api/gamification');
console.log('⚙️ Painel administrativo em /api/admin');

// Rota de teste de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando corretamente',
    features: {
      gamification: '✅ Sistema de gamificação ativo',
      googleOAuth: '✅ Google OAuth configurado',
      admin: '✅ Painel administrativo ativo',
      llm: '✅ LLM Service ativo'
    },
    timestamp: new Date().toISOString()
  });
});

// ===================================
// PÁGINAS DE PAGAMENTO (existentes)
// ===================================

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

// 🆕 PÁGINAS DE AUTENTICAÇÃO GOOGLE (opcionais para debug)
app.get('/auth/success', (req, res) => {
  const token = req.query.token;
  res.send(`
    <html>
      <head><title>Login Google Sucesso</title></head>
      <body>
        <h1>✅ Login com Google bem-sucedido!</h1>
        <p>Token JWT: <code>${token}</code></p>
        <script>
          // Redirecionar para frontend com token
          if (window.opener) {
            window.opener.postMessage({ token: '${token}' }, '*');
            window.close();
          } else {
            // Ou redirecionar diretamente
            window.location.href = '${process.env.CORS_ORIGIN}/dashboard?token=${token}';
          }
        </script>
      </body>
    </html>
  `);
});

app.get('/auth/error', (req, res) => {
  const message = req.query.message || 'Erro desconhecido';
  res.send(`
    <html>
      <head><title>Erro no Login Google</title></head>
      <body>
        <h1>❌ Erro no login com Google</h1>
        <p>Mensagem: ${message}</p>
        <a href="${process.env.CORS_ORIGIN}/login">Tentar novamente</a>
      </body>
    </html>
  `);
});

// ===================================
// INICIAR SERVIDOR
// ===================================

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log('');
  console.log('📋 ROTAS DISPONÍVEIS:');
  console.log(`   🔐 Google OAuth: http://localhost:${PORT}/api/auth/google`);
  console.log(`   🎮 Gamificação: http://localhost:${PORT}/api/gamification/test`);
  console.log(`   ⚙️ Admin: http://localhost:${PORT}/api/admin/achievements`);
  console.log(`   ❤️ Health: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🔧 CONFIGURAÇÕES:');
  console.log(`   📦 MongoDB: ${process.env.MONGODB_URI ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   🔑 JWT Secret: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   🔒 Session Secret: ${process.env.SESSION_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);
});