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
// 🎼 SEED DATA - 100+ PROGRESSÕES
// ===============================

export const seedProgressions: Partial<IChordProgression>[] = [
  
  // ========================================
  // 🎯 BEGINNER (25 progressões)
  // ========================================
  
  // === POP/ROCK CLASSICS ===
  {
    name: "I-V-vi-IV (Axis Progression)",
    degrees: ["I", "V", "vi", "IV"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    description: "A progressão mais popular da história (Let It Be, Don't Stop Believin')",
    reference: "The Beatles - Let It Be"
  },
  {
    name: "vi-IV-I-V (Pop Alternative)",
    degrees: ["vi", "IV", "I", "V"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    description: "Variação emocional da progressão clássica",
    reference: "Someone Like You - Adele"
  },
  {
    name: "I-vi-IV-V (50s Doo-Wop)",
    degrees: ["I", "vi", "IV", "V"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    description: "Progressão dos anos 50, muito usada no doo-wop",
    reference: "Stand By Me - Ben E. King"
  },
  {
    name: "I-IV-V-I (Three Chord Trick)",
    degrees: ["I", "IV", "V", "I"],
    difficulty: "beginner",
    category: "rock",
    mode: "major",
    description: "Base do rock'n'roll e country",
    reference: "Wild Thing - The Troggs"
  },
  {
    name: "vi-ii-V-I (Sad Progression)",
    degrees: ["vi", "ii", "V", "I"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    description: "Progressão melancólica muito usada em baladas",
    reference: "Mad World - Gary Jules"
  },

  // === JAZZ BASICS ===
  {
    name: "I-vi-ii-V-I (Jazz Standard)",
    degrees: ["I^maj7", "vi7", "ii7", "V7", "I^maj7"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    description: "Progressão fundamental do jazz - base para milhares de standards"
  },
  {
    name: "ii-V-I (Basic Cadence)",
    degrees: ["ii7", "V7", "I^maj7"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    description: "Cadência mais importante do jazz",
    reference: "Satin Doll - Duke Ellington"
  },
  {
    name: "I-I7-IV-iv (Chromatic Descent)",
    degrees: ["I", "I7", "IV", "iv"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    description: "Descida cromática clássica",
    reference: "All of Me - Gerald Marks"
  },

  // === BLUES ===
  {
    name: "12-Bar Blues (Basic)",
    degrees: ["I7", "I7", "I7", "I7", "IV7", "IV7", "I7", "I7", "V7", "IV7", "I7", "V7"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    description: "Forma básica do blues de 12 compassos"
  },
  {
    name: "8-Bar Blues",
    degrees: ["I7", "V7", "I7", "I7", "IV7", "IV7", "I7", "V7"],
    difficulty: "beginner",
    category: "blues",
    mode: "major",
    description: "Blues mais curto, muito usado"
  },

  // === MINOR MODES ===
  {
    name: "Natural Minor Circle",
    degrees: ["i", "bVII", "bVI", "bVII"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    description: "Círculo menor natural - muito dramático",
    reference: "Stairway to Heaven - Led Zeppelin"
  },
  {
    name: "i-iv-V-i (Minor ii-V-i)",
    degrees: ["i", "iv", "V", "i"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    description: "Progressão menor clássica"
  },
  {
    name: "i-bVII-bVI-bVII (Aeolian)",
    degrees: ["i", "bVII", "bVI", "bVII"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    description: "Modo Eólio - muito usado no rock"
  },

  // === BOSSA NOVA BASICS ===
  {
    name: "Basic Bossa Pattern",
    degrees: ["I^maj7", "VI7", "ii7", "V7"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    description: "Padrão básico da Bossa Nova",
    reference: "Girl from Ipanema - Tom Jobim"
  },
  {
    name: "I-vi-ii-V (Bossa Style)",
    degrees: ["I^maj7", "vi7", "ii7", "V7"],
    difficulty: "beginner",
    category: "bossa",
    mode: "major",
    description: "Bossa Nova com sextas menores"
  },

  // === SAMBA ===
  {
    name: "Samba de Roda",
    degrees: ["I", "IV", "I", "V"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    description: "Progressão básica do samba tradicional"
  },
  {
    name: "Pagode Pattern",
    degrees: ["I", "vi", "ii", "V"],
    difficulty: "beginner",
    category: "samba",
    mode: "major",
    description: "Padrão comum no pagode"
  },

  // === FUNK/R&B ===
  {
    name: "Basic Funk",
    degrees: ["i7", "iv7"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    description: "Funk básico de dois acordes",
    reference: "Chameleon - Herbie Hancock"
  },
  {
    name: "Funk Turnaround",
    degrees: ["i7", "iv7", "v7", "iv7"],
    difficulty: "beginner",
    category: "funk",
    mode: "minor",
    description: "Volta do funk"
  },

  // === COUNTRY/FOLK ===
  {
    name: "Country Gospel",
    degrees: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    description: "Progressão country gospel"
  },
  {
    name: "Folk Circle",
    degrees: ["vi", "IV", "I", "V"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    description: "Círculo folk muito usado"
  },

  // === REGGAE ===
  {
    name: "Basic Reggae",
    degrees: ["I", "V", "vi", "IV"],
    difficulty: "beginner",
    category: "pop",
    mode: "major",
    description: "Progressão básica do reggae",
    reference: "No Woman No Cry - Bob Marley"
  },

  // === CLASSICAL INSPIRED ===
  {
    name: "Canon Progression",
    degrees: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
    difficulty: "beginner",
    category: "classical",
    mode: "major",
    description: "Baseada no Canon de Pachelbel",
    reference: "Canon in D - Pachelbel"
  },

  // === GOSPEL ===
  {
    name: "Gospel Turnaround",
    degrees: ["I", "vi", "ii", "V"],
    difficulty: "beginner",
    category: "jazz",
    mode: "major",
    description: "Volta gospel clássica"
  },

  // === LATIN ===
  {
    name: "Mambo Pattern",
    degrees: ["i", "V", "i", "V"],
    difficulty: "beginner",
    category: "modal",
    mode: "minor",
    description: "Padrão básico do mambo"
  },

  // ========================================
  // 🎼 INTERMEDIATE (40 progressões)
  // ========================================

  // === LÔ BORGES (suas músicas) ===
  {
    name: "Vento de Maio (Lô Borges)",
    degrees: ["i7", "VI7", "i7", "#IV/V", "IV/V", "i7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "minor",
    description: "Progressão da clássica 'Vento de Maio'",
    reference: "Vento de Maio - Lô Borges"
  },
  {
    name: "O Trem Azul (Lô Borges)",
    degrees: ["I^maj7", "bVI^maj7", "bIII^maj7", "bVII^maj7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    description: "Progressão harmônica de 'O Trem Azul'",
    reference: "O Trem Azul - Lô Borges"
  },

  // === JAZZ INTERMEDIATE ===
  {
    name: "Rhythm Changes (A Section)",
    degrees: ["I", "VI7", "ii7", "V7", "I", "VI7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Seção A do Rhythm Changes",
    reference: "I Got Rhythm - George Gershwin"
  },
  {
    name: "Autumn Leaves Changes",
    degrees: ["ii7", "V7", "I^maj7", "IV^maj7", "vii7(b5)", "III7", "vi7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Progressão de Autumn Leaves",
    reference: "Autumn Leaves - Joseph Kosma"
  },
  {
    name: "All The Things You Are",
    degrees: ["vi7", "ii7", "V7", "I^maj7", "IV^maj7", "vii7(b5)", "III7", "vi7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Uma das progressões mais importantes do jazz",
    reference: "All The Things You Are - Jerome Kern"
  },
  {
    name: "Circle of Fifths Jazz",
    degrees: ["vi7", "ii7", "V7", "I^maj7", "IV^maj7", "vii7(b5)", "iii7", "vi7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Ciclo das quintas jazzístico"
  },
  {
    name: "Lady Bird Changes",
    degrees: ["I^maj7", "VI7", "ii7", "V7", "iii7", "bIII7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Progressão com substituição cromática",
    reference: "Lady Bird - Tadd Dameron"
  },
  {
    name: "Minor ii-V-i Extended",
    degrees: ["ii7(b5)", "V7alt", "i^maj7", "iv7", "ii7(b5)", "V7alt", "i^maj7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "minor",
    description: "ii-V-i menor com extensões"
  },
  {
    name: "Jazz Blues (Extended)",
    degrees: ["I7", "IV7", "I7", "vi7", "ii7", "V7", "I7", "VI7", "ii7", "V7", "I7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Blues de 12 compassos jazzificado"
  },
  {
    name: "Confirmation Changes",
    degrees: ["I^maj7", "ii7", "V7", "I^maj7", "I7", "IV^maj7", "vii7(b5)", "III7", "vi7"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Progressão modal-jazz",
    reference: "Confirmation - Charlie Parker"
  },

  // === MODAL JAZZ ===
  {
    name: "So What Changes",
    degrees: ["i7", "i7", "i7", "i7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "minor",
    description: "Modal jazz estilo Miles Davis",
    reference: "So What - Miles Davis"
  },
  {
    name: "Dorian Vamp",
    degrees: ["i7", "IV7", "i7", "IV7"],
    difficulty: "intermediate",
    category: "modal",
    mode: "minor",
    description: "Vamp dórico clássico"
  },
  {
    name: "Mixolydian Rock",
    degrees: ["I7", "bVII", "I7", "bVII"],
    difficulty: "intermediate",
    category: "rock",
    mode: "major",
    description: "Modo mixolídio no rock"
  },

  // === BOSSA NOVA ADVANCED ===
  {
    name: "Corcovado Progression",
    degrees: ["I^maj7", "iii7", "vi7", "V7sus4", "V7", "ii7", "V7", "I^maj7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    description: "Progressão de Corcovado",
    reference: "Corcovado - Tom Jobim"
  },
  {
    name: "Desafinado Changes",
    degrees: ["I^maj7", "VI7", "ii7", "V7", "iii7", "VI7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    description: "Harmonia de Desafinado",
    reference: "Desafinado - Tom Jobim"
  },
  {
    name: "Wave Progression",
    degrees: ["I^maj7", "bII^maj7", "bVII^maj7", "I^maj7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    description: "Progressão impressionista de Wave",
    reference: "Wave - Tom Jobim"
  },

  // === MPB CLASSICS ===
  {
    name: "Chega de Saudade",
    degrees: ["I^maj7", "VI7", "ii7", "V7", "iii7", "bIII7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    description: "Marco da Bossa Nova",
    reference: "Chega de Saudade - Tom Jobim"
  },
  {
    name: "Águas de Março Pattern",
    degrees: ["I^maj7", "ii7", "V7", "I^maj7", "vi7", "ii7", "V7", "I^maj7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    description: "Progressão de Águas de Março",
    reference: "Águas de Março - Tom Jobim"
  },
  {
    name: "Caetano Veloso Style",
    degrees: ["I^maj7", "bVII^maj7", "IV^maj7", "I^maj7"],
    difficulty: "intermediate",
    category: "mpb",
    mode: "major",
    description: "Estilo tropicalista"
  },

  // === SAMBA SOPHISTICATED ===
  {
    name: "Samba Canção",
    degrees: ["I^maj7", "VI7", "ii7", "V7", "iii7", "vi7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    description: "Samba canção sofisticado"
  },
  {
    name: "Choro Progression",
    degrees: ["I", "VI7", "ii", "V7", "I", "I7", "IV", "iv"],
    difficulty: "intermediate",
    category: "samba",
    mode: "major",
    description: "Progressão típica do choro"
  },

  // === ROCK PROGRESSIONS ===
  {
    name: "Hotel California",
    degrees: ["vi", "IV", "I", "V", "iii", "IV", "I", "V"],
    difficulty: "intermediate",
    category: "rock",
    mode: "major",
    description: "Progressão icônica do rock",
    reference: "Hotel California - Eagles"
  },
  {
    name: "Smoke on the Water",
    degrees: ["i", "bIII", "IV", "i", "bIII", "bVI", "IV", "i"],
    difficulty: "intermediate",
    category: "rock",
    mode: "minor",
    description: "Power chord progression",
    reference: "Smoke on the Water - Deep Purple"
  },
  {
    name: "Kashmir Pattern",
    degrees: ["i", "bVI", "bVII", "i"],
    difficulty: "intermediate",
    category: "rock",
    mode: "minor",
    description: "Progressão dark/heavy",
    reference: "Kashmir - Led Zeppelin"
  },

  // === FUNK ADVANCED ===
  {
    name: "Superstition Funk",
    degrees: ["i7", "i7", "i7", "i7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    description: "Funk modal de um acorde",
    reference: "Superstition - Stevie Wonder"
  },
  {
    name: "P-Funk Parliament",
    degrees: ["i7", "iv7", "v7", "iv7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    description: "P-Funk clássico"
  },
  {
    name: "James Brown Vamp",
    degrees: ["I7", "IV7", "I7", "IV7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "major",
    description: "Estilo James Brown"
  },

  // === GOSPEL/SOUL ===
  {
    name: "Gospel Runs",
    degrees: ["I", "vi", "IV", "V", "vi", "ii", "V", "I"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Runs gospel com substituições"
  },
  {
    name: "Soul Ballad",
    degrees: ["vi", "IV", "I", "V", "vi", "IV", "I", "V"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    description: "Balada soul clássica"
  },

  // === LATIN JAZZ ===
  {
    name: "Salsa Montuno",
    degrees: ["I", "V", "I", "V"],
    difficulty: "intermediate",
    category: "jazz",
    mode: "major",
    description: "Montuno básico da salsa"
  },
  {
    name: "Bossando Pattern",
    degrees: ["I^maj7", "bII^maj7", "I^maj7", "bII^maj7"],
    difficulty: "intermediate",
    category: "bossa",
    mode: "major",
    description: "Movimento cromático bossa nova"
  },

  // === COUNTRY SOPHISTICATED ===
  {
    name: "Nashville Number",
    degrees: ["I", "V", "vi", "iii", "IV", "I", "ii", "V"],
    difficulty: "intermediate",
    category: "pop",
    mode: "major",
    description: "Sistema Nashville Numbers"
  },

  // === BLUES VARIATIONS ===
  {
    name: "Minor Blues",
    degrees: ["i7", "i7", "i7", "i7", "iv7", "iv7", "i7", "i7", "v7", "iv7", "i7", "v7"],
    difficulty: "intermediate",
    category: "blues",
    mode: "minor",
    description: "Blues menor de 12 compassos"
  },
  {
    name: "Jazz Blues Turnarounds",
    degrees: ["I7", "VI7", "ii7", "V7"],
    difficulty: "intermediate",
    category: "blues",
    mode: "major",
    description: "Volta do jazz blues"
  },

  // === EUROPEAN CLASSICAL ===
  {
    name: "Baroque Sequence",
    degrees: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
    difficulty: "intermediate",
    category: "classical",
    mode: "major",
    description: "Sequência barroca clássica"
  },
  {
    name: "Romantic Period",
    degrees: ["I", "VI", "IV", "ii", "V", "I"],
    difficulty: "intermediate",
    category: "classical",
    mode: "major",
    description: "Harmonia do período romântico"
  },

  // === WORLD MUSIC ===
  {
    name: "Flamenco Pattern",
    degrees: ["i", "bVII", "bVI", "bVII"],
    difficulty: "intermediate",
    category: "modal",
    mode: "minor",
    description: "Progressão flamenga"
  },
  {
    name: "Celtic Modal",
    degrees: ["I", "bVII", "IV", "I"],
    difficulty: "intermediate",
    category: "modal",
    mode: "major",
    description: "Modo mixolídio celta"
  },

  // === CONTEMPORARY ===
  {
    name: "Neo-Soul",
    degrees: ["i7", "bIII^maj7", "bVI^maj7", "bVII7"],
    difficulty: "intermediate",
    category: "funk",
    mode: "minor",
    description: "Neo-soul contemporâneo"
  },
  {
    name: "Indie Rock",
    degrees: ["vi", "IV", "I", "V"],
    difficulty: "intermediate",
    category: "rock",
    mode: "major",
    description: "Progressão indie rock"
  },

  // ========================================
  // 🎯 ADVANCED (35+ progressões)
  // ========================================

  // === COLTRANE CHANGES ===
  {
    name: "Giant Steps (Simplified)",
    degrees: ["I^maj7", "V7/iii", "iii^maj7", "V7/vi", "vi^maj7", "V7/ii", "ii7", "V7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Progressão estilo Giant Steps",
    reference: "Giant Steps - John Coltrane"
  },
  {
    name: "Coltrane Matrix",
    degrees: ["I^maj7", "I^maj7", "bII^maj7", "bII^maj7", "II^maj7", "II^maj7", "I^maj7", "I^maj7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Matrix harmônica de Coltrane"
  },

  // === TRITONE SUBSTITUTIONS ===
  {
    name: "ii-V with Tritone Subs",
    degrees: ["ii7", "bII7", "I^maj7", "vi7", "ii7", "bII7", "I^maj7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "ii-V com substituições de trítono"
  },
  {
    name: "All Tritone Subs",
    degrees: ["I^maj7", "bV7", "IV^maj7", "bI7", "bVII^maj7", "bIV7", "I^maj7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Progressão toda com tritone subs"
  },

  // === CONTEMPORARY JAZZ ===
  {
    name: "Wayne Shorter Style",
    degrees: ["I^maj7#11", "bII^maj7#11", "bVII^maj7#11", "I^maj7#11"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Harmonias quartais de Wayne Shorter"
  },
  {
    name: "Keith Jarrett Voicings",
    degrees: ["I^maj7", "bVII^maj7/3", "bVI^maj7", "bV^maj7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Voicings estilo Keith Jarrett"
  },
  {
    name: "Chick Corea Harmony",
    degrees: ["I^maj7#11", "ii7", "bII^maj7#11", "I^maj7#11"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Harmonias modernas de Chick Corea"
  },

  // === IMPRESSIONIST ===
  {
    name: "Debussy Parallel Motion",
    degrees: ["I^maj7", "bII^maj7", "bIII^maj7", "IV^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Movimento paralelo impressionista"
  },
  {
    name: "Ravel Harmony",
    degrees: ["I^maj7", "bVII^maj7", "bVI^maj7", "bV^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Harmonias de Ravel"
  },

  // === ALTERED DOMINANTS ===
  {
    name: "Altered Scale Progression",
    degrees: ["ii7", "V7alt", "I^maj7", "vi7", "ii7", "V7alt", "I^maj7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Dominantes alteradas"
  },
  {
    name: "Diminished Approach",
    degrees: ["I^maj7", "#i°7", "ii7", "#ii°7", "iii7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Aproximação com diminutos"
  },

  // === POLYTONALITY ===
  {
    name: "Bitonal Harmony",
    degrees: ["I^maj7", "bII^maj7", "I^maj7", "bII^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Bitonalidade moderna"
  },
  {
    name: "Quartal Harmony",
    degrees: ["I^maj7#11", "ii^maj7#11", "iii^maj7#11", "IV^maj7#11"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Harmonias em quartas"
  },

  // === FUSION ===
  {
    name: "Weather Report Style",
    degrees: ["i7", "bVII7", "bVI^maj7", "bV7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "minor",
    description: "Fusion estilo Weather Report"
  },
  {
    name: "Mahavishnu Pattern",
    degrees: ["I7#11", "bII7#11", "bVII7#11", "I7#11"],
    difficulty: "advanced",
    category: "rock",
    mode: "major",
    description: "Rock fusion com tensões"
  },

  // === CHROMATIC HARMONY ===
  {
    name: "Chromatic Mediant",
    degrees: ["I^maj7", "bIII^maj7", "I^maj7", "bVI^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Mediante cromática"
  },
  {
    name: "Neo-Riemannian",
    degrees: ["I^maj7", "bVI^maj7", "IV^maj7", "bII^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Transformações neo-riemannianas"
  },

  // === BEBOP ===
  {
    name: "Bebop Scale Progression",
    degrees: ["I^maj7", "vi7", "ii7", "V7", "iii7", "VI7", "ii7", "V7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Progressão bebop com dominantes secundárias"
  },
  {
    name: "Parker Changes",
    degrees: ["I^maj7", "ii7", "V7", "I^maj7", "vii7(b5)", "III7", "vi7", "VI7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Estilo Charlie Parker"
  },

  // === MODAL INTERCHANGE ===
  {
    name: "Mixed Mode Progression",
    degrees: ["I", "bVII", "IV", "iv", "I", "bVI", "bVII", "I"],
    difficulty: "advanced",
    category: "rock",
    mode: "major",
    description: "Mistura de modos maior e menor"
  },
  {
    name: "Borrowed Chords",
    degrees: ["I^maj7", "iv7", "bVII^maj7", "I^maj7"],
    difficulty: "advanced",
    category: "pop",
    mode: "major",
    description: "Acordes emprestados do menor"
  },

  // === NEGATIVE HARMONY ===
  {
    name: "Negative Harmony Demo",
    degrees: ["I^maj7", "bv^maj7", "bvi^maj7", "bII^maj7"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Conceito de harmonia negativa"
  },

  // === EXTENDED HARMONY ===
  {
    name: "13th Chord Progression",
    degrees: ["I^maj13", "vi13", "ii13", "V13"],
    difficulty: "advanced",
    category: "jazz",
    mode: "major",
    description: "Progressão com tredécimas"
  },
  {
    name: "Add9 Pop Harmony",
    degrees: ["I^add9", "V^add9", "vi^add9", "IV^add9"],
    difficulty: "advanced",
    category: "pop",
    mode: "major",
    description: "Pop moderno com add9"
  },

  // === WORLD FUSION ===
  {
    name: "Brazilian Fusion",
    degrees: ["I^maj7#11", "bVII^maj7#11", "bVI^maj7#11", "bV^maj7#11"],
    difficulty: "advanced",
    category: "mpb",
    mode: "major",
    description: "Fusão brasileira moderna"
  },
  {
    name: "African Polyrhythm",
    degrees: ["I7", "bVII7", "I7", "bVII7"],
    difficulty: "advanced",
    category: "modal",
    mode: "major",
    description: "Harmonias africanas modais"
  },

  // === SYMMETRICAL SCALES ===
  {
    name: "Whole Tone Progression",
    degrees: ["I^aug", "bII^aug", "bIII^aug", "I^aug"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Escala de tons inteiros"
  },
  {
    name: "Octatonic Harmony",
    degrees: ["I°^maj7", "bII°^maj7", "bIII°^maj7", "I°^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Escala octatônica"
  },

  // === PROGRESSIVE ROCK ===
  {
    name: "King Crimson Style",
    degrees: ["I^maj7#11", "bVII^maj7#11", "bVI^maj7#11", "bV^maj7#11"],
    difficulty: "advanced",
    category: "rock",
    mode: "major",
    description: "Progressive rock complexo"
  },
  {
    name: "Genesis Harmony",
    degrees: ["I", "bVII", "bVI", "bVII", "IV", "bIII", "bII", "I"],
    difficulty: "advanced",
    category: "rock",
    mode: "major",
    description: "Progressão progressive rock"
  },

  // === CONTEMPORARY CLASSICAL ===
  {
    name: "Minimalist Pattern",
    degrees: ["I^maj7", "V^maj7", "vi^maj7", "IV^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Minimalismo contemporâneo"
  },
  {
    name: "Post-Tonal Harmony",
    degrees: ["I^maj7", "bII^maj7", "bVI^maj7", "bVII^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Harmonia pós-tonal"
  },

  // === EXPERIMENTAL ===
  {
    name: "Cluster Harmony",
    degrees: ["I^maj7add9add11", "bII^maj7add9add11", "I^maj7add9add11"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Harmonias em cluster"
  },
  {
    name: "Microtonal Approach",
    degrees: ["I^maj7", "I^maj7+25¢", "I^maj7+50¢", "I^maj7"],
    difficulty: "advanced",
    category: "classical",
    mode: "major",
    description: "Aproximação microtonal"
  }
];

// ===============================
// 🚀 FUNÇÃO PARA POPULAR O BANCO
// ===============================

export async function seedChordProgressions() {
  try {
    // Verifica se já existem progressões
    const existingCount = await ChordProgression.countDocuments();
    
    if (existingCount > 0) {
      console.log(`🎼 Já existem ${existingCount} progressões no banco`);
      return;
    }
    
    // Insere as progressões iniciais
    const result = await ChordProgression.insertMany(seedProgressions);
    console.log(`🎼 ${result.length} progressões inseridas com sucesso!`);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao popular progressões:', error);
    throw error;
  }
}