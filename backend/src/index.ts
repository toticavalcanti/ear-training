// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Rotas
import authRoutes from './routes/authRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import userRoutes from './routes/userRoutes';
import stripeRoutes from './routes/stripeRoutes';
// Removida a importação de testRoutes

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

// Middleware JSON para as demais rotas
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);
// Removida a linha app.use('/api/test', testRoutes);

console.log('Rotas registradas com sucesso!');

// Páginas de teste para redirecionamento após pagamento
app.get('/payment-success', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Pagamento bem-sucedido</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            max-width: 600px;
            margin: 0 auto;
          }
          h1 {
            color: #4CAF50;
          }
          .session-id {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            margin: 20px 0;
          }
          a {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Pagamento bem-sucedido!</h1>
        <p>Sua assinatura premium foi ativada com sucesso.</p>
        <div class="session-id">Session ID: ${req.query.session_id}</div>
        <p>Você agora tem acesso a todos os recursos premium do Ear Training.</p>
        <a href="/">Voltar ao início</a>
      </body>
    </html>
  `);
});

app.get('/payment-cancelled', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Pagamento cancelado</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            max-width: 600px;
            margin: 0 auto;
          }
          h1 {
            color: #f44336;
          }
          a {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
          }
          .secondary {
            background-color: transparent;
            color: #4f46e5;
            border: 1px solid #4f46e5;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Pagamento cancelado</h1>
        <p>Você cancelou o processo de pagamento.</p>
        <p>Se encontrou algum problema ou tem dúvidas, entre em contato conosco.</p>
        <div>
          <a href="/api/stripe/test-checkout">Tentar novamente</a>
          <a href="/" class="secondary">Voltar ao início</a>
        </div>
      </body>
    </html>
  `);
});

// Rota de teste de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando corretamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});