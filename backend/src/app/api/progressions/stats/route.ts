// src/app/api/progressions/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ChordProgression } from '@/models/ChordProgression';
import connectDB from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth-utils';

// GET /api/progressions/stats - PROTEGIDO
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
    const summary = searchParams.get('summary') === 'true';

    // Se for summary, retorna versão resumida
    if (summary) {
      const totalProgressions = await ChordProgression.countDocuments({ isActive: true });

      const quickStats = await ChordProgression.aggregate([
        { $match: { isActive: true } },
        {
          $facet: {
            byDifficulty: [
              {
                $group: {
                  _id: '$difficulty',
                  count: { $sum: 1 }
                }
              }
            ],
            byCategory: [
              {
                $group: {
                  _id: '$category',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 }
            ],
            byMode: [
              {
                $group: {
                  _id: '$mode',
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          total: totalProgressions,
          difficulty: quickStats[0]?.byDifficulty || [],
          topCategories: quickStats[0]?.byCategory || [],
          modes: quickStats[0]?.byMode || [],
          summary: true
        }
      });
    }

    // Estatísticas completas
    const totalProgressions = await ChordProgression.countDocuments({ isActive: true });

    if (totalProgressions === 0) {
      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalProgressions: 0,
            lastUpdated: new Date().toISOString()
          },
          difficulty: { distribution: [], complexity: [] },
          category: { distribution: [], byDifficulty: [] },
          mode: { distribution: [] },
          tempo: { stats: null },
          timeSignature: { distribution: [] },
          references: { top: [] },
          recent: { progressions: [] }
        }
      });
    }

    // Distribuição por dificuldade
    const difficultyStats = await ChordProgression.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$count', totalProgressions] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Distribuição por categoria
    const categoryStats = await ChordProgression.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          difficulties: { $push: '$difficulty' }
        }
      },
      {
        $addFields: {
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$count', totalProgressions] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Distribuição por modo
    const modeStats = await ChordProgression.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$mode',
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$count', totalProgressions] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estatísticas de tempo
    const tempoStats = await ChordProgression.aggregate([
      { $match: { isActive: true, tempo: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgTempo: { $avg: '$tempo' },
          minTempo: { $min: '$tempo' },
          maxTempo: { $max: '$tempo' },
          totalWithTempo: { $sum: 1 }
        }
      }
    ]);

    // Fórmula de compasso mais comum
    const timeSignatureStats = await ChordProgression.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$timeSignature',
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$count', totalProgressions] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top progressões com referência
    const topReferences = await ChordProgression.aggregate([
      { 
        $match: { 
          isActive: true, 
          reference: { $exists: true, $nin: [null, ''] }
        }
      },
      {
        $group: {
          _id: '$reference',
          progressions: {
            $push: {
              name: '$name',
              difficulty: '$difficulty',
              category: '$category'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Análise de complexidade por dificuldade (número médio de acordes)
    const complexityStats = await ChordProgression.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          chordCount: { $size: '$degrees' }
        }
      },
      {
        $group: {
          _id: '$difficulty',
          avgChords: { $avg: '$chordCount' },
          minChords: { $min: '$chordCount' },
          maxChords: { $max: '$chordCount' },
          totalProgressions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Progressões mais recentes
    const recentProgressions = await ChordProgression
      .find({ isActive: true })
      .select('name difficulty category createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Cross-analysis: Dificuldade vs Categoria
    const difficultyByCategoryStats = await ChordProgression.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            category: '$category',
            difficulty: '$difficulty'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          difficulties: {
            $push: {
              difficulty: '$_id.difficulty',
              count: '$count'
            }
          },
          totalInCategory: { $sum: '$count' }
        }
      },
      { $sort: { totalInCategory: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProgressions,
          lastUpdated: new Date().toISOString()
        },
        difficulty: {
          distribution: difficultyStats,
          complexity: complexityStats
        },
        category: {
          distribution: categoryStats,
          byDifficulty: difficultyByCategoryStats
        },
        mode: {
          distribution: modeStats
        },
        tempo: {
          stats: tempoStats[0] || null
        },
        timeSignature: {
          distribution: timeSignatureStats
        },
        references: {
          top: topReferences
        },
        recent: {
          progressions: recentProgressions
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching progression stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}