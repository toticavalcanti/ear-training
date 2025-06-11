// src/app/api/progressions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ChordProgression } from '@/models/ChordProgression';
import connectDB from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth-utils';

// Interface para o filtro de busca
interface FilterType {
  difficulty?: string;
  category?: string;
  mode?: string;
  isActive?: boolean;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
    reference?: { $regex: string; $options: string };
  }>;
}

// GET /api/progressions - PROTEGIDO
export async function GET(request: NextRequest) {
  try {
    // ✅ PROTEÇÃO: Verificar autenticação
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Parâmetros de filtro
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const mode = searchParams.get('mode');
    const isActive = searchParams.get('isActive');
    
    // Parâmetros de paginação
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    // Parâmetros de busca
    const search = searchParams.get('search');
    const random = searchParams.get('random') === 'true';

    // Construir filtro
    const filter: FilterType = {};
    
    // Validar dificuldade
    if (difficulty) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (validDifficulties.includes(difficulty)) {
        filter.difficulty = difficulty;
      } else {
        return NextResponse.json({
          success: false,
          error: 'Invalid difficulty. Must be: beginner, intermediate, or advanced'
        }, { status: 400 });
      }
    }

    // Validar categoria
    if (category) {
      const validCategories = ['pop', 'jazz', 'classical', 'bossa', 'modal', 'funk', 'rock', 'samba', 'mpb', 'blues'];
      if (validCategories.includes(category)) {
        filter.category = category;
      } else {
        return NextResponse.json({
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        }, { status: 400 });
      }
    }

    // Validar modo
    if (mode) {
      const validModes = ['major', 'minor'];
      if (validModes.includes(mode)) {
        filter.mode = mode;
      } else {
        return NextResponse.json({
          success: false,
          error: 'Invalid mode. Must be: major or minor'
        }, { status: 400 });
      }
    }

    // Filtro isActive
    if (isActive !== null) {
      filter.isActive = isActive !== 'false';
    } else {
      filter.isActive = true; // Default to active only
    }

    // Busca por texto
    if (search && search.trim()) {
      const searchTerm = search.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { reference: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Se for busca aleatória
    if (random) {
      const randomProgressions = await ChordProgression.aggregate([
        { $match: filter },
        { $sample: { size: Math.min(limit, 50) } }
      ]);

      const total = await ChordProgression.countDocuments(filter);

      return NextResponse.json({
        success: true,
        data: {
          progressions: randomProgressions,
          pagination: {
            total,
            page: 1,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: false,
            hasPrev: false
          },
          filters: {
            difficulty,
            category,
            mode,
            search,
            random: true
          }
        }
      });
    }

    // Busca normal com paginação
    const [progressions, total] = await Promise.all([
      ChordProgression
        .find(filter)
        .select('-__v')
        .sort({ difficulty: 1, category: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ChordProgression.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        progressions,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          difficulty,
          category,
          mode,
          search,
          isActive: filter.isActive
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching progressions:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/progressions - PROTEGIDO
export async function POST(request: NextRequest) {
  try {
    // ✅ PROTEÇÃO: Verificar autenticação
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    
    // Validação básica - campos obrigatórios
    const requiredFields = ['name', 'degrees', 'difficulty', 'category', 'mode', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Field '${field}' is required`
        }, { status: 400 });
      }
    }

    // Validar se degrees é um array não vazio
    if (!Array.isArray(body.degrees) || body.degrees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'degrees must be a non-empty array'
      }, { status: 400 });
    }

    // Validar enums
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    const validCategories = ['pop', 'jazz', 'classical', 'bossa', 'modal', 'funk', 'rock', 'samba', 'mpb', 'blues'];
    const validModes = ['major', 'minor'];

    if (!validDifficulties.includes(body.difficulty)) {
      return NextResponse.json({
        success: false,
        error: `Invalid difficulty. Must be: ${validDifficulties.join(', ')}`
      }, { status: 400 });
    }

    if (!validCategories.includes(body.category)) {
      return NextResponse.json({
        success: false,
        error: `Invalid category. Must be: ${validCategories.join(', ')}`
      }, { status: 400 });
    }

    if (!validModes.includes(body.mode)) {
      return NextResponse.json({
        success: false,
        error: `Invalid mode. Must be: ${validModes.join(', ')}`
      }, { status: 400 });
    }

    // Verificar se já existe uma progressão com o mesmo nome
    const existingProgression = await ChordProgression.findOne({ 
      name: body.name.trim(),
      isActive: true 
    });
    
    if (existingProgression) {
      return NextResponse.json({
        success: false,
        error: 'A progression with this name already exists'
      }, { status: 409 });
    }

    // Criar nova progressão
    const progressionData = {
      name: body.name.trim(),
      degrees: body.degrees,
      difficulty: body.difficulty,
      category: body.category,
      mode: body.mode,
      description: body.description.trim(),
      reference: body.reference ? body.reference.trim() : undefined,
      tempo: body.tempo || 120,
      timeSignature: body.timeSignature || '4/4',
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newProgression = new ChordProgression(progressionData);
    const savedProgression = await newProgression.save();

    return NextResponse.json({
      success: true,
      data: {
        progression: savedProgression,
        message: 'Progression created successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating progression:', error);
    
    // Handle MongoDB duplicate key error
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'A progression with this name already exists'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}