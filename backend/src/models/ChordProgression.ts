// src/models/ChordProgression.ts - SEED CORRIGIDO PEDAGOGICAMENTE
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
// 🎼 SEED DATA - 150 PROGRESSÕES PEDAGOGICAMENTE CORRETAS
// ===============================

export const seedProgressions: Partial<IChordProgression>[] = [

  // ========================================
  // 🟢 BEGINNER - 50 progressões (5 de cada estilo)
  // APENAS: Campo harmônico tonal + preparações básicas simples (V/ii, V/vi, V/IV)
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
    description: "Campo harmônico maior puro - Canon de Pachelbel",
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
    description: "Progressão pop mais usada - totalmente diatônica",
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
    description: "Clássica dos anos 50 - campo harmônico básico",
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
    description: "Balada folk simples - acordes naturais",
    reference: "Good Riddance, House of the Rising Sun",
    isActive: true
  },
  {
    name: "Circle Descent Basic",
    degrees: ["vi", "ii", "V", "I", "vi", "ii"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "Movimento básico pelo círculo das quintas",
    reference: "Fly Me to the Moon (pop version)",
    isActive: true
  },

  // === JAZZ BEGINNER (5) ===
  {
    name: "ii-V-I Basic",
    degrees: ["ii", "V", "I", "vi", "ii", "V"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Cadência fundamental - sem extensões",
    reference: "All The Things You Are (simplificado)",
    isActive: true
  },
  {
    name: "V of vi Preparation",
    degrees: ["I", "IV", "V/vi", "vi", "ii", "V", "I"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 140,
    description: "Preparação básica do vi (E7 em Dó maior)",
    reference: "I Got Rhythm (básico)",
    isActive: true
  },
  {
    name: "Autumn Leaves Simple",
    degrees: ["ii", "V", "I", "IV", "iii", "vi"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Autumn Leaves sem sétimas - campo harmônico",
    reference: "Autumn Leaves (simplificado)",
    isActive: true
  },
  {
    name: "Blue Moon Tonal",
    degrees: ["I", "vi", "ii", "V", "I"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 80,
    description: "Blue Moon no campo harmônico básico",
    reference: "Blue Moon, Heart and Soul",
    isActive: true
  },
  {
    name: "Take Five Basic",
    degrees: ["ii", "V", "I", "ii", "V"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    timeSignature: "5/4",
    tempo: 170,
    description: "Take Five simplificado - sem sétimas",
    reference: "Take Five - Dave Brubeck (básico)",
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
    description: "Sequência barroca no campo harmônico",
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
    name: "V of IV Preparation",
    degrees: ["I", "vi", "ii", "V/IV", "IV", "V", "I"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Preparação básica do IV grau (C7 para F em Dó)",
    reference: "Mozart - Sonata K.331",
    isActive: true
  },
  {
    name: "Romantic Simple",
    degrees: ["I", "vi", "IV", "V", "vi", "IV"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    timeSignature: "3/4",
    tempo: 70,
    description: "Romantismo básico - campo harmônico",
    reference: "Chopin - Valsas (simplificado)",
    isActive: true
  },
  {
    name: "Circle of Fifths Basic",
    degrees: ["I", "vi", "ii", "V", "I", "vi"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    timeSignature: "2/4",
    tempo: 100,
    description: "Círculo das quintas básico",
    reference: "Bach - Prelúdios",
    isActive: true
  },

  // === BOSSA BEGINNER (5) ===
  {
    name: "Bossa Nova Basic",
    degrees: ["I", "vi", "ii", "V", "I", "vi"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Bossa nova no campo harmônico básico",
    reference: "Girl from Ipanema (simplificado)",
    isActive: true
  },
  {
    name: "Corcovado Simple",
    degrees: ["I", "iii", "vi", "ii", "V", "I"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 90,
    description: "Corcovado sem extensões harmônicas",
    reference: "Corcovado - Tom Jobim (básico)",
    isActive: true
  },
  {
    name: "Desafinado Tonal",
    degrees: ["I", "IV", "iii", "vi", "ii", "V"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Desafinado no campo harmônico maior",
    reference: "Desafinado - Tom Jobim (básico)",
    isActive: true
  },
  {
    name: "Wave Basic",
    degrees: ["I", "ii", "V", "I", "vi", "ii"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Wave com acordes básicos",
    reference: "Wave - Tom Jobim (básico)",
    isActive: true
  },
  {
    name: "One Note Samba Tonal",
    degrees: ["I", "iii", "vi", "ii", "V", "I"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 80,
    description: "Samba de Uma Nota no campo harmônico",
    reference: "Samba de Uma Nota Só (básico)",
    isActive: true
  },

  // === MODAL BEGINNER (5) ===
  {
    name: "Dorian Simple",
    degrees: ["i", "IV", "i", "IV", "i", "bVII"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 85,
    description: "Dórico básico com tríades naturais",
    reference: "So What - Miles Davis (simplificado)",
    isActive: true
  },
  {
    name: "Mixolydian Basic",
    degrees: ["I", "bVII", "IV", "I", "bVII", "IV"],
    difficulty: "beginner",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Mixolídio com tríades básicas",
    reference: "Fire on the Mountain",
    isActive: true
  },
  {
    name: "Aeolian Natural",
    degrees: ["i", "bVI", "bVII", "i", "bVI", "bVII"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Menor natural - modo eólio puro",
    reference: "House of the Rising Sun",
    isActive: true
  },
  {
    name: "Phrygian Basic",
    degrees: ["i", "bII", "i", "bII", "i", "bVII"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 100,
    description: "Frígio básico com bII característico",
    reference: "White Rabbit (simplificado)",
    isActive: true
  },
  {
    name: "Lydian Simple",
    degrees: ["I", "#IV", "I", "#IV", "I", "V"],
    difficulty: "beginner",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 75,
    description: "Lídio com #IV característico",
    reference: "Dreams - Fleetwood Mac",
    isActive: true
  },

  // === FUNK BEGINNER (5) ===
  {
    name: "Funk Basic",
    degrees: ["i", "i", "iv", "i", "v", "i"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 110,
    description: "Funk básico com tríades menores",
    reference: "Superstition (simplificado)",
    isActive: true
  },
  {
    name: "James Brown Simple",
    degrees: ["i", "IV", "i", "IV", "i", "bVII"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 120,
    description: "James Brown com acordes básicos",
    reference: "Get Up (I Feel Like Being a) Sex Machine",
    isActive: true
  },
  {
    name: "P-Funk Vamp Basic",
    degrees: ["i", "iv", "i", "iv", "i", "iv"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 100,
    description: "P-Funk vamp com tríades",
    reference: "Flash Light (básico)",
    isActive: true
  },
  {
    name: "Soul Funk Tonal",
    degrees: ["i", "bIII", "bVII", "IV", "i", "bVII"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 95,
    description: "Soul funk com acordes naturais",
    reference: "What's Going On (básico)",
    isActive: true
  },
  {
    name: "Disco Funk Simple",
    degrees: ["i", "bVII", "bVI", "bVII", "i", "bVII"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 120,
    description: "Disco funk anos 70 básico",
    reference: "Le Freak (básico)",
    isActive: true
  },

  // === ROCK BEGINNER (5) ===
  {
    name: "Power Ballad Simple",
    degrees: ["vi", "IV", "I", "V", "vi", "IV"],
    difficulty: "beginner",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 70,
    description: "Power ballad no campo harmônico",
    reference: "Every Rose Has Its Thorn",
    isActive: true
  },
  {
    name: "Classic Rock Basic",
    degrees: ["I", "bVII", "IV", "I", "bVII", "IV"],
    difficulty: "beginner",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Rock clássico com bVII natural",
    reference: "Born to Be Wild",
    isActive: true
  },
  {
    name: "Grunge Simple",
    degrees: ["i", "bVI", "bVII", "i", "bVI", "bVII"],
    difficulty: "beginner",
    category: "rock",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Grunge com acordes naturais",
    reference: "Smells Like Teen Spirit (básico)",
    isActive: true
  },
  {
    name: "Arena Rock Tonal",
    degrees: ["I", "V", "vi", "IV", "I", "V"],
    difficulty: "beginner",
    category: "rock",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Rock de arena básico",
    reference: "Don't Stop Believin' (básico)",
    isActive: true
  },
  {
    name: "Hard Rock Simple",
    degrees: ["i", "bVI", "i", "bVII", "i", "bVI"],
    difficulty: "beginner",
    category: "rock",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 130,
    description: "Hard rock com movimento natural",
    reference: "Back in Black (básico)",
    isActive: true
  },

  // === SAMBA BEGINNER (5) ===
  {
    name: "Samba de Roda Basic",
    degrees: ["I", "V", "I", "V", "I", "IV"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 120,
    description: "Samba tradicional com tríades",
    reference: "Samba de Roda - Tradição Bahiana",
    isActive: true
  },
  {
    name: "Samba Canção Simple",
    degrees: ["I", "vi", "ii", "V", "I", "vi"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "4/4",
    tempo: 80,
    description: "Samba canção no campo harmônico",
    reference: "Aquarela do Brasil (básico)",
    isActive: true
  },
  {
    name: "Pagode Basic",
    degrees: ["I", "vi", "ii", "V", "I", "vi"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 130,
    description: "Pagode carioca básico",
    reference: "Fundo de Quintal",
    isActive: true
  },
  {
    name: "Samba Enredo Tonal",
    degrees: ["I", "IV", "V", "I", "vi", "ii"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 140,
    description: "Samba enredo com acordes naturais",
    reference: "Sambas de Enredo",
    isActive: true
  },
  {
    name: "Choro Samba Basic",
    degrees: ["I", "V", "vi", "ii", "V", "I"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 110,
    description: "Samba-choro no campo harmônico",
    reference: "Tico-Tico (básico)",
    isActive: true
  },

  // === MPB BEGINNER (5) ===
  {
    name: "Tropicália Simple",
    degrees: ["I", "iii", "vi", "ii", "V", "I"],
    difficulty: "beginner",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 90,
    description: "Tropicália no campo harmônico",
    reference: "Alegria, Alegria (básico)",
    isActive: true
  },
  {
    name: "Bossa MPB Basic",
    degrees: ["I", "vi", "ii", "V", "iii", "vi"],
    difficulty: "beginner",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "MPB-bossa nova básica",
    reference: "Chega de Saudade (básico)",
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
    description: "MPB folk com simplicidade",
    reference: "Tocando em Frente",
    isActive: true
  },
  {
    name: "Nordestina Basic",
    degrees: ["i", "bVII", "bVI", "bVII", "i", "bVII"],
    difficulty: "beginner",
    category: "mpb",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 95,
    description: "MPB nordestina com acordes naturais",
    reference: "Asa Branca (básico)",
    isActive: true
  },
  {
    name: "Jobim Basic",
    degrees: ["I", "IV", "iii", "vi", "ii", "V"],
    difficulty: "beginner",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Tom Jobim no campo harmônico",
    reference: "Águas de Março (básico)",
    isActive: true
  },

  // === BLUES BEGINNER (5) ===
  {
    name: "12-Bar Blues First Part",
    degrees: ["I", "I", "I", "I", "IV", "IV"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "Primeiros 6 compassos do blues básico",
    reference: "Sweet Home Chicago",
    isActive: true
  },
  {
    name: "Minor Blues Basic",
    degrees: ["i", "iv", "i", "v", "i", "iv"],
    difficulty: "beginner",
    category: "blues",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Blues menor com tríades",
    reference: "The Thrill Is Gone (básico)",
    isActive: true
  },
  {
    name: "Slow Blues Simple",
    degrees: ["I", "IV", "I", "V", "I", "V"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    timeSignature: "12/8",
    tempo: 60,
    description: "Blues lento com tríades",
    reference: "Red House (básico)",
    isActive: true
  },
  {
    name: "Chicago Blues Basic",
    degrees: ["I", "I", "IV", "I", "V", "IV"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 130,
    description: "Blues de Chicago básico",
    reference: "Muddy Waters Style (básico)",
    isActive: true
  },
  {
    name: "Country Blues Simple",
    degrees: ["I", "V", "I", "IV", "I", "V"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Blues country com acordes naturais",
    reference: "Robert Johnson Style",
    isActive: true
  },

  // ========================================
  // 🟡 INTERMEDIATE - 50 progressões (5 de cada estilo)
  // Empréstimos modais (bVI, bVII, iv em maior) + dominantes secundárias + sétimas
  // ========================================

  // === POP INTERMEDIATE (5) ===
  {
    name: "Pop with Secondary Dominants",
    degrees: ["I", "V7/vi", "vi", "V7/ii", "ii", "V7", "I"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Pop com dominantes secundárias básicas",
    reference: "The Way You Look Tonight",
    isActive: true
  },
  {
    name: "Beatles Modal Borrowing",
    degrees: ["I", "bVI", "bVII", "I", "iv", "I", "V"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 88,
    description: "Empréstimos modais do menor paralelo",
    reference: "While My Guitar Gently Weeps",
    isActive: true
  },
  {
    name: "Pop Modulation",
    degrees: ["I", "V/ii", "ii", "V/V", "V", "I", "vi"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Modulação via dominantes secundárias",
    reference: "Penny Lane - The Beatles",
    isActive: true
  },
  {
    name: "Neo-Soul Pop",
    degrees: ["Imaj7", "iii7", "vi7", "ii7", "V7sus4", "Imaj7", "iv6"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "Pop neo-soul com sétimas e empréstimo modal",
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
    description: "Movimento cromático com empréstimo do iv",
    reference: "Yesterday - The Beatles",
    isActive: true
  },

  // === JAZZ INTERMEDIATE (5) ===
  {
    name: "ii-V-I with Extensions",
    degrees: ["Imaj7", "vi7", "ii7", "V7", "Imaj7", "V7/ii", "ii7", "V7", "Imaj7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 120,
    description: "ii-V-I com sétimas e dominante secundária",
    reference: "All The Things You Are",
    isActive: true
  },
  {
    name: "Autumn Leaves A Section",
    degrees: ["ii7", "V7", "Imaj7", "IVmaj7", "iii7", "VI7", "ii7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Seção A com dominante secundária VI7",
    reference: "Autumn Leaves",
    isActive: true
  },
  {
    name: "Stella by Starlight",
    degrees: ["iii7", "VI7", "iimaj7", "V7", "Imaj7", "IVmaj7", "iii7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Harmonia de Stella com VI7 secundária",
    reference: "Stella by Starlight",
    isActive: true
  },
  {
    name: "Tritone Substitution Basic",
    degrees: ["Imaj7", "ii7", "bII7", "Imaj7", "vi7", "bII7", "V7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 130,
    description: "Introdução à substituição de trítono",
    reference: "Misty com substituições",
    isActive: true
  },
  {
    name: "Cherokee Changes",
    degrees: ["Imaj7", "ii7", "V7", "Imaj7", "I7", "IVmaj7", "iv7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 160,
    description: "Cherokee com empréstimo modal (iv7)",
    reference: "Cherokee (Indian Love Song)",
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
    description: "Coral bachiano com inversões e sétimas",
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
    description: "Introdução à sexta napolitana",
    reference: "Beethoven - Sonata Patética",
    isActive: true
  },
  {
    name: "Applied Dominants Classical",
    degrees: ["I", "vi", "V7/V", "V7", "I", "IV", "V"],
    difficulty: "intermediate",
    category: "classical",
    mode: "major",
    timeSignature: "3/4",
    tempo: 100,
    description: "Dominantes aplicadas no estilo clássico",
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
    description: "Sequência por quintas com sétimas",
    reference: "Vivaldi - Quatro Estações",
    isActive: true
  },
  {
    name: "Diminished Seventh Basic",
    degrees: ["I", "vii°7", "I6", "ii7", "V7", "I"],
    difficulty: "intermediate",
    category: "classical",
    mode: "major",
    timeSignature: "2/4",
    tempo: 120,
    description: "Introdução às sétimas diminutas",
    reference: "Chopin - Ballades",
    isActive: true
  },

  // === BOSSA INTERMEDIATE (5) ===
  {
    name: "Jobim Sophisticated",
    degrees: ["Imaj7", "I7/3", "IVmaj7", "iv6", "iii7", "VI7", "ii7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 105,
    description: "Jobim com sétimas e empréstimo modal (iv6)",
    reference: "Insensatez",
    isActive: true
  },
  {
    name: "Chega de Saudade",
    degrees: ["Imaj7", "vi7", "ii7", "V7", "iii7", "VI7", "ii7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 115,
    description: "Chega de Saudade com dominante secundária",
    reference: "Chega de Saudade - Tom Jobim",
    isActive: true
  },
  {
    name: "Girl from Ipanema B",
    degrees: ["iimaj7", "V7", "Imaj7", "Imaj7", "ii7", "V7", "imaj7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 125,
    description: "Seção B com modulação para tom relativo",
    reference: "Girl from Ipanema - Tom Jobim",
    isActive: true
  },
  {
    name: "Dindi with bII",
    degrees: ["Imaj7", "bIImaj7", "Imaj7", "vi7", "ii7", "V7", "Imaj7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Dindi com empréstimo modal bII",
    reference: "Dindi - Tom Jobim",
    isActive: true
  },
  {
    name: "Wave with Dominants",
    degrees: ["Imaj7", "iii7", "VI7", "ii7", "V7", "Imaj7", "vi7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Wave com dominantes secundárias",
    reference: "Wave - Tom Jobim",
    isActive: true
  },

  // === MODAL INTERMEDIATE (5) ===
  {
    name: "Dorian with Sevenths",
    degrees: ["i7", "bVIImaj7", "IVmaj7", "i7", "bVImaj7", "bVIImaj7", "i7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Dórico com harmonias de sétima",
    reference: "Miles Davis - Kind of Blue",
    isActive: true
  },
  {
    name: "Lydian with Extensions",
    degrees: ["Imaj7#11", "II7", "Imaj7#11", "bVIImaj7", "Imaj7#11", "V7sus4", "Imaj7#11"],
    difficulty: "intermediate",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "Lídio com extensões e dominante secundária",
    reference: "Joe Satriani - Flying in a Blue Dream",
    isActive: true
  },
  {
    name: "Mixolydian Jazz",
    degrees: ["I7", "bVIImaj7", "IVmaj7", "I7", "ii7", "bVIImaj7", "I7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 125,
    description: "Mixolídio com harmonias jazz",
    reference: "Herbie Hancock - Chameleon",
    isActive: true
  },
  {
    name: "Phrygian Dominant Basic",
    degrees: ["I7", "bIImaj7", "i7", "IV7", "i7", "bIImaj7", "I7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Frígio dominante com sétimas",
    reference: "Paco de Lucía - Flamenco",
    isActive: true
  },
  {
    name: "Locrian Exploration",
    degrees: ["i°7", "bIImaj7", "biii7", "iv7", "bVmaj7", "bvi7", "bVII7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 75,
    description: "Exploração do lócrio com sétimas",
    reference: "Metallica - Nothing Else Matters",
    isActive: true
  },

  // === FUNK INTERMEDIATE (5) ===
  {
    name: "Extended Funk",
    degrees: ["i7", "iv7", "bVII7", "iv7", "i7", "bVImaj7", "bVII7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 105,
    description: "Funk com sétimas e empréstimos modais",
    reference: "Parliament - Flash Light",
    isActive: true
  },
  {
    name: "Neo-Soul Funk",
    degrees: ["i7", "iv7", "bVIImaj7", "bVImaj7", "i7", "ii7b5", "V7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 90,
    description: "Neo-soul funk com acordes menores meio-diminutos",
    reference: "D'Angelo - Voodoo",
    isActive: true
  },
  {
    name: "Acid Jazz Funk",
    degrees: ["i7", "bIIImaj7", "bVImaj7", "bVII7", "i7", "iv7", "V7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 115,
    description: "Acid jazz com empréstimos modais",
    reference: "Jamiroquai Style",
    isActive: true
  },
  {
    name: "Gospel Funk",
    degrees: ["Imaj7", "iii7", "vi7", "IVmaj7", "ii7", "V7sus4", "Imaj7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Funk gospel com sétimas e suspensões",
    reference: "Stevie Wonder - As",
    isActive: true
  },
  {
    name: "Fusion Funk Basic",
    degrees: ["i7", "bII7", "i7", "iv7", "bVII7", "bVImaj7", "V7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 120,
    description: "Funk fusion com substituição de trítono",
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
    description: "Alt rock com empréstimos modais",
    reference: "Radiohead - Creep",
    isActive: true
  },
  {
    name: "Metal with Chromaticism",
    degrees: ["i", "bII", "i", "bVI", "bVII", "i"],
    difficulty: "intermediate",
    category: "rock",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 150,
    description: "Metal com movimento cromático",
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
    description: "Indie rock com acordes de sétima",
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
    description: "Southern rock com bVII emprestado",
    reference: "Lynyrd Skynyrd - Sweet Home Alabama",
    isActive: true
  },

  // === SAMBA INTERMEDIATE (5) ===
  {
    name: "Samba Jazz",
    degrees: ["Imaj7", "VI7", "ii7", "V7", "iii7", "VI7", "ii7"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 140,
    description: "Samba com harmonias jazz e dominantes secundárias",
    reference: "Elis Regina - Águas de Março",
    isActive: true
  },
  {
    name: "Partido Alto Complex",
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
    degrees: ["Imaj7", "bIImaj7", "Imaj7", "vi7", "ii7", "V7", "Imaj7"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 135,
    description: "Samba contemporâneo com empréstimo modal",
    reference: "Ivan Lins Style",
    isActive: true
  },
  {
    name: "Gafieira",
    degrees: ["I", "VI7", "ii", "V7", "iii", "vi", "ii"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 150,
    description: "Gafieira com dominantes secundárias",
    reference: "Orquestra Tabajara",
    isActive: true
  },

  // === MPB INTERMEDIATE (5) ===
  {
    name: "Caetano Modal",
    degrees: ["Imaj7", "bVIImaj7", "IVmaj7", "bVImaj7", "Imaj7", "iii7", "vi7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Caetano com empréstimos modais e sétimas",
    reference: "Caetano Veloso - Tropicália",
    isActive: true
  },
  {
    name: "Milton Nascimento",
    degrees: ["Imaj7", "iv6", "bVIImaj7", "Imaj7", "ii7", "V7sus4", "Imaj7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 85,
    description: "Milton com empréstimos modais",
    reference: "Milton Nascimento - Travessia",
    isActive: true
  },
  {
    name: "Djavan Style",
    degrees: ["Imaj7", "iii7", "VI7", "ii7", "V7sus4", "Imaj7", "vi7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Djavan com dominantes secundárias",
    reference: "Djavan - Flor de Lis",
    isActive: true
  },
  {
    name: "Edu Lobo",
    degrees: ["Imaj7", "bIImaj7", "bVIImaj7", "Imaj7", "iv7", "bVII7", "Imaj7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 90,
    description: "Edu Lobo com empréstimos modais",
    reference: "Edu Lobo - Casa Forte",
    isActive: true
  },
  {
    name: "Lô Borges",
    degrees: ["i7", "VI7", "i7", "iv7", "bVII7", "i7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 85,
    description: "Lô Borges com dominantes secundárias",
    reference: "Vento de Maio - Lô Borges",
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
    description: "Blues com harmonias jazz e dominantes secundárias",
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
    description: "Stormy Monday com dominantes",
    reference: "Stormy Monday - T-Bone Walker",
    isActive: true
  },
  {
    name: "Blues with Tritone Subs",
    degrees: ["I7", "bII7", "I7", "I7", "IV7", "bV7", "I7"],
    difficulty: "intermediate",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 110,
    description: "Blues com substituições de trítono básicas",
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
    description: "Blues menor com acordes meio-diminutos",
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
    description: "Blues bebop com dominantes secundárias",
    reference: "Straight No Chaser - Monk",
    isActive: true
  },

  // ========================================
  // 🔴 ADVANCED - 50 progressões (5 de cada estilo)
  // Reharmonizações complexas + acordes alterados + politonalidade + extensões avançadas
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
    description: "Beatles tardio com reharmonizações complexas",
    reference: "Here Comes the Sun - The Beatles",
    isActive: true
  },
  {
    name: "Steely Dan Harmony",
    degrees: ["Imaj7", "iii7", "bIII°7", "ii7", "bII7", "Imaj7", "vi7"],
    difficulty: "advanced",
    category: "pop",
    mode: "major",
    timeSignature: "4/4",
    tempo: 115,
    description: "Harmonias sofisticadas com diminutas e alterações",
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
    description: "Progressões complexas com sexta napolitana",
    reference: "Radiohead - Pyramid Song",
    isActive: true
  },
  {
    name: "Prince Funk Pop",
    degrees: ["i^add9", "bVIImaj7#11", "bVImaj7", "V7alt", "i^add9", "iv9", "bVII7"],
    difficulty: "advanced",
    category: "pop",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 125,
    description: "Prince com extensões e alterações",
    reference: "Prince - Purple Rain",
    isActive: true
  },
  {
    name: "Progressive Pop",
    degrees: ["Imaj7", "V/ii", "iimaj7", "bVIImaj7", "IVmaj7/5", "iii7", "vi^add9"],
    difficulty: "advanced",
    category: "pop",
    mode: "major",
    timeSignature: "5/4",
    tempo: 95,
    description: "Pop progressivo com acordes de empréstimo modal",
    reference: "Genesis - Firth of Fifth",
    isActive: true
  },

  // === JAZZ ADVANCED (5) ===
  {
    name: "Giant Steps Full",
    degrees: ["Imaj7", "bIII7", "bVImaj7", "bII7", "Imaj7", "V7/V", "V7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 260,
    description: "Coltrane changes completas - ciclo de terças",
    reference: "Giant Steps - John Coltrane",
    isActive: true
  },
  {
    name: "Wayne Shorter Modern",
    degrees: ["imaj7", "bIImaj7", "bVIImaj7/5", "bVImaj7#11", "V7alt", "imaj7", "iv^add9"],
    difficulty: "advanced",
    category: "jazz",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 140,
    description: "Jazz modal moderno com acordes alterados",
    reference: "Wayne Shorter - Speak No Evil",
    isActive: true
  },
  {
    name: "Herbie Hancock Modal",
    degrees: ["Imaj7#11", "bVIImaj7", "bIIImaj7#11", "bVImaj7", "ii7", "V7sus4", "Imaj7#11"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    timeSignature: "4/4",
    tempo: 130,
    description: "Jazz modal com extensões #11",
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
    description: "Harmonias quartais avançadas",
    reference: "McCoy Tyner - The Real McCoy",
    isActive: true
  },
  {
    name: "Bill Evans Reharmonization",
    degrees: ["Imaj7", "bIImaj7/5", "Imaj7/3", "vi7", "ii7", "bII7", "Imaj7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    timeSignature: "3/4",
    tempo: 180,
    description: "Reharmonizações sofisticadas com inversões",
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
    description: "Cromatismo wagneriano com sextas aumentadas",
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
    description: "Romantismo tardio com sexta aumentada italiana",
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
    description: "Complexidade bachiana com tonicizações",
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
    description: "Beethoven tardio com acordes de empréstimo",
    reference: "Beethoven - Sonata Op. 111",
    isActive: true
  },
  {
    name: "Impressionist Harmony",
    degrees: ["Imaj7", "bIImaj7", "bIIImaj7", "Imaj7/5", "bVIImaj7", "bVImaj7", "Imaj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    timeSignature: "5/4",
    tempo: 70,
    description: "Harmonias impressionistas com planing",
    reference: "Debussy - Clair de Lune",
    isActive: true
  },

  // === BOSSA ADVANCED (5) ===
  {
    name: "Jobim Masterpiece",
    degrees: ["Imaj7", "bIImaj7/5", "imaj7", "bIIImaj7#11", "bVImaj7", "ii7", "V7alt"],
    difficulty: "advanced",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 105,
    description: "Obra-prima jobiniana com reharmonizações",
    reference: "Sabiá - Tom Jobim",
    isActive: true
  },
  {
    name: "Luiz Eça Reharmonization",
    degrees: ["Imaj7", "iii7", "bIII°7", "ii7", "bIImaj7", "Imaj7", "bVIImaj7"],
    difficulty: "advanced",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 115,
    description: "Reharmonizações sofisticadas do Tamba Trio",
    reference: "Luiz Eça - Tamba Trio",
    isActive: true
  },
  {
    name: "Baden Powell Guitar",
    degrees: ["imaj7", "bIImaj7", "bVIImaj7", "bVImaj7", "V7alt", "imaj7", "iv^add9"],
    difficulty: "advanced",
    category: "bossa",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 120,
    description: "Harmonias complexas de violão",
    reference: "Baden Powell - Samba Triste",
    isActive: true
  },
  {
    name: "João Gilberto Sophistication",
    degrees: ["Imaj7", "VI7alt", "iimaj7", "V7sus4", "iii7", "bIII°7", "ii7"],
    difficulty: "advanced",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 95,
    description: "Sofisticação harmônica com acordes alterados",
    reference: "João Gilberto - Chega de Saudade",
    isActive: true
  },
  {
    name: "Elis Regina Interpretation",
    degrees: ["Imaj7", "iv^add9", "bVIImaj7#11", "Imaj7/3", "vi7", "bIII7", "ii7"],
    difficulty: "advanced",
    category: "bossa",
    mode: "major",
    timeSignature: "4/4",
    tempo: 100,
    description: "Interpretação harmônica avançada",
    reference: "Elis Regina - Águas de Março",
    isActive: true
  },

  // === MODAL ADVANCED (5) ===
  {
    name: "Coltrane Modal Advanced",
    degrees: ["i^sus4", "bVII^sus4", "bVI^sus4", "bII^sus4", "i^sus4", "iv^sus4", "bVII^sus4"],
    difficulty: "advanced",
    category: "modal",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 150,
    description: "Modalismo avançado com harmonias quartais",
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
    description: "Fusion modal com movimento cromático",
    reference: "Mahavishnu Orchestra - Birds of Fire",
    isActive: true
  },
  {
    name: "Frank Zappa Modal",
    degrees: ["Imaj7#11", "bIImaj7", "bIIImaj7#11", "bIVmaj7", "bVmaj7#11", "bVImaj7", "bVIImaj7#11"],
    difficulty: "advanced",
    category: "modal",
    mode: "major",
    timeSignature: "17/16",
    tempo: 120,
    description: "Modalismo complexo com extensões",
    reference: "Frank Zappa - The Black Page",
    isActive: true
  },
  {
    name: "Pat Metheny Modal",
    degrees: ["Imaj7", "bVIImaj7/9", "bVImaj7", "bVmaj7#11", "Imaj7", "ii^sus4", "bVIImaj7"],
    difficulty: "advanced",
    category: "modal",
    mode: "major",
    timeSignature: "5/4",
    tempo: 140,
    description: "Modalismo sofisticado com extensões",
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
    description: "Progressivismo modal com acordes aumentados",
    reference: "King Crimson - Larks' Tongues",
    isActive: true
  },

  // === FUNK ADVANCED (5) ===
  {
    name: "Prince Advanced",
    degrees: ["i^add9", "bIImaj7#11", "bVII7#9", "bVImaj7", "V7alt", "i^add9", "iv^sus2"],
    difficulty: "advanced",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 130,
    description: "Funk avançado com acordes alterados",
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
    description: "Funk complexo com dominantes alteradas",
    reference: "Sly & Family Stone - There's a Riot",
    isActive: true
  },
  {
    name: "George Clinton P-Funk",
    degrees: ["i9", "bVII9#11", "bVImaj7", "bV7#9", "iv9", "bIIImaj7", "bVII7alt"],
    difficulty: "advanced",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 105,
    description: "P-Funk com extensões e alterações",
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
    description: "Funk rock com métrica irregular",
    reference: "Red Hot Chili Peppers - Around the World",
    isActive: true
  },
  {
    name: "Jamiroquai Acid Jazz",
    degrees: ["imaj7", "bIIImaj7#11", "bVImaj7", "bIImaj7", "V7alt", "imaj7", "iv^add9"],
    difficulty: "advanced",
    category: "funk",
    mode: "minor",
    timeSignature: "4/4",
    tempo: 125,
    description: "Acid jazz com reharmonizações complexas",
    reference: "Jamiroquai - Virtual Insanity",
    isActive: true
  },

  // === ROCK ADVANCED (5) ===
  {
    name: "King Crimson Extreme",
    degrees: ["i", "bii°", "bIII+", "biv°", "bV", "bvi°", "bVII"],
    difficulty: "advanced",
    category: "rock",
    mode: "minor",
    timeSignature: "21/16",
    tempo: 200,
    description: "Progressivismo extremo com acordes aumentados",
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
    description: "Metal progressivo com politonalidade",
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
    description: "Rock progressivo com acordes sobre acordes",
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
    description: "Progressive metal com acordes diminutos",
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
    description: "Experimentalismo com movimento cromático",
    reference: "Pink Floyd - Shine On You Crazy Diamond",
    isActive: true
  },

  // === SAMBA ADVANCED (5) ===
  {
    name: "Pixinguinha Advanced",
    degrees: ["I7", "VI7", "ii°7", "V7", "iii7", "bIII°7", "ii7"],
    difficulty: "advanced",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 180,
    description: "Harmonias sofisticadas com acordes diminutos",
    reference: "Pixinguinha - Carinhoso",
    isActive: true
  },
  {
    name: "Hermeto Pascoal",
    degrees: ["Imaj7#11", "bIImaj7", "bVIImaj7/5", "Imaj7", "iv^add9", "bVII7alt", "Imaj7#11"],
    difficulty: "advanced",
    category: "samba",
    mode: "major",
    timeSignature: "7/8",
    tempo: 150,
    description: "Samba experimental com alterações",
    reference: "Hermeto Pascoal - Bebê",
    isActive: true
  },
  {
    name: "Egberto Gismonti",
    degrees: ["imaj7", "bVII^sus2", "bVI^add9", "bVmaj7#11", "iv^sus4", "bIIImaj7", "bIImaj7"],
    difficulty: "advanced",
    category: "samba",
    mode: "minor",
    timeSignature: "5/4",
    tempo: 130,
    description: "Samba moderno com suspensões e extensões",
    reference: "Egberto Gismonti - Água e Vinho",
    isActive: true
  },
  {
    name: "Guinga Sophisticated",
    degrees: ["Imaj7", "bVIImaj7/3", "bVImaj7", "V7alt", "iii7", "bIII°7", "ii7"],
    difficulty: "advanced",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 140,
    description: "Sofisticação harmônica com inversões",
    reference: "Guinga - Pra Quem Quiser",
    isActive: true
  },
  {
    name: "Yamandú Costa Virtuoso",
    degrees: ["I", "bII/5", "i6", "bVII7", "bVImaj7", "V7alt", "I"],
    difficulty: "advanced",
    category: "samba",
    mode: "major",
    timeSignature: "2/4",
    tempo: 200,
    description: "Samba virtuosístico com acordes alterados",
    reference: "Yamandú Costa - Remelexo",
    isActive: true
  },

  // === MPB ADVANCED (5) ===
  {
    name: "O Trem Azul Advanced",
    degrees: ["Imaj7", "bVImaj7", "bIIImaj7", "bVIImaj7", "IVmaj7", "bIImaj7", "Imaj7"],
    difficulty: "advanced",
    category: "mpb",
    mode: "major",
    timeSignature: "4/4",
    tempo: 75,
    description: "Progressão sofisticada com movimento cromático",
    reference: "O Trem Azul - Lô Borges",
    isActive: true
  },
  {
    name: "Arrigo Barnabé Vanguard",
    degrees: ["Imaj7#11", "bII7#9", "bVIImaj7/5", "bVI7alt", "V7#5", "ivmaj7", "Imaj7#11"],
    difficulty: "advanced",
    category: "mpb",
    mode: "major",
    timeSignature: "11/8",
    tempo: 110,
    description: "Vanguarda musical com acordes alterados",
    reference: "Arrigo Barnabé - Clara Crocodilo",
    isActive: true
  },
  {
    name: "Itamar Assumpção",
    degrees: ["i^add9", "bIImaj7", "bvii°7", "bVI7", "V7alt", "iv^sus4", "bVII7#9"],
    difficulty: "advanced",
    category: "mpb",
    mode: "minor",
    timeSignature: "7/8",
    tempo: 95,
    description: "Experimentalismo com dominantes alteradas",
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
    description: "MPB experimental com movimento cromático",
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
    description: "MPB contemporânea com politonalidade",
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
    description: "Blues bebop com movimento harmônico rápido",
    reference: "Charlie Parker - Au Privave",
    isActive: true
  },
  {
    name: "Wes Montgomery Jazz Blues",
    degrees: ["Imaj7", "VI7alt", "ii7", "V7sus4", "iii7", "bIII°7", "ii7"],
    difficulty: "advanced",
    category: "blues",
    mode: "major",
    timeSignature: "4/4",
    tempo: 140,
    description: "Blues jazz com acordes alterados",
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
    description: "Blues fusion com extensões e alterações",
    reference: "John Scofield - A Go Go",
    isActive: true
  },
  {
    name: "Pat Metheny Blues",
    degrees: ["Imaj7", "bVIImaj7/9", "IVmaj7#11", "bIIImaj7", "vi7", "bIImaj7", "V7sus4"],
    difficulty: "advanced",
    category: "blues",
    mode: "major",
    timeSignature: "5/4",
    tempo: 120,
    description: "Blues moderno com extensões avançadas",
    reference: "Pat Metheny - The Way Up",
    isActive: true
  },
  {
    name: "Allan Holdsworth Blues",
    degrees: ["Imaj7#11", "bVII7alt", "IVmaj7#5", "bIII7#9#11", "vi7b5", "bIImaj7", "V7alt"],
    difficulty: "advanced",
    category: "blues",
    mode: "major",
    timeSignature: "7/8",
    tempo: 180,
    description: "Blues fusion com acordes ultra-complexos",
    reference: "Allan Holdsworth - Road Games",
    isActive: true
  }
];

// ===============================
// 🚀 FUNÇÃO PARA POPULAR O BANCO
// ===============================

export async function seedChordProgressions() {
  try {
    console.log('🎼 Iniciando seed CORRIGIDO pedagogicamente...');
    console.log('📚 Critérios pedagógicos aplicados:');
    console.log('   🟢 INICIANTE (50): APENAS campo harmônico + preparações básicas simples');
    console.log('   🟡 INTERMEDIÁRIO (50): Empréstimos modais + dominantes secundárias + sétimas');
    console.log('   🔴 AVANÇADO (50): Reharmonizações + acordes alterados + politonalidade');
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
    
    // Verificar totais
    const totals: Record<string, number> = {};
    difficulties.forEach(diff => {
      totals[diff] = seedProgressions.filter(p => p.difficulty === diff).length;
    });
    
    console.log('🎯 Totais por nível:');
    console.table(totals);
    
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