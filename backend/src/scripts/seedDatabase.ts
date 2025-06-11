// src/scripts/seedDatabase.ts
import connectToDatabase from '@/lib/mongodb'; // ← Nome correto da função
import { seedChordProgressions } from '@/models/ChordProgression';

async function runSeed() {
  try {
    console.log('🚀 Iniciando seed das progressões harmônicas...');
    
    // Conectar ao MongoDB
    await connectToDatabase();
    console.log('🔗 Conectado ao MongoDB com sucesso!');
    
    // Executar seed
    await seedChordProgressions();
    console.log('✅ Seed das progressões executado com sucesso!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

// Executar o seed
runSeed();