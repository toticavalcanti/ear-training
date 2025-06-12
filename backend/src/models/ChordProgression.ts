// src/models/ChordProgression.ts
import mongoose from 'mongoose';

export interface IChordProgression {
  _id?: string;
  name: string;
  degrees: string[];           // ["I^maj7", "vi7", "ii7", "V7"]
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'pop' | 'jazz' | 'classical' | 'bossa' | 'modal' | 'funk' | 'rock' | 'samba' | 'mpb' | 'blues';
  mode: 'major' | 'minor';
  timeSignature: string;       // "4/4", "3/4"
  tempo: number;              // 120
  description: string;
  reference?: string;         // Nome da música/artista de referência
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chordProgressionSchema = new mongoose.Schema<IChordProgression>({
  name: { type: String, required: true },
  degrees: { type: [String], required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['pop', 'jazz', 'classical', 'bossa', 'modal', 'funk', 'rock', 'samba', 'mpb', 'blues'], 
    required: true 
  },
  mode: { 
    type: String, 
    enum: ['major', 'minor'], 
    required: true 
  },
  timeSignature: { type: String, default: '4/4' },
  tempo: { type: Number, default: 120 },
  description: { type: String, required: true },
  reference: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ChordProgression = mongoose.models.ChordProgression || 
  mongoose.model<IChordProgression>('ChordProgression', chordProgressionSchema);

// ===============================
// 🎼 SEED DATA - 150 PROGRESSÕES EQUILIBRADAS
// ===============================

export const seedProgressions: Partial<IChordProgression>[] = [

  // ========================================
  // BEGINNER - 50 progressões (5 de cada estilo)
  // ========================================

  // === POP BEGINNER (5) ===
  {
    name: "Canon Pop Progression",
    degrees: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 80,
    description: "Baseada no Canon de Pachelbel, usada em inúmeros hits pop",
    reference: "Don't Stop Believin', Someone Like You",
    isActive: true
  },
  {
    name: "Axis Progression",
    degrees: ["vi", "IV", "I", "V", "vi", "IV"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 90,
    description: "A progressão pop mais popular do século XXI",
    reference: "Let It Be, Wonderwall",
    isActive: true
  },
  {
    name: "Doo-Wop Changes",
    degrees: ["I", "vi", "IV", "V", "I", "vi"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Progressão clássica dos anos 50, base do rock primitivo",
    reference: "Stand by Me, Blue Moon",
    isActive: true
  },
  {
    name: "Folk Ballad",
    degrees: ["I", "V", "vi", "IV", "I", "V"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    timeSignature: "6/8",
    tempo: 75,
    description: "Progressão típica de baladas folk e country",
    reference: "Good Riddance, House of the Rising Sun",
    isActive: true
  },
  {
    name: "Circle Descent",
    degrees: ["vi", "ii", "V", "I", "vi", "ii"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "Movimento descendente pelo círculo das quintas",
    reference: "Fly Me to the Moon (pop version)",
    isActive: true
  },

  // === JAZZ BEGINNER (5) ===
  {
    name: "ii-V-I Extended",
    degrees: ["ii7", "V7", "I^maj7", "vi7", "ii7", "V7"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Extensão da cadência fundamental do jazz",
    reference: "All The Things You Are",
    isActive: true
  },
  {
    name: "Rhythm Changes A",
    degrees: ["I", "vi7", "ii7", "V7", "I", "vi7"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 140,
    description: "Seção A dos Rhythm Changes, base de centenas de standards",
    reference: "I Got Rhythm, Anthropology",
    isActive: true
  },
  {
    name: "Autumn Leaves A",
    degrees: ["ii7", "V7", "I^maj7", "IV^maj7", "iii7", "vi7"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Seção A de Autumn Leaves, standard essencial",
    reference: "Autumn Leaves, Les Feuilles Mortes",
    isActive: true
  },
  {
    name: "Blue Moon",
    degrees: ["I", "vi7", "ii7", "V7", "I^maj7"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 80,
    description: "Progressão de Blue Moon, uma das mais tocadas",
    reference: "Blue Moon, Heart and Soul",
    isActive: true
  },
  {
    name: "Take Five Pattern",
    degrees: ["ii7", "V7", "I^maj7", "ii7", "V7"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "5/4",
    tempo: 170,
    description: "Baseada em Take Five, em compasso quinário",
    reference: "Take Five - Dave Brubeck",
    isActive: true
  },

  // === CLASSICAL BEGINNER (5) ===
  {
    name: "Baroque Sequence",
    degrees: ["I", "V", "vi", "iii", "IV", "I"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    timeSignature: "4/4",
    tempo: 90,
    description: "Sequência harmônica típica do período barroco",
    reference: "Bach - Invenções",
    isActive: true
  },
  {
    name: "Classical Cadence",
    degrees: ["I", "IV", "V", "vi", "IV", "V"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Cadência clássica com resolução deceptiva",
    reference: "Mozart - Sonatas",
    isActive: true
  },
  {
    name: "Alberti Bass Pattern",
    degrees: ["I", "V", "I", "V", "I", "V"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Padrão de baixo alberti com alternância I-V",
    reference: "Mozart - Sonata K.331",
    isActive: true
  },
  {
    name: "Romantic Progression",
    degrees: ["I", "vi", "IV", "V", "vi", "IV"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    timeSignature: "3/4",
    tempo: 70,
    description: "Progressão típica do romantismo musical",
    reference: "Chopin - Valsas",
    isActive: true
  },
  {
    name: "Circle of Fifths Classical",
    degrees: ["I", "vi", "ii", "V", "I", "vi"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    timeSignature: "2/4",
    tempo: 100,
    description: "Círculo das quintas na tradição clássica",
    reference: "Bach - Prelúdios",
    isActive: true
  },

  // === BOSSA BEGINNER (5) ===
  {
    name: "Bossa Nova Básica",
    degrees: ["I^maj7", "vi7", "ii7", "V7", "I^maj7", "vi7"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Progressão fundamental da bossa nova brasileira",
    reference: "Girl from Ipanema",
    isActive: true
  },
  {
    name: "Corcovado Pattern",
    degrees: ["I^maj7", "iii7", "vi7", "ii7", "V7", "I^maj7"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 90,
    description: "Padrão harmônico de Corcovado (Quiet Nights)",
    reference: "Corcovado - Tom Jobim",
    isActive: true
  },
  {
    name: "Desafinado Intro",
    degrees: ["I^maj7", "IV^maj7", "iii7", "vi7", "ii7", "V7"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Introdução harmônica de Desafinado",
    reference: "Desafinado - Tom Jobim",
    isActive: true
  },
  {
    name: "Wave Beginning",
    degrees: ["I^maj7", "ii7", "V7", "I^maj7", "vi7", "ii7"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Início da harmonia de Wave",
    reference: "Wave - Tom Jobim",
    isActive: true
  },
  {
    name: "Bossa Ballad",
    degrees: ["I^maj7", "vi7", "ii7", "V7", "iii7", "vi7"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 80,
    description: "Padrão de balada bossa nova",
    reference: "Meditation - Tom Jobim",
    isActive: true
  },

  // === MODAL BEGINNER (5) ===
  {
    name: "Dorian Vamp",
    degrees: ["i", "bVII", "i", "bVII", "i", "bVII"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 85,
    description: "Vamp modal dórico característico",
    reference: "So What - Miles Davis",
    isActive: true
  },
  {
    name: "Mixolydian Rock",
    degrees: ["I", "bVII", "IV", "I", "bVII", "IV"],
    difficulty: "beginner",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Progressão mixolídia típica do rock",
    reference: "Fire on the Mountain",
    isActive: true
  },
  {
    name: "Aeolian Progression",
    degrees: ["i", "bVI", "bVII", "i", "bVI", "bVII"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Progressão eólia natural, menor primitiva",
    reference: "House of the Rising Sun",
    isActive: true
  },
  {
    name: "Phrygian Touch",
    degrees: ["i", "bII", "i", "bII", "i", "bVII"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 100,
    description: "Toque frígio com acorde bII característico",
    reference: "White Rabbit - Jefferson Airplane",
    isActive: true
  },
  {
    name: "Lydian Dream",
    degrees: ["I", "#IV", "I", "#IV", "I", "V"],
    difficulty: "beginner",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 75,
    description: "Sonoridade lídia com #IV característico",
    reference: "Dreams - Fleetwood Mac",
    isActive: true
  },

  // === FUNK BEGINNER (5) ===
  {
    name: "Funk Standard",
    degrees: ["i7", "i7", "iv7", "i7", "V7", "i7"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 110,
    description: "Progressão funk clássica com dominantes",
    reference: "Superstition - Stevie Wonder",
    isActive: true
  },
  {
    name: "James Brown Style",
    degrees: ["i", "IV", "i", "IV", "i", "bVII"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 120,
    description: "Estilo James Brown com mudanças rápidas",
    reference: "Get Up (I Feel Like Being a) Sex Machine",
    isActive: true
  },
  {
    name: "P-Funk Vamp",
    degrees: ["i7", "iv7", "i7", "iv7", "i7", "iv7"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 100,
    description: "Vamp P-Funk alternando i e iv",
    reference: "Flash Light - Parliament",
    isActive: true
  },
  {
    name: "Soul Funk",
    degrees: ["i7", "bIII", "bVII", "IV", "i7", "bVII"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 95,
    description: "Funk com influência soul e R&B",
    reference: "What's Going On - Marvin Gaye",
    isActive: true
  },
  {
    name: "Disco Funk",
    degrees: ["i", "bVII", "bVI", "bVII", "i", "bVII"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 120,
    description: "Funk disco dos anos 70",
    reference: "Le Freak - Chic",
    isActive: true
  },

  // === ROCK BEGINNER (5) ===
  {
    name: "Power Ballad",
    degrees: ["vi", "IV", "I", "V", "vi", "IV"],
    difficulty: "beginner",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 70,
    description: "Progressão clássica de power ballad",
    reference: "Every Rose Has Its Thorn",
    isActive: true
  },
  {
    name: "Classic Rock",
    degrees: ["I", "bVII", "IV", "I", "bVII", "IV"],
    difficulty: "beginner",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Rock clássico com bVII",
    reference: "Born to Be Wild",
    isActive: true
  },
  {
    name: "Grunge Pattern",
    degrees: ["i", "bVI", "bVII", "i", "bVI", "bVII"],
    difficulty: "beginner",
    category: "rock",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Progressão típica do grunge dos anos 90",
    reference: "Smells Like Teen Spirit",
    isActive: true
  },
  {
    name: "Arena Rock",
    degrees: ["I", "V", "vi", "IV", "I", "V"],
    difficulty: "beginner",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Rock de arena, grandes estádios",
    reference: "Don't Stop Believin'",
    isActive: true
  },
  {
    name: "Hard Rock",
    degrees: ["i", "bVI", "i", "bVII", "i", "bVI"],
    difficulty: "beginner",
    category: "rock",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 130,
    description: "Hard rock com movimento cromático",
    reference: "Back in Black - AC/DC",
    isActive: true
  },

  // === SAMBA BEGINNER (5) ===
  {
    name: "Samba de Roda",
    degrees: ["I", "V7", "I", "V7", "I", "IV"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 120,
    description: "Samba tradicional baiano de roda",
    reference: "Samba de Roda - Tradição Bahiana",
    isActive: true
  },
  {
    name: "Samba Canção",
    degrees: ["I^maj7", "vi7", "ii7", "V7", "I^maj7", "vi7"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "4/4",
    tempo: 80,
    description: "Samba canção com harmonias sofisticadas",
    reference: "Aquarela do Brasil",
    isActive: true
  },
  {
    name: "Pagode Básico",
    degrees: ["I", "vi", "ii", "V", "I", "vi"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 130,
    description: "Pagode carioca tradicional",
    reference: "Fundo de Quintal",
    isActive: true
  },
  {
    name: "Samba Enredo",
    degrees: ["I", "IV", "V", "I", "vi", "ii"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 140,
    description: "Samba enredo de carnaval",
    reference: "Sambas de Enredo",
    isActive: true
  },
  {
    name: "Choro Samba",
    degrees: ["I", "V7", "vi", "ii", "V", "I"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 110,
    description: "Samba com influência do choro",
    reference: "Tico-Tico no Fubá",
    isActive: true
  },

  // === MPB BEGINNER (5) ===
  {
    name: "Tropicália",
    degrees: ["I^maj7", "iii7", "vi7", "ii7", "V7", "I^maj7"],
    difficulty: "beginner",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 90,
    description: "Harmonia típica da Tropicália",
    reference: "Alegria, Alegria - Caetano Veloso",
    isActive: true
  },
  {
    name: "Bossa MPB",
    degrees: ["I^maj7", "vi7", "ii7", "V7", "iii7", "vi7"],
    difficulty: "beginner",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "MPB com influência da bossa nova",
    reference: "Chega de Saudade",
    isActive: true
  },
  {
    name: "Folk MPB",
    degrees: ["I", "V", "vi", "IV", "I", "V"],
    difficulty: "beginner",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "MPB com simplicidade folk",
    reference: "Tocando em Frente - Almir Sater",
    isActive: true
  },
  {
    name: "Nordestina",
    degrees: ["i", "bVII", "bVI", "bVII", "i", "bVII"],
    difficulty: "beginner",
    category: "mpb",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 95,
    description: "MPB com influência nordestina",
    reference: "Asa Branca - Luiz Gonzaga",
    isActive: true
  },
  {
    name: "Jobim Style",
    degrees: ["I^maj7", "IV^maj7", "iii7", "vi7", "ii7", "V7"],
    difficulty: "beginner",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Estilo Tom Jobim na MPB",
    reference: "Águas de Março",
    isActive: true
  },

  // === BLUES BEGINNER (5) ===
  {
    name: "12-Bar Blues A",
    degrees: ["I7", "I7", "I7", "I7", "IV7", "IV7"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Primeira parte do blues de 12 compassos",
    reference: "Sweet Home Chicago",
    isActive: true
  },
  {
    name: "Minor Blues",
    degrees: ["i7", "iv7", "i7", "v7", "i7", "iv7"],
    difficulty: "beginner",
    category: "blues",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Blues menor tradicional",
    reference: "The Thrill Is Gone",
    isActive: true
  },
  {
    name: "Slow Blues",
    degrees: ["I7", "IV7", "I7", "V7", "I7", "V7"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    timeSignature: "12/8",
    tempo: 60,
    description: "Blues lento, feeling 12/8",
    reference: "Red House - Jimi Hendrix",
    isActive: true
  },
  {
    name: "Chicago Blues",
    degrees: ["I7", "I7", "IV7", "I7", "V7", "IV7"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 130,
    description: "Blues de Chicago, elétrico",
    reference: "Muddy Waters Style",
    isActive: true
  },
  {
    name: "Country Blues",
    degrees: ["I", "V7", "I", "IV", "I", "V7"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Blues country acústico",
    reference: "Robert Johnson Style",
    isActive: true
  },

  // ========================================
  // INTERMEDIATE - 50 progressões (5 de cada estilo)
  // ========================================

  // === POP INTERMEDIATE (5) ===
  {
    name: "Pop with Secondary Dominants",
    degrees: ["I", "VI7", "ii", "V7", "I", "iii", "vi"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Pop com dominantes secundárias para sofisticação",
    reference: "The Way You Look Tonight",
    isActive: true
  },
  {
    name: "Modulation Pop",
    degrees: ["I", "V/ii", "ii", "V/V", "V", "I", "vi"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Pop com modulações via dominantes secundárias",
    reference: "Penny Lane - The Beatles",
    isActive: true
  },
  {
    name: "Borrowed Chords Pop",
    degrees: ["I", "bVI", "bVII", "I", "iv", "I", "V"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 88,
    description: "Pop com acordes emprestados do modo menor",
    reference: "While My Guitar Gently Weeps",
    isActive: true
  },
  {
    name: "Neo-Soul Pop",
    degrees: ["I^maj7", "iii7", "vi^add9", "ii7", "V7sus4", "I^maj7", "iv^add9"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "Pop com influência neo-soul e extensões",
    reference: "Alicia Keys Style",
    isActive: true
  },
  {
    name: "Chromatic Pop",
    degrees: ["I", "I+", "vi", "vi/b5", "IV", "iv", "I"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 75,
    description: "Pop com movimento cromático interno",
    reference: "Yesterday - The Beatles",
    isActive: true
  },

  // === JAZZ INTERMEDIATE (5) ===
  {
    name: "Giant Steps Cycle",
    degrees: ["I^maj7", "VI7", "ii^maj7", "V7", "I^maj7", "bIII^maj7", "bVI7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 145,
    description: "Ciclo de Coltrane changes (Giant Steps)",
    reference: "Giant Steps - John Coltrane",
    isActive: true
  },
  {
    name: "All The Things A",
    degrees: ["I^maj7", "iv7", "bVII7", "bIII^maj7", "bVI^maj7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Seção A de All The Things You Are",
    reference: "All The Things You Are",
    isActive: true
  },
  {
    name: "Stella by Starlight",
    degrees: ["iii7", "VI7", "ii^maj7", "V7", "I^maj7", "IV^maj7", "iii7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Harmonia de Stella by Starlight",
    reference: "Stella by Starlight",
    isActive: true
  },
  {
    name: "Cherokee Changes",
    degrees: ["I^maj7", "ii7", "V7", "I^maj7", "I7", "IV^maj7", "iv7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 160,
    description: "Mudanças harmônicas de Cherokee",
    reference: "Cherokee (Indian Love Song)",
    isActive: true
  },
  {
    name: "Tritone Substitution",
    degrees: ["I^maj7", "ii7", "bII7", "I^maj7", "vi7", "bII7", "V7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 130,
    description: "Uso sistemático de substituições de trítono",
    reference: "Misty with tritone subs",
    isActive: true
  },

  // === CLASSICAL INTERMEDIATE (5) ===
  {
    name: "Bach Chorale Style",
    degrees: ["I", "vi", "ii6", "V7", "I", "IV", "V7"],
    difficulty: "intermediate",
    category: "classical",
    mode: "major",
    timeSignature: "4/4",
    tempo: 80,
    description: "Estilo coral bachiano com inversões",
    reference: "Bach - Corais BWV",
    isActive: true
  },
  {
    name: "Neapolitan Sixth",
    degrees: ["i", "N6", "V7", "i", "iv", "V7", "i"],
    difficulty: "intermediate",
    category: "classical",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Uso da sexta napolitana no modo menor",
    reference: "Beethoven - Sonata Patética",
    isActive: true
  },
  {
    name: "German Augmented Sixth",
    degrees: ["I", "vi", "Ger+6", "V7", "I", "IV", "V"],
    difficulty: "intermediate",
    category: "classical",
    mode: "major",
    timeSignature: "3/4",
    tempo: 100,
    description: "Sexta aumentada alemã para dominante",
    reference: "Mozart - Don Giovanni",
    isActive: true
  },
  {
    name: "Sequence by Fifths",
    degrees: ["I", "vi", "ii", "V", "iii", "vi", "ii"],
    difficulty: "intermediate",
    category: "classical",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Sequência descendente por quintas",
    reference: "Vivaldi - Quatro Estações",
    isActive: true
  },
  {
    name: "Diminished Seventh Chain",
    degrees: ["I", "vii°7", "I6", "vii°7/ii", "ii", "V7", "I"],
    difficulty: "intermediate",
    category: "classical",
    mode: "major",
    timeSignature: "2/4",
    tempo: 120,
    description: "Cadeia de sétimas diminutas",
    reference: "Chopin - Ballades",
    isActive: true
  },

  // === BOSSA INTERMEDIATE (5) ===
  {
    name: "Jobim Sophisticated",
    degrees: ["I^maj7", "I7/3", "IV^maj7", "iv^add9", "iii7", "VI7", "ii7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 105,
    description: "Harmonia sofisticada à la Tom Jobim",
    reference: "Insensatez",
    isActive: true
  },
  {
    name: "Chega de Saudade",
    degrees: ["I^maj7", "vi7", "ii7", "V7", "iii7", "VI7", "ii7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 115,
    description: "Harmonia de Chega de Saudade",
    reference: "Chega de Saudade - Tom Jobim",
    isActive: true
  },
  {
    name: "Garota de Ipanema B",
    degrees: ["ii^maj7", "V7", "I^maj7", "I^maj7", "ii7", "V7", "i^maj7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 125,
    description: "Seção B de Girl from Ipanema",
    reference: "Girl from Ipanema - Tom Jobim",
    isActive: true
  },
  {
    name: "Dindi Harmony",
    degrees: ["I^maj7", "bII^maj7", "I^maj7", "vi7", "ii7", "V7", "I^maj7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Harmonia de Dindi com bII",
    reference: "Dindi - Tom Jobim",
    isActive: true
  },
  {
    name: "Samba de Uma Nota Só",
    degrees: ["I^maj7", "iii7", "VI7", "ii7", "V7", "I^maj7", "vi7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "One Note Samba harmonia",
    reference: "Samba de Uma Nota Só",
    isActive: true
  },

  // === MODAL INTERMEDIATE (5) ===
  {
    name: "Dorian Complex",
    degrees: ["i7", "bVII^maj7", "IV^maj7", "i7", "bVI^maj7", "bVII^maj7", "i7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Complexidade harmônica no modo dórico",
    reference: "Miles Davis - Kind of Blue",
    isActive: true
  },
  {
    name: "Lydian Sophisticated",
    degrees: ["I^maj7#11", "II7", "I^maj7#11", "bVII^maj7", "I^maj7#11", "V7sus4", "I^maj7#11"],
    difficulty: "intermediate",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "Harmonia lídia sofisticada",
    reference: "Joe Satriani - Flying in a Blue Dream",
    isActive: true
  },
  {
    name: "Mixolydian Jazz",
    degrees: ["I7", "bVII^maj7", "IV^maj7", "I7", "ii7", "bVII^maj7", "I7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 125,
    description: "Mixolídio com harmonias de jazz",
    reference: "Herbie Hancock - Chameleon",
    isActive: true
  },
  {
    name: "Phrygian Dominant",
    degrees: ["I7", "bII^maj7", "bvii°7", "I7", "iv7", "bII^maj7", "I7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Modo frígio dominante (quinta do harmônico menor)",
    reference: "Paco de Lucía - Flamenco",
    isActive: true
  },
  {
    name: "Locrian Natural",
    degrees: ["i°7", "bII^maj7", "biii7", "iv7", "bV^maj7", "bvi7", "bVII7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 75,
    description: "Exploração harmônica do modo lócrio",
    reference: "Metallic - Nothing Else Matters",
    isActive: true
  },

  // === FUNK INTERMEDIATE (5) ===
  {
    name: "Extended Funk Vamp",
    degrees: ["i9", "iv9", "bVII9", "iv9", "i9", "bVI^maj7", "bVII9"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 105,
    description: "Funk com extensões e nonas",
    reference: "Parliament - Flash Light",
    isActive: true
  },
  {
    name: "Neo-Soul Funk",
    degrees: ["i^add9", "iv7", "bVII^maj7", "bVI^maj7", "i^add9", "ii7b5", "V7alt"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Funk neo-soul com harmonias sofisticadas",
    reference: "D'Angelo - Voodoo",
    isActive: true
  },
  {
    name: "Acid Jazz Funk",
    degrees: ["i7", "bIII^maj7", "bVI^maj7", "bVII7", "i7", "iv7", "V7alt"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 115,
    description: "Funk com influência acid jazz",
    reference: "Jamiroquai Style",
    isActive: true
  },
  {
    name: "Gospel Funk",
    degrees: ["I^maj7", "iii7", "vi7", "IV^maj7", "ii7", "V7sus4", "I^maj7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Funk com harmonias gospel",
    reference: "Stevie Wonder - As",
    isActive: true
  },
  {
    name: "Fusion Funk",
    degrees: ["i7", "bII^maj7#11", "i7", "iv7", "bVII7", "bVI^maj7", "V7alt"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 120,
    description: "Funk fusion com acordes complexos",
    reference: "Weather Report - Birdland",
    isActive: true
  },

  // === ROCK INTERMEDIATE (5) ===
  {
    name: "Progressive Rock",
    degrees: ["i", "bVII", "bVI", "bVII", "i", "iv", "bVI"],
    difficulty: "intermediate",
    category: "rock",
    mode: "minor",
    timeSignature: "7/8",
    tempo: 140,
    description: "Rock progressivo com métrica irregular",
    reference: "Pink Floyd - Money",
    isActive: true
  },
  {
    name: "Alternative Rock 90s",
    degrees: ["vi", "bVII", "I", "bVI", "vi", "iv", "bVII"],
    difficulty: "intermediate",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 125,
    description: "Rock alternativo anos 90",
    reference: "Radiohead - Creep",
    isActive: true
  },
  {
    name: "Metal Progression",
    degrees: ["i", "bII", "bvii°", "i", "bVI", "bVII", "i"],
    difficulty: "intermediate",
    category: "rock",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 150,
    description: "Progressão de metal com intervalos cromáticos",
    reference: "Black Sabbath - Paranoid",
    isActive: true
  },
  {
    name: "Indie Rock",
    degrees: ["I", "iii", "vi", "IV", "I", "V", "vi"],
    difficulty: "intermediate",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 135,
    description: "Rock independente com harmonias sofisticadas",
    reference: "Arctic Monkeys Style",
    isActive: true
  },
  {
    name: "Southern Rock",
    degrees: ["I", "bVII", "IV", "I", "V", "bVII", "I"],
    difficulty: "intermediate",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Rock sulista americano",
    reference: "Lynyrd Skynyrd - Sweet Home Alabama",
    isActive: true
  },

  // === SAMBA INTERMEDIATE (5) ===
  {
    name: "Samba Jazz",
    degrees: ["I^maj7", "VI7", "ii7", "V7", "iii7", "VI7", "ii7"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 140,
    description: "Samba com harmonias jazzísticas",
    reference: "Elis Regina - Águas de Março",
    isActive: true
  },
  {
    name: "Partido Alto Complexo",
    degrees: ["I", "iii", "vi", "ii", "V", "I", "vi"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 160,
    description: "Partido alto com movimento harmônico",
    reference: "Zeca Pagodinho Style",
    isActive: true
  },
  {
    name: "Samba de Breque",
    degrees: ["I7", "IV7", "I7", "V7", "I7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 120,
    description: "Samba de breque com dominantes",
    reference: "Moreira da Silva Style",
    isActive: true
  },
  {
    name: "Samba Moderno",
    degrees: ["I^maj7", "bII^maj7", "I^maj7", "vi7", "ii7", "V7", "I^maj7"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 135,
    description: "Samba contemporâneo com harmonias modernas",
    reference: "Ivan Lins Style",
    isActive: true
  },
  {
    name: "Gafieira Harmonia",
    degrees: ["I", "VI7", "ii", "V7", "iii", "vi", "ii"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 150,
    description: "Harmonia de gafieira para dança",
    reference: "Orquestra Tabajara",
    isActive: true
  },

  // === MPB INTERMEDIATE (5) ===
  {
    name: "Vento de Maio (Lô Borges)",
    degrees: ["i7", "VI7", "i7", "#IV/V", "IV/V", "i7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 85,
    description: "Progressão da clássica 'Vento de Maio'",
    reference: "Vento de Maio - Lô Borges",
    isActive: true
  },
  {
    name: "Caetano Harmonia",
    degrees: ["I^maj7", "bVII^maj7", "IV^maj7", "bVI^maj7", "I^maj7", "iii7", "vi7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Harmonias sofisticadas à la Caetano Veloso",
    reference: "Caetano Veloso - Tropicália",
    isActive: true
  },
  {
    name: "Milton Nascimento",
    degrees: ["I^maj7", "iv^add9", "bVII^maj7", "I^maj7", "ii7", "V7sus4", "I^maj7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "Estilo harmônico de Milton Nascimento",
    reference: "Milton Nascimento - Travessia",
    isActive: true
  },
  {
    name: "Djavan Style",
    degrees: ["I^maj7", "iii7", "VI7alt", "ii7", "V7sus4", "I^maj7", "vi7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Harmonias complexas estilo Djavan",
    reference: "Djavan - Flor de Lis",
    isActive: true
  },
  {
    name: "Edu Lobo Harmonia",
    degrees: ["I^maj7", "bII^maj7", "bVII^maj7", "I^maj7", "iv7", "bVII7", "I^maj7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 90,
    description: "Harmonias de Edu Lobo",
    reference: "Edu Lobo - Casa Forte",
    isActive: true
  },

  // === BLUES INTERMEDIATE (5) ===
  {
    name: "Jazz Blues",
    degrees: ["I7", "VI7", "ii7", "V7", "I7", "IV7", "I7"],
    difficulty: "intermediate",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Blues com harmonias de jazz",
    reference: "Billie's Bounce - Charlie Parker",
    isActive: true
  },
  {
    name: "Stormy Monday",
    degrees: ["I7", "IV7", "I7", "I7", "IV7", "IV7", "I7"],
    difficulty: "intermediate",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 70,
    description: "Progressão de Stormy Monday",
    reference: "Stormy Monday - T-Bone Walker",
    isActive: true
  },
  {
    name: "Blues with Substitutions",
    degrees: ["I7", "bII7", "I7", "I7", "IV7", "bV7", "I7"],
    difficulty: "intermediate",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Blues com substituições de trítono",
    reference: "Bird Blues - Charlie Parker",
    isActive: true
  },
  {
    name: "Minor Blues Complex",
    degrees: ["i7", "iv7", "i7", "VII7", "VI7", "ii7b5", "V7"],
    difficulty: "intermediate",
    category: "blues",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 95,
    description: "Blues menor com harmonias complexas",
    reference: "Summertime - George Gershwin",
    isActive: true
  },
  {
    name: "Bebop Blues",
    degrees: ["I7", "VI7", "ii7", "V7", "iii7", "VI7", "ii7"],
    difficulty: "intermediate",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 160,
    description: "Blues bebop com movimento por tons",
    reference: "Straight No Chaser - Monk",
    isActive: true
  },

  // ========================================
  // ADVANCED - 50 progressões (5 de cada estilo)
  // ========================================

  // === POP ADVANCED (5) ===
  {
    name: "Beatles Complex",
    degrees: ["I", "bVII/bIII", "bIII", "bVI", "iv", "I/3", "ii7b5", "V7"],
    difficulty: "advanced",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 105,
    description: "Harmonias complexas dos Beatles período tardio",
    reference: "Here Comes the Sun - The Beatles",
    isActive: true
  },
  {
    name: "Steely Dan Harmony",
    degrees: ["I^maj7", "iii7", "bIII°7", "ii7", "bII7", "I^maj7", "vi7"],
    difficulty: "advanced",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 115,
    description: "Harmonias sofisticadas do Steely Dan",
    reference: "Steely Dan - Deacon Blues",
    isActive: true
  },
  {
    name: "Radiohead Advanced",
    degrees: ["i", "bII", "bvi°", "bVII", "iv/6", "N6", "V7"],
    difficulty: "advanced",
    category: "pop",
    mode: "minor",
    timeSignature: "7/8",
    tempo: 85,
    description: "Progressões complexas do Radiohead",
    reference: "Radiohead - Pyramid Song",
    isActive: true
  },
  {
    name: "Prince Funk Pop",
    degrees: ["i^add9", "bVII^maj7#11", "bVI^maj7", "V7alt", "i^add9", "iv9", "bVII7"],
    difficulty: "advanced",
    category: "pop",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 125,
    description: "Funk pop sofisticado estilo Prince",
    reference: "Prince - Purple Rain",
    isActive: true
  },
  {
    name: "Progressive Pop",
    degrees: ["I^maj7", "V/ii", "ii^maj7", "bVII^maj7", "IV^maj7/5", "iii7", "vi^add9"],
    difficulty: "advanced",
    category: "pop",
    mode: "major",
    timeSignature: "5/4",
    tempo: 95,
    description: "Pop progressivo com métrica irregular",
    reference: "Genesis - Firth of Fifth",
    isActive: true
  },

  // === JAZZ ADVANCED (5) ===
  {
    name: "Coltrane Changes Full",
    degrees: ["I^maj7", "bIII7", "bVI^maj7", "bII7", "I^maj7", "V7/V", "V7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 260,
    description: "Coltrane changes completas (Giant Steps)",
    reference: "Giant Steps - John Coltrane",
    isActive: true
  },
  {
    name: "Wayne Shorter Harmony",
    degrees: ["i^maj7", "bII^maj7", "bVII^maj7/5", "bVI^maj7#11", "V7alt", "i^maj7", "iv^add9"],
    difficulty: "advanced",
    category: "jazz",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 140,
    description: "Harmonias modernas de Wayne Shorter",
    reference: "Wayne Shorter - Speak No Evil",
    isActive: true
  },
  {
    name: "Herbie Hancock Modern",
    degrees: ["I^maj7#11", "bVII^maj7", "bIII^maj7#11", "bVI^maj7", "ii7", "V7sus4", "I^maj7#11"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 130,
    description: "Jazz modal moderno de Herbie Hancock",
    reference: "Herbie Hancock - Maiden Voyage",
    isActive: true
  },
  {
    name: "McCoy Tyner Quartal",
    degrees: ["i^sus4", "bVII^sus4", "bVI^sus4", "bV^sus4", "i^sus4", "iv^sus4", "bVII^sus4"],
    difficulty: "advanced",
    category: "jazz",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 160,
    description: "Harmonias quartais de McCoy Tyner",
    reference: "McCoy Tyner - The Real McCoy",
    isActive: true
  },
  {
    name: "Bill Evans Sophistication",
    degrees: ["I^maj7", "bII^maj7/5", "I^maj7/3", "vi7", "ii7", "bII7", "I^maj7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    timeSignature: "3/4",
    tempo: 180,
    description: "Reharmonizações sofisticadas de Bill Evans",
    reference: "Bill Evans - Waltz for Debby",
    isActive: true
  },

  // === CLASSICAL ADVANCED (5) ===
  {
    name: "Wagner Chromaticism",
    degrees: ["i", "Ger+6", "V7/bII", "bII", "Ger+6/iv", "iv", "V7"],
    difficulty: "advanced",
    category: "classical",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 60,
    description: "Cromatismo wagneriano avançado",
    reference: "Wagner - Tristão e Isolda",
    isActive: true
  },
  {
    name: "Late Romantic",
    degrees: ["I", "bII6", "I64", "V7/vi", "vi", "It+6", "V7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    timeSignature: "3/4",
    tempo: 85,
    description: "Harmonias do romantismo tardio",
    reference: "Chopin - Ballada Op. 52",
    isActive: true
  },
  {
    name: "Bach Well-Tempered",
    degrees: ["i", "ii°6", "V7/III", "III", "VI", "iv6", "V7"],
    difficulty: "advanced",
    category: "classical",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 100,
    description: "Complexidade harmônica bachiana",
    reference: "Bach - WTC Fugue in C# minor",
    isActive: true
  },
  {
    name: "Beethoven Late Period",
    degrees: ["I", "bVI", "IV", "bII6", "V7/V", "V7", "I"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    timeSignature: "6/8",
    tempo: 75,
    description: "Harmonia do Beethoven tardio",
    reference: "Beethoven - Sonata Op. 111",
    isActive: true
  },
  {
    name: "Impressionist Harmony",
    degrees: ["I^maj7", "bII^maj7", "bIII^maj7", "I^maj7/5", "bVII^maj7", "bVI^maj7", "I^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    timeSignature: "5/4",
    tempo: 70,
    description: "Harmonias impressionistas (Debussy/Ravel)",
    reference: "Debussy - Clair de Lune",
    isActive: true
  },

  // === BOSSA ADVANCED (5) ===
  {
    name: "Jobim Masterpiece",
    degrees: ["I^maj7", "bII^maj7/5", "i^maj7", "bIII^maj7#11", "bVI^maj7", "ii7", "V7alt"],
    difficulty: "advanced",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 105,
    description: "Obra-prima harmônica de Tom Jobim",
    reference: "Sabiá - Tom Jobim",
    isActive: true
  },
  {
    name: "Luiz Eça Reharmonization",
    degrees: ["I^maj7", "iii7", "bIII°7", "ii7", "bII^maj7", "I^maj7", "bVII^maj7"],
    difficulty: "advanced",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 115,
    description: "Reharmonizações de Luiz Eça",
    reference: "Luiz Eça - Tamba Trio",
    isActive: true
  },
  {
    name: "Baden Powell Guitar",
    degrees: ["i^maj7", "bII^maj7", "bVII^maj7", "bVI^maj7", "V7alt", "i^maj7", "iv^add9"],
    difficulty: "advanced",
    category: "bossa",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 120,
    description: "Harmonias de violão de Baden Powell",
    reference: "Baden Powell - Samba Triste",
    isActive: true
  },
  {
    name: "João Gilberto Sophistication",
    degrees: ["I^maj7", "VI7alt", "ii^maj7", "V7sus4", "iii7", "bIII°7", "ii7"],
    difficulty: "advanced",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Sofisticação harmônica de João Gilberto",
    reference: "João Gilberto - Chega de Saudade",
    isActive: true
  },
  {
    name: "Elis Regina Interpretation",
    degrees: ["I^maj7", "iv^add9", "bVII^maj7#11", "I^maj7/3", "vi7", "bIII7", "ii7"],
    difficulty: "advanced",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Interpretação harmônica de Elis Regina",
    reference: "Elis Regina - Águas de Março",
    isActive: true
  },

  // === MODAL ADVANCED (5) ===
  {
    name: "Coltrane Modal",
    degrees: ["i^sus4", "bVII^sus4", "bVI^sus4", "bII^sus4", "i^sus4", "iv^sus4", "bVII^sus4"],
    difficulty: "advanced",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 150,
    description: "Modalismo avançado de John Coltrane",
    reference: "Coltrane - A Love Supreme",
    isActive: true
  },
  {
    name: "Mahavishnu Orchestra",
    degrees: ["i", "bII", "biii", "iv", "bV", "bvi", "bVII"],
    difficulty: "advanced",
    category: "modal",
    mode: "minor",
    timeSignature: "7/8",
    tempo: 180,
    description: "Fusion modal da Mahavishnu Orchestra",
    reference: "Mahavishnu Orchestra - Birds of Fire",
    isActive: true
  },
  {
    name: "Frank Zappa Modal",
    degrees: ["I^maj7#11", "bII^maj7", "bIII^maj7#11", "bIV^maj7", "bV^maj7#11", "bVI^maj7", "bVII^maj7#11"],
    difficulty: "advanced",
    category: "modal",
    mode: "major",
    timeSignature: "17/16",
    tempo: 120,
    description: "Modalismo complexo de Frank Zappa",
    reference: "Frank Zappa - The Black Page",
    isActive: true
  },
  {
    name: "Pat Metheny Modal",
    degrees: ["I^maj7", "bVII^maj7/9", "bVI^maj7", "bV^maj7#11", "I^maj7", "ii^sus4", "bVII^maj7"],
    difficulty: "advanced",
    category: "modal",
    mode: "major",
    timeSignature: "5/4",
    tempo: 140,
    description: "Modalismo sofisticado de Pat Metheny",
    reference: "Pat Metheny - As Falls Wichita",
    isActive: true
  },
  {
    name: "King Crimson Progressive",
    degrees: ["i", "bii°", "bIII+", "iv", "bv°", "bVI", "bvii°"],
    difficulty: "advanced",
    category: "modal",
    mode: "minor",
    timeSignature: "13/8",
    tempo: 160,
    description: "Progressivismo modal do King Crimson",
    reference: "King Crimson - Larks' Tongues",
    isActive: true
  },

  // === FUNK ADVANCED (5) ===
  {
    name: "Prince Advanced Funk",
    degrees: ["i^add9", "bII^maj7#11", "bVII7#9", "bVI^maj7", "V7alt", "i^add9", "iv^sus2"],
    difficulty: "advanced",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 130,
    description: "Funk avançado estilo Prince",
    reference: "Prince - Sign O' The Times",
    isActive: true
  },
  {
    name: "Sly Stone Complex",
    degrees: ["I7#9", "bVII7#9", "IV7#9", "bIII7#9", "I7#9", "ii7", "V7alt"],
    difficulty: "advanced",
    category: "funk",
    mode: "major",
    timeSignature: "4/4",
    tempo: 115,
    description: "Funk complexo de Sly Stone",
    reference: "Sly & Family Stone - There's a Riot",
    isActive: true
  },
  {
    name: "George Clinton P-Funk",
    degrees: ["i9", "bVII9#11", "bVI^maj7", "bV7#9", "iv9", "bIII^maj7", "bVII7alt"],
    difficulty: "advanced",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 105,
    description: "P-Funk de George Clinton",
    reference: "Parliament - Mothership Connection",
    isActive: true
  },
  {
    name: "Red Hot Chili Peppers",
    degrees: ["i", "bVII", "bVI", "bII", "i", "iv", "bVII"],
    difficulty: "advanced",
    category: "funk",
    mode: "minor",
    timeSignature: "7/8",
    tempo: 140,
    description: "Funk rock alternativo com métrica irregular",
    reference: "Red Hot Chili Peppers - Around the World",
    isActive: true
  },
  {
    name: "Jamiroquai Acid Jazz",
    degrees: ["i^maj7", "bIII^maj7#11", "bVI^maj7", "bII^maj7", "V7alt", "i^maj7", "iv^add9"],
    difficulty: "advanced",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 125,
    description: "Acid jazz funk do Jamiroquai",
    reference: "Jamiroquai - Virtual Insanity",
    isActive: true
  },

  // === ROCK ADVANCED (5) ===
  {
    name: "King Crimson Madness",
    degrees: ["i", "bii°", "bIII+", "biv°", "bV", "bvi°", "bVII"],
    difficulty: "advanced",
    category: "rock",
    mode: "minor",
    timeSignature: "21/16",
    tempo: 200,
    description: "Progressivismo extremo do King Crimson",
    reference: "King Crimson - Frame by Frame",
    isActive: true
  },
  {
    name: "Tool Progressive",
    degrees: ["i", "bVI", "bVII", "i", "bV", "bVI", "i"],
    difficulty: "advanced",
    category: "rock",
    mode: "minor",
    timeSignature: "7/8",
    tempo: 160,
    description: "Metal progressivo do Tool",
    reference: "Tool - Schism",
    isActive: true
  },
  {
    name: "Yes Complex",
    degrees: ["I", "bVII/bIII", "bIII", "bII", "I/3", "iv", "V"],
    difficulty: "advanced",
    category: "rock",
    mode: "major",
    timeSignature: "15/8",
    tempo: 140,
    description: "Rock progressivo complexo do Yes",
    reference: "Yes - Close to the Edge",
    isActive: true
  },
  {
    name: "Porcupine Tree Modern",
    degrees: ["i", "bVII", "bvi°", "bV", "iv", "bIII", "bii°"],
    difficulty: "advanced",
    category: "rock",
    mode: "minor",
    timeSignature: "11/8",
    tempo: 120,
    description: "Progressive metal moderno",
    reference: "Porcupine Tree - Trains",
    isActive: true
  },
  {
    name: "Pink Floyd Experimental",
    degrees: ["I", "bVII/5", "bVI", "bV", "IV", "bIII", "bII"],
    difficulty: "advanced",
    category: "rock",
    mode: "major",
    timeSignature: "7/4",
    tempo: 85,
    description: "Experimentalismo do Pink Floyd",
    reference: "Pink Floyd - Shine On You Crazy Diamond",
    isActive: true
  },

  // === SAMBA ADVANCED (5) ===
  {
    name: "Pixinguinha Harmony",
    degrees: ["I7", "VI7", "ii°7", "V7", "iii7", "bIII°7", "ii7"],
    difficulty: "advanced",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 180,
    description: "Harmonias sofisticadas de Pixinguinha",
    reference: "Pixinguinha - Carinhoso",
    isActive: true
  },
  {
    name: "Hermeto Pascoal Samba",
    degrees: ["I^maj7#11", "bII^maj7", "bVII^maj7/5", "I^maj7", "iv^add9", "bVII7alt", "I^maj7#11"],
    difficulty: "advanced",
    category: "samba",
    mode: "major",
    timeSignature: "7/8",
    tempo: 150,
    description: "Samba experimental de Hermeto Pascoal",
    reference: "Hermeto Pascoal - Bebê",
    isActive: true
  },
  {
    name: "Egberto Gismonti",
    degrees: ["i^maj7", "bVII^sus2", "bVI^add9", "bV^maj7#11", "iv^sus4", "bIII^maj7", "bII^maj7"],
    difficulty: "advanced",
    category: "samba",
    mode: "minor",
    timeSignature: "5/4",
    tempo: 130,
    description: "Samba moderno de Egberto Gismonti",
    reference: "Egberto Gismonti - Água e Vinho",
    isActive: true
  },
  {
    name: "Guinga Sophisticated",
    degrees: ["I^maj7", "bVII^maj7/3", "bVI^maj7", "V7alt", "iii7", "bIII°7", "ii7"],
    difficulty: "advanced",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 140,
    description: "Sofisticação harmônica de Guinga",
    reference: "Guinga - Pra Quem Quiser",
    isActive: true
  },
  {
    name: "Yamandú Costa Modern",
    degrees: ["I", "bII/5", "i6", "bVII7", "bVI^maj7", "V7alt", "I"],
    difficulty: "advanced",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 200,
    description: "Samba virtuosístico de Yamandú Costa",
    reference: "Yamandú Costa - Remelexo",
    isActive: true
  },

  // === MPB ADVANCED (5) ===
  {
    name: "O Trem Azul (Lô Borges)",
    degrees: ["I^maj7", "bVI^maj7", "bIII^maj7", "bVII^maj7", "IV^maj7", "bII^maj7", "I^maj7"],
    difficulty: "advanced",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 75,
    description: "Progressão harmônica sofisticada de 'O Trem Azul'",
    reference: "O Trem Azul - Lô Borges",
    isActive: true
  },
  {
    name: "Arrigo Barnabé Vanguard",
    degrees: ["I^maj7#11", "bII7#9", "bVII^maj7/5", "bVI7alt", "V7#5", "iv^maj7", "I^maj7#11"],
    difficulty: "advanced",
    category: "mpb",
    mode: "major",
    timeSignature: "11/8",
    tempo: 110,
    description: "Vanguarda musical de Arrigo Barnabé",
    reference: "Arrigo Barnabé - Clara Crocodilo",
    isActive: true
  },
  {
    name: "Itamar Assumpção",
    degrees: ["i^add9", "bII^maj7", "bvii°7", "bVI7", "V7alt", "iv^sus4", "bVII7#9"],
    difficulty: "advanced",
    category: "mpb",
    mode: "minor",
    timeSignature: "7/8",
    tempo: 95,
    description: "Experimentalismo de Itamar Assumpção",
    reference: "Itamar Assumpção - Às Próprias Custas",
    isActive: true
  },
  {
    name: "Metá Metá Experimental",
    degrees: ["i", "bII", "biii", "bIV", "bV", "bvi", "bVII"],
    difficulty: "advanced",
    category: "mpb",
    mode: "minor",
    timeSignature: "9/8",
    tempo: 125,
    description: "MPB experimental do coletivo Metá Metá",
    reference: "Metá Metá - MetaL MetaL",
    isActive: true
  },
  {
    name: "Kiko Dinucci Modern",
    degrees: ["I", "bVII/bII", "bII", "bVI", "bV", "iv", "bIII"],
    difficulty: "advanced",
    category: "mpb",
    mode: "major",
    timeSignature: "13/8",
    tempo: 140,
    description: "MPB contemporânea de Kiko Dinucci",
    reference: "Kiko Dinucci - No Circular",
    isActive: true
  },

  // === BLUES ADVANCED (5) ===
  {
    name: "Charlie Parker Blues",
    degrees: ["I7", "VI7", "ii7", "V7", "iii7", "VI7", "ii7"],
    difficulty: "advanced",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 200,
    description: "Blues bebop de Charlie Parker",
    reference: "Charlie Parker - Au Privave",
    isActive: true
  },
  {
    name: "Wes Montgomery Jazz Blues",
    degrees: ["I^maj7", "VI7alt", "ii7", "V7sus4", "iii7", "bIII°7", "ii7"],
    difficulty: "advanced",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 140,
    description: "Blues jazz de Wes Montgomery",
    reference: "Wes Montgomery - West Coast Blues",
    isActive: true
  },
  {
    name: "Modern Blues Fusion",
    degrees: ["I7#9", "bVII7#9", "IV7#11", "bIII7#9", "VI7alt", "bII7", "V7alt"],
    difficulty: "advanced",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 130,
    description: "Blues fusion moderno",
    reference: "John Scofield - A Go Go",
    isActive: true
  },
  {
    name: "Pat Metheny Blues",
    degrees: ["I^maj7", "bVII^maj7/9", "IV^maj7#11", "bIII^maj7", "vi7", "bII^maj7", "V7sus4"],
    difficulty: "advanced",
    category: "blues",
    mode: "major",
    timeSignature: "5/4",
    tempo: 120,
    description: "Blues moderno de Pat Metheny",
    reference: "Pat Metheny - The Way Up",
    isActive: true
  },
  {
    name: "Allan Holdsworth Blues",
    degrees: ["I^maj7#11", "bVII7alt", "IV^maj7#5", "bIII7#9#11", "vi7b5", "bII^maj7", "V7alt"],
    difficulty: "advanced",
    category: "blues",
    mode: "major",
    timeSignature: "7/8",
    tempo: 180,
    description: "Blues fusion de Allan Holdsworth",
    reference: "Allan Holdsworth - Road Games",
    isActive: true
  }
];

// ===============================
// 🚀 FUNÇÃO PARA POPULAR O BANCO
// ===============================

export async function seedChordProgressions() {
  try {
    console.log('🎼 Iniciando seed de progressões harmônicas...');
    console.log(`📊 Total de progressões: ${seedProgressions.length}`);
    
    // Verificar distribuição
    const distribution: Record<string, Record<string, number>> = {};
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const categories = ['pop', 'jazz', 'classical', 'bossa', 'modal', 'funk', 'rock', 'samba', 'mpb', 'blues'];
    
    difficulties.forEach(diff => {
      distribution[diff] = {};
      categories.forEach(cat => {
        distribution[diff][cat] = seedProgressions.filter(p => p.difficulty === diff && p.category === cat).length;
      });
    });
    
    console.log('📈 Distribuição por dificuldade e categoria:');
    console.table(distribution);
    
    // Verifica se já existem progressões
    const existingCount = await ChordProgression.countDocuments();
    
    if (existingCount > 0) {
      console.log(`🎼 Já existem ${existingCount} progressões no banco`);
      console.log('🗑️ Limpando banco antes de inserir novas progressões...');
      await ChordProgression.deleteMany({});
    }
    
    // Insere as progressões
    const result = await ChordProgression.insertMany(seedProgressions);
    console.log(`✅ ${result.length} progressões inseridas com sucesso!`);
    
    // Verificação final
    const finalCount = await ChordProgression.countDocuments();
    console.log(`🎵 Total final no banco: ${finalCount} progressões`);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao popular progressões:', error);
    throw error;
  }
}