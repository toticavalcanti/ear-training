// src/routes/userRoutes.ts - ARQUIVO COMPLETO
import express, { Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import User from '../models/User';
import bcryptjs from 'bcryptjs';

const router = express.Router();

// Interface para request autenticado
interface AuthRequest extends Request {
  userId?: string;
}

// ===================================
// ROTAS BÁSICAS (LISTAGEM/BUSCA)
// ===================================

// 🧪 ROTA DE TESTE
router.get('/test', (req: Request, res: Response): void => {
  res.json({ 
    message: 'User routes funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/users/test - Teste (público)',
      'GET /api/users - Listar usuários (protegido)', 
      'GET /api/users/:id - Buscar usuário por ID (protegido)',
      'PUT /api/users/profile - Atualizar perfil (protegido)',
      'PUT /api/users/change-password - Alterar senha (protegido)',
      'POST /api/users/upgrade - Upgrade assinatura (protegido)',
      'GET /api/users/stats - Estatísticas do usuário (protegido)'
    ]
  });
});

// 📋 LISTAR TODOS OS USUÁRIOS
router.get('/', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Listando usuários...');
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;

    // Filtro de busca
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription,
      avatar: user.avatar,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isGoogleUser: !!user.googleId,
      hasPassword: !!user.passwordHash
    }));

    console.log(`✅ Encontrados ${users.length} usuários`);

    res.json({
      success: true,
      count: users.length,
      total,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('💥 Erro ao listar usuários:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar usuários',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 👤 BUSCAR USUÁRIO POR ID
router.get('/:id', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`🔍 Buscando usuário ID: ${req.params.id}`);
    
    const user = await User.findById(req.params.id).select('-passwordHash');
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.email}`);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar,
        lastActive: user.lastActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isGoogleUser: !!user.googleId,
        hasPassword: !!user.passwordHash
      }
    });

  } catch (error) {
    console.error('💥 Erro ao buscar usuário:', error);
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ 
        success: false,
        message: 'ID de usuário inválido' 
      });
      return;
    }
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// ===================================
// ROTAS DE PERFIL/GERENCIAMENTO  
// ===================================

// ✏️ ATUALIZAR PERFIL DO USUÁRIO LOGADO
router.put('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log(`🔄 Atualizando perfil do usuário: ${req.userId}`);
    
    const { name, avatar } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }

    // Atualizar campos
    if (name !== undefined) {
      if (name.trim().length < 2) {
        res.status(400).json({ 
          success: false,
          message: 'Nome deve ter pelo menos 2 caracteres' 
        });
        return;
      }
      user.name = name.trim();
    }
    
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();
    console.log(`✅ Perfil atualizado: ${user.email}`);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar,
        lastActive: user.lastActive,
        isGoogleUser: !!user.googleId
      }
    });

  } catch (error) {
    console.error('💥 Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 🔑 ALTERAR SENHA
router.put('/change-password', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log(`🔐 Alterando senha do usuário: ${req.userId}`);
    
    const { currentPassword, newPassword } = req.body;

    // Validações
    if (!currentPassword || !newPassword) {
      res.status(400).json({ 
        success: false,
        message: 'Senha atual e nova senha são obrigatórias' 
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ 
        success: false,
        message: 'Nova senha deve ter pelo menos 6 caracteres' 
      });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }

    // Verificar se é usuário Google (não tem senha)
    if (!user.passwordHash) {
      res.status(400).json({ 
        success: false,
        message: 'Usuários do Google não podem alterar senha aqui',
        hint: 'Altere sua senha diretamente no Google'
      });
      return;
    }

    // Verificar senha atual
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      res.status(400).json({ 
        success: false,
        message: 'Senha atual incorreta' 
      });
      return;
    }

    // Hash da nova senha
    const salt = await bcryptjs.genSalt(10);
    user.passwordHash = await bcryptjs.hash(newPassword, salt);
    await user.save();

    console.log(`✅ Senha alterada para: ${user.email}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('💥 Erro ao alterar senha:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao alterar senha',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 💎 UPGRADE DE ASSINATURA
router.post('/upgrade', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log(`💎 Upgrade de assinatura para usuário: ${req.userId}`);
    
    const { plan } = req.body;

    if (!plan || !['premium'].includes(plan)) {
      res.status(400).json({ 
        success: false,
        message: 'Plano inválido. Disponível: premium' 
      });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }

    if (user.subscription === plan) {
      res.status(400).json({ 
        success: false,
        message: `Usuário já possui assinatura ${plan}` 
      });
      return;
    }

    // Atualizar assinatura
    user.subscription = plan as 'premium';
    await user.save();

    console.log(`✅ Assinatura atualizada para ${plan}: ${user.email}`);

    res.json({
      success: true,
      message: `Assinatura atualizada para ${plan} com sucesso!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('💥 Erro no upgrade:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar assinatura',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 📊 ESTATÍSTICAS DO USUÁRIO
router.get('/stats', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log(`📊 Buscando estatísticas para: ${req.userId}`);
    
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }

    // Calcular dias desde registro
    const daysSinceRegistration = Math.floor(
      (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calcular dias desde último acesso
    const daysSinceLastActive = user.lastActive ? Math.floor(
      (new Date().getTime() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24)
    ) : null;

    const stats = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar
      },
      membership: {
        memberSince: user.createdAt,
        daysSinceRegistration,
        subscription: user.subscription,
        isPremium: user.subscription === 'premium'
      },
      activity: {
        lastActive: user.lastActive,
        daysSinceLastActive,
        isActive: daysSinceLastActive !== null && daysSinceLastActive < 7
      },
      account: {
        isGoogleUser: !!user.googleId,
        hasPassword: !!user.passwordHash,
        emailVerified: true // Assumindo que está verificado
      }
    };

    console.log(`✅ Estatísticas calculadas para: ${user.email}`);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('💥 Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

console.log('✅ UserRoutes completo carregado com sucesso!');

export default router;