import connectToDatabase from '@/lib/mongodb';
import { seedChordProgressions } from '@/models/ChordProgression';

export async function POST() {
  try {
    console.log('🚀 Iniciando seed das progressões...');
    
    await connectToDatabase();
    console.log('🔗 Conectado ao MongoDB');
    
    const result = await seedChordProgressions();
    console.log(`✅ ${result?.length || 0} progressões inseridas!`);
    
    return Response.json({ 
      success: true, 
      message: `${result?.length || 0} progressões inseridas com sucesso!`,
      count: result?.length || 0
    });
    
  } catch (error: unknown) {
    console.error('❌ Erro no seed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ 
    message: 'Use POST /api/admin/seed-progressions para executar o seed das progressões',
    info: 'Esta API popula o banco com progressões harmônicas para treino auditivo'
  });
}