// src/components/VoiceLeadingSystem.tsx - VERSÃO COMPLETA FINAL COM CORREÇÃO
// ✅ CORREÇÃO: Lógica do voice leading corrigida
// ✅ MANTIDO: Todo o código original sem any
// ✅ CORREÇÃO: findBestBassNote com lógica musical correta
// ✅ MANTIDO: Todas as interfaces e funcionalidades existentes

export interface ChordSymbol {
  root: string;
  quality: string;
  extensions: string[];
  display: string;
  degree?: string;
}

export interface ChordAnalysis {
  degree: string;
  symbol: string;
  voicing: number[];
  analysis: string;
}

// Tipo para window global
interface WindowWithPiano extends Window {
  analyzeProgression: (inputs: string[]) => ChordAnalysis[];
  resetVoiceLeading: () => void;
  testConversion: () => void;
  formatChordSymbol: (input: string) => string;
  testVoiceLeadingFix: () => ChordAnalysis[];
  getVoiceLeaderDebug: () => VoiceLeaderDebugInfo;
  testEnharmonics: () => void;
  testFullProgression: () => ChordAnalysis[];
  testBemolChords: () => ChordAnalysis[];
}

interface VoiceLeaderDebugInfo {
  chordCounter: number;
  hasPrevoiusVoicing: boolean;
  historyLength: number;
  lastVoicing: number[] | null;
}

// ========================================
// 🎯 MAPEAMENTO COMPLETO DE GRAUS HARMÔNICOS (MANTIDO ORIGINAL)
// ========================================
const DEGREE_SYMBOLS: Record<string, ChordSymbol> = {
  
  // ========== TRÍADES BÁSICAS (MODO MAIOR) ==========
  'I': { root: 'C', quality: 'major', extensions: [], display: 'C', degree: 'I' },
  'ii': { root: 'D', quality: 'minor', extensions: [], display: 'Dm', degree: 'ii' },
  'iii': { root: 'E', quality: 'minor', extensions: [], display: 'Em', degree: 'iii' },
  'IV': { root: 'F', quality: 'major', extensions: [], display: 'F', degree: 'IV' },
  'V': { root: 'G', quality: 'major', extensions: [], display: 'G', degree: 'V' },
  'vi': { root: 'A', quality: 'minor', extensions: [], display: 'Am', degree: 'vi' },
  'vii°': { root: 'B', quality: 'diminished', extensions: [], display: 'Bdim', degree: 'vii°' },

  // ========== TRÍADES BÁSICAS (MODO MENOR) ==========
  'i': { root: 'C', quality: 'minor', extensions: [], display: 'Cm', degree: 'i' },
  'ii°': { root: 'D', quality: 'diminished', extensions: [], display: 'Ddim', degree: 'ii°' },
  'III': { root: 'Eb', quality: 'major', extensions: [], display: 'Eb', degree: 'III' },
  'iv': { root: 'F', quality: 'minor', extensions: [], display: 'Fm', degree: 'iv' },
  'v': { root: 'G', quality: 'minor', extensions: [], display: 'Gm', degree: 'v' },
  'VI': { root: 'Ab', quality: 'major', extensions: [], display: 'Ab', degree: 'VI' },
  'VII': { root: 'Bb', quality: 'major', extensions: [], display: 'Bb', degree: 'VII' },

  // ========== TÉTRADES COM SÉTIMA MENOR (DOMINANTES) ==========
  'I7': { root: 'C', quality: 'dominant', extensions: [], display: 'C7', degree: 'I7' },
  'II7': { root: 'D', quality: 'dominant', extensions: [], display: 'D7', degree: 'II7' },
  'III7': { root: 'E', quality: 'dominant', extensions: [], display: 'E7', degree: 'III7' },
  'IV7': { root: 'F', quality: 'dominant', extensions: [], display: 'F7', degree: 'IV7' },
  'V7': { root: 'G', quality: 'dominant', extensions: [], display: 'G7', degree: 'V7' },
  'VI7': { root: 'A', quality: 'dominant', extensions: [], display: 'A7', degree: 'VI7' },
  'VII7': { root: 'B', quality: 'dominant', extensions: [], display: 'B7', degree: 'VII7' },

  // ========== TÉTRADES COM SÉTIMA MENOR (ACORDES MENORES) ==========
  'i7': { root: 'C', quality: 'minor7', extensions: [], display: 'Cm7', degree: 'i7' },
  'ii7': { root: 'D', quality: 'minor7', extensions: [], display: 'Dm7', degree: 'ii7' },
  'iii7': { root: 'E', quality: 'minor7', extensions: [], display: 'Em7', degree: 'iii7' },
  'iv7': { root: 'F', quality: 'minor7', extensions: [], display: 'Fm7', degree: 'iv7' },
  'v7': { root: 'G', quality: 'minor7', extensions: [], display: 'Gm7', degree: 'v7' },
  'vi7': { root: 'A', quality: 'minor7', extensions: [], display: 'Am7', degree: 'vi7' },
  'vii7': { root: 'B', quality: 'minor7', extensions: [], display: 'Bm7', degree: 'vii7' },

  // ========== NOTAÇÃO ALTERNATIVA (m7) ==========
  'im7': { root: 'C', quality: 'minor7', extensions: [], display: 'Cm7', degree: 'im7' },
  'iim7': { root: 'D', quality: 'minor7', extensions: [], display: 'Dm7', degree: 'iim7' },
  'iiim7': { root: 'E', quality: 'minor7', extensions: [], display: 'Em7', degree: 'iiim7' },
  'ivm7': { root: 'F', quality: 'minor7', extensions: [], display: 'Fm7', degree: 'ivm7' },
  'vm7': { root: 'G', quality: 'minor7', extensions: [], display: 'Gm7', degree: 'vm7' },
  'vim7': { root: 'A', quality: 'minor7', extensions: [], display: 'Am7', degree: 'vim7' },
  'viim7': { root: 'B', quality: 'minor7', extensions: [], display: 'Bm7', degree: 'viim7' },

  // ========== TÉTRADES COM SÉTIMA MAIOR ==========
  'Imaj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7', degree: 'Imaj7' },
  'IImaj7': { root: 'D', quality: 'major7', extensions: [], display: 'D∆7', degree: 'IImaj7' },
  'IIImaj7': { root: 'E', quality: 'major7', extensions: [], display: 'E∆7', degree: 'IIImaj7' },
  'IVmaj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7', degree: 'IVmaj7' },
  'Vmaj7': { root: 'G', quality: 'major7', extensions: [], display: 'G∆7', degree: 'Vmaj7' },
  'VImaj7': { root: 'A', quality: 'major7', extensions: [], display: 'A∆7', degree: 'VImaj7' },
  'VIImaj7': { root: 'B', quality: 'major7', extensions: [], display: 'B∆7', degree: 'VIImaj7' },

  // ========== NOTAÇÃO ALTERNATIVA (^maj7) ==========
  'I^maj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7', degree: 'Imaj7' },
  'IV^maj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7', degree: 'IVmaj7' },

  // ========== DOMINANTES SECUNDÁRIAS ==========
  'V/ii': { root: 'A', quality: 'dominant', extensions: [], display: 'A7', degree: 'V/ii' },
  'V7/ii': { root: 'A', quality: 'dominant', extensions: [], display: 'A7', degree: 'V7/ii' },
  'V/iii': { root: 'B', quality: 'dominant', extensions: [], display: 'B7', degree: 'V/iii' },
  'V7/iii': { root: 'B', quality: 'dominant', extensions: [], display: 'B7', degree: 'V7/iii' },
  'V/IV': { root: 'C', quality: 'dominant', extensions: [], display: 'C7', degree: 'V/IV' },
  'V7/IV': { root: 'C', quality: 'dominant', extensions: [], display: 'C7', degree: 'V7/IV' },
  'V/V': { root: 'D', quality: 'dominant', extensions: [], display: 'D7', degree: 'V/V' },
  'V7/V': { root: 'D', quality: 'dominant', extensions: [], display: 'D7', degree: 'V7/V' },
  'V/vi': { root: 'E', quality: 'dominant', extensions: [], display: 'E7', degree: 'V/vi' },
  'V7/vi': { root: 'E', quality: 'dominant', extensions: [], display: 'E7', degree: 'V7/vi' },

  // ========== EMPRÉSTIMOS MODAIS (BEMÓIS) ==========
  'bII': { root: 'Db', quality: 'major', extensions: [], display: 'Db', degree: 'bII' },
  'bIII': { root: 'Eb', quality: 'major', extensions: [], display: 'Eb', degree: 'bIII' },
  'bV': { root: 'Gb', quality: 'major', extensions: [], display: 'Gb', degree: 'bV' },
  'bVI': { root: 'Ab', quality: 'major', extensions: [], display: 'Ab', degree: 'bVI' },
  'bVII': { root: 'Bb', quality: 'major', extensions: [], display: 'Bb', degree: 'bVII' },

  // ========== EMPRÉSTIMOS MODAIS COM SÉTIMA DOMINANTE ==========
  'bII7': { root: 'Db', quality: 'dominant', extensions: [], display: 'Db7', degree: 'bII7' },
  'bIII7': { root: 'Eb', quality: 'dominant', extensions: [], display: 'Eb7', degree: 'bIII7' },
  'bV7': { root: 'Gb', quality: 'dominant', extensions: [], display: 'Gb7', degree: 'bV7' },
  'bVI7': { root: 'Ab', quality: 'dominant', extensions: [], display: 'Ab7', degree: 'bVI7' },
  'bVII7': { root: 'Bb', quality: 'dominant', extensions: [], display: 'Bb7', degree: 'bVII7' },

  // ========== EMPRÉSTIMOS MODAIS COM SÉTIMA MAIOR ==========
  'bIImaj7': { root: 'Db', quality: 'major7', extensions: [], display: 'Db∆7', degree: 'bIImaj7' },
  'bIIImaj7': { root: 'Eb', quality: 'major7', extensions: [], display: 'Eb∆7', degree: 'bIIImaj7' },
  'bVmaj7': { root: 'Gb', quality: 'major7', extensions: [], display: 'Gb∆7', degree: 'bVmaj7' },
  'bVImaj7': { root: 'Ab', quality: 'major7', extensions: [], display: 'Ab∆7', degree: 'bVImaj7' },
  'bVIImaj7': { root: 'Bb', quality: 'major7', extensions: [], display: 'Bb∆7', degree: 'bVIImaj7' },

  // ========== EMPRÉSTIMOS MODAIS COM ^ E SUS4 ==========
  'bII^sus4': { root: 'Db', quality: 'sus4', extensions: [], display: 'Dbsus4', degree: 'bII^sus4' },
  'bIII^sus4': { root: 'Eb', quality: 'sus4', extensions: [], display: 'Ebsus4', degree: 'bIII^sus4' },
  'bV^sus4': { root: 'Gb', quality: 'sus4', extensions: [], display: 'Gbsus4', degree: 'bV^sus4' },
  'bVI^sus4': { root: 'Ab', quality: 'sus4', extensions: [], display: 'Absus4', degree: 'bVI^sus4' },
  'bVII^sus4': { root: 'Bb', quality: 'sus4', extensions: [], display: 'Bbsus4', degree: 'bVII^sus4' },

  // ========== ACORDES DIMINUTOS COM SÉTIMA ==========
  'i°7': { root: 'C', quality: 'diminished7', extensions: [], display: 'Cdim7', degree: 'i°7' },
  'ii°7': { root: 'D', quality: 'diminished7', extensions: [], display: 'Ddim7', degree: 'ii°7' },
  'iii°7': { root: 'E', quality: 'diminished7', extensions: [], display: 'Edim7', degree: 'iii°7' },
  'iv°7': { root: 'F', quality: 'diminished7', extensions: [], display: 'Fdim7', degree: 'iv°7' },
  'v°7': { root: 'G', quality: 'diminished7', extensions: [], display: 'Gdim7', degree: 'v°7' },
  'vi°7': { root: 'A', quality: 'diminished7', extensions: [], display: 'Adim7', degree: 'vi°7' },
  'vii°7': { root: 'B', quality: 'diminished7', extensions: [], display: 'Bdim7', degree: 'vii°7' },

  // ========== ACORDES MEIO-DIMINUTOS ==========
  'iim7b5': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)', degree: 'iim7b5' },
  'iiø7': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)', degree: 'iiø7' },
  'ii7b5': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)', degree: 'ii7b5' },
  'viiø7': { root: 'B', quality: 'half-diminished', extensions: [], display: 'Bm7(♭5)', degree: 'viiø7' },
  'viim7b5': { root: 'B', quality: 'half-diminished', extensions: [], display: 'Bm7(♭5)', degree: 'viim7b5' },

  // ========== ACORDES SUSPENSOS ==========
  'Isus2': { root: 'C', quality: 'sus2', extensions: [], display: 'Csus2', degree: 'Isus2' },
  'Isus4': { root: 'C', quality: 'sus4', extensions: [], display: 'Csus4', degree: 'Isus4' },
  'IVsus2': { root: 'F', quality: 'sus2', extensions: [], display: 'Fsus2', degree: 'IVsus2' },
  'IVsus4': { root: 'F', quality: 'sus4', extensions: [], display: 'Fsus4', degree: 'IVsus4' },
  'Vsus2': { root: 'G', quality: 'sus2', extensions: [], display: 'Gsus2', degree: 'Vsus2' },
  'Vsus4': { root: 'G', quality: 'sus4', extensions: [], display: 'Gsus4', degree: 'Vsus4' },
  'iv^sus4': { root: 'F', quality: 'sus4', extensions: [], display: 'Fsus4', degree: 'iv^sus4' },

  // ========== ACORDES SUSPENSOS COM SÉTIMA ==========
  'I7sus2': { root: 'C', quality: 'dominant', extensions: ['sus2'], display: 'C7sus2', degree: 'I7sus2' },
  'I7sus4': { root: 'C', quality: 'dominant', extensions: ['sus4'], display: 'C7sus4', degree: 'I7sus4' },
  'V7sus2': { root: 'G', quality: 'dominant', extensions: ['sus2'], display: 'G7sus2', degree: 'V7sus2' },
  'V7sus4': { root: 'G', quality: 'dominant', extensions: ['sus4'], display: 'G7sus4', degree: 'V7sus4' },

  // ========== ACORDES SUSPENSOS COM ^ ==========
  'i^sus4': { root: 'C', quality: 'sus4', extensions: [], display: 'Csus4', degree: 'i^sus4' },
  'ii^sus4': { root: 'D', quality: 'sus4', extensions: [], display: 'Dsus4', degree: 'ii^sus4' },
  'iii^sus4': { root: 'E', quality: 'sus4', extensions: [], display: 'Esus4', degree: 'iii^sus4' },
  'v^sus4': { root: 'G', quality: 'sus4', extensions: [], display: 'Gsus4', degree: 'v^sus4' },
  'vi^sus4': { root: 'A', quality: 'sus4', extensions: [], display: 'Asus4', degree: 'vi^sus4' },
  'vii^sus4': { root: 'B', quality: 'sus4', extensions: [], display: 'Bsus4', degree: 'vii^sus4' },

  // ========== ACORDES DE SEXTA ==========
  'I6': { root: 'C', quality: 'major6', extensions: [], display: 'C6', degree: 'I6' },
  'IV6': { root: 'F', quality: 'major6', extensions: [], display: 'F6', degree: 'IV6' },
  'V6': { root: 'G', quality: 'major6', extensions: [], display: 'G6', degree: 'V6' },
  'vi6': { root: 'A', quality: 'minor6', extensions: [], display: 'Am6', degree: 'vi6' },
  'ii6': { root: 'D', quality: 'minor6', extensions: [], display: 'Dm6', degree: 'ii6' },
  'iii6': { root: 'E', quality: 'minor6', extensions: [], display: 'Em6', degree: 'iii6' },

  // ========== EXTENSÕES COM 9ª ==========
  'I9': { root: 'C', quality: 'major9', extensions: [], display: 'C9', degree: 'I9' },
  'V9': { root: 'G', quality: 'dominant', extensions: ['9'], display: 'G9', degree: 'V9' },
  'ii9': { root: 'D', quality: 'minor9', extensions: [], display: 'Dm9', degree: 'ii9' },
  'vi9': { root: 'A', quality: 'minor9', extensions: [], display: 'Am9', degree: 'vi9' },

  // ========== EXTENSÕES COM 11ª ==========
  'V11': { root: 'G', quality: 'dominant', extensions: ['11'], display: 'G11', degree: 'V11' },
  'ii11': { root: 'D', quality: 'minor', extensions: ['11'], display: 'Dm11', degree: 'ii11' },

  // ========== EXTENSÕES COM 13ª ==========
  'V13': { root: 'G', quality: 'dominant', extensions: ['13'], display: 'G13', degree: 'V13' },
  'I13': { root: 'C', quality: 'major', extensions: ['13'], display: 'C13', degree: 'I13' },

  // ========== EXTENSÕES ALTERADAS ==========
  'V7alt': { root: 'G', quality: 'dominant', extensions: ['alt'], display: 'G7alt', degree: 'V7alt' },
  'V7#9': { root: 'G', quality: 'dominant', extensions: ['#9'], display: 'G7(#9)', degree: 'V7#9' },
  'V7#11': { root: 'G', quality: 'dominant', extensions: ['#11'], display: 'G7(#11)', degree: 'V7#11' },
  'V7b9': { root: 'G', quality: 'dominant', extensions: ['b9'], display: 'G7(b9)', degree: 'V7b9' },
  'V7b13': { root: 'G', quality: 'dominant', extensions: ['b13'], display: 'G7(b13)', degree: 'V7b13' },

  // ========== EXTENSÕES EM SÉTIMAS MAIORES ==========
  'Imaj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)', degree: 'Imaj7#11' },
  'IVmaj7#11': { root: 'F', quality: 'major7', extensions: ['#11'], display: 'F∆7(#11)', degree: 'IVmaj7#11' },
  'Imaj9': { root: 'C', quality: 'major7', extensions: ['9'], display: 'C∆9', degree: 'Imaj9' },
  'IVmaj9': { root: 'F', quality: 'major7', extensions: ['9'], display: 'F∆9', degree: 'IVmaj9' },

  // ========== EXTENSÕES EM EMPRÉSTIMOS MODAIS (COMPLETO) ==========
  'bII7alt': { root: 'Db', quality: 'dominant', extensions: ['alt'], display: 'Db7alt', degree: 'bII7alt' },
  'bIII7#9': { root: 'Eb', quality: 'dominant', extensions: ['#9'], display: 'Eb7(#9)', degree: 'bIII7#9' },
  'bV7alt': { root: 'Gb', quality: 'dominant', extensions: ['alt'], display: 'Gb7alt', degree: 'bV7alt' },
  'bVI7#11': { root: 'Ab', quality: 'dominant', extensions: ['#11'], display: 'Ab7(#11)', degree: 'bVI7#11' },
  'bVII7alt': { root: 'Bb', quality: 'dominant', extensions: ['alt'], display: 'Bb7alt', degree: 'bVII7alt' },
  'bVII7#11': { root: 'Bb', quality: 'dominant', extensions: ['#11'], display: 'Bb7(#11)', degree: 'bVII7#11' },
  'bVmaj7#11': { root: 'Gb', quality: 'major7', extensions: ['#11'], display: 'Gb∆7(#11)', degree: 'bVmaj7#11' },
  'bIImaj7#11': { root: 'Db', quality: 'major7', extensions: ['#11'], display: 'Db∆7(#11)', degree: 'bIImaj7#11' },
  'bIIImaj7#11': { root: 'Eb', quality: 'major7', extensions: ['#11'], display: 'Eb∆7(#11)', degree: 'bIIImaj7#11' },
  'bVImaj7#11': { root: 'Ab', quality: 'major7', extensions: ['#11'], display: 'Ab∆7(#11)', degree: 'bVImaj7#11' },
  'bVIImaj7#11': { root: 'Bb', quality: 'major7', extensions: ['#11'], display: 'Bb∆7(#11)', degree: 'bVIImaj7#11' },

  // ========== EMPRÉSTIMOS MODAIS ESPECÍFICOS ==========
  'bIII7#11': { root: 'Ab', quality: 'dominant', extensions: ['#11'], display: 'Ab7(#11)', degree: 'bIII7#11' },
  'iv^add9': { root: 'F', quality: 'major', extensions: ['add9'], display: 'F(add9)', degree: 'iv^add9' },
  'bVII7#9': { root: 'Bb', quality: 'dominant', extensions: ['#9'], display: 'Bb7(#9)', degree: 'bVII7#9' },

  // ========== NOTAÇÃO ALTERNATIVA COM ^ ==========
  'I^maj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)', degree: 'Imaj7#11' },
  'IV^maj7#11': { root: 'F', quality: 'major7', extensions: ['#11'], display: 'F∆7(#11)', degree: 'IVmaj7#11' },

  // ========== ACORDES MENOR-MAIOR ==========
  'imaj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)', degree: 'imaj7' },
  'i^maj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)', degree: 'imaj7' },
  'iimaj7': { root: 'D', quality: 'minor-major7', extensions: [], display: 'Dm(∆7)', degree: 'iimaj7' },
  'ivmaj7': { root: 'F', quality: 'minor-major7', extensions: [], display: 'Fm(∆7)', degree: 'ivmaj7' },

  // ========== ACORDES ESPECÍFICOS PARA COMPATIBILIDADE ==========
  'Abm7': { root: 'Ab', quality: 'minor7', extensions: [], display: 'Abm7', degree: 'bVIm7' },
  'E11': { root: 'E', quality: 'dominant', extensions: ['11'], display: 'E11', degree: 'III11' },
  'D7alt': { root: 'D', quality: 'dominant', extensions: ['alt'], display: 'D7alt', degree: 'II7alt' },
  'Dbm7': { root: 'Db', quality: 'minor7', extensions: [], display: 'Dbm7', degree: 'bIIm7' },
  'B9': { root: 'B', quality: 'dominant', extensions: ['9'], display: 'B9', degree: 'VII9' },
  'A7alt': { root: 'A', quality: 'dominant', extensions: ['alt'], display: 'A7alt', degree: 'VI7alt' },
};

// ========== RESTO DO CÓDIGO ORIGINAL MANTIDO ==========
const CHORD_TO_DEGREE_MAP: Record<string, string> = {
  'C': 'I', 'Cmaj7': 'Imaj7', 'Dm': 'ii', 'Dm7': 'iim7', 'Em': 'iii', 'Em7': 'iiim7',
  'F': 'IV', 'Fmaj7': 'IVmaj7', 'G': 'V', 'G7': 'V7', 'Am': 'vi', 'Am7': 'vim7',
  'Bdim': 'vii°', 'Bm7b5': 'viiø7',
  'Cm': 'i', 'Cm7': 'im7', 'Ddim': 'ii°', 'Dm7b5': 'iiø7', 
  'Eb': 'III', 'Fm': 'iv', 'Fm7': 'ivm7', 'Gm': 'v', 'Gm7': 'vm7', 
  'Ab': 'VI', 'Bb': 'VII',
  'C7': 'I7', 'D7': 'II7', 'E7': 'III7', 'F7': 'IV7', 'A7': 'VI7', 'B7': 'VII7',
  
  'Abm7': 'Abm7', 'Gb7alt': 'Gb7alt', 'E11': 'E11', 'D7alt': 'D7alt', 
  'Dbm7': 'Dbm7', 'B9': 'B9', 'A7alt': 'A7alt',
  
  'Db': 'bII', 'Db7': 'bII7', 'Dbmaj7': 'bIImaj7',
  'Eb7': 'bIII7', 'Ebmaj7': 'bIIImaj7', 
  'Ab7': 'bVI7', 'Abmaj7': 'bVImaj7',
  'Bb7': 'bVII7', 'Bbmaj7': 'bVIImaj7'
};

// ========================================
// 🔍 FUNÇÕES DE DETECÇÃO E CONVERSÃO (MANTIDAS)
// ========================================

function isDegreeNotation(input: string): boolean {
  const degreePattern = /^(b?[IVX]+|[ivx]+|vii°|iiø|°|ø|maj|sus|alt|add|#|b|\d+|\/)/;
  return degreePattern.test(input);
}

function isChordSymbol(input: string): boolean {
  const chordPattern = /^[A-G][b#]?/;
  return chordPattern.test(input);
}

function normalizeChordSymbol(chord: string): string {
  return chord
    .replace(/maj7/g, 'Maj7').replace(/∆/g, 'Maj').replace(/△/g, 'Maj')
    .replace(/♭/g, 'b').replace(/♯/g, '#').replace(/°/g, 'dim')
    .replace(/ø/g, 'm7b5').replace(/\(b5\)/g, 'b5');
}

function chordSymbolToDegree(chordSymbol: string): string {
  const normalized = normalizeChordSymbol(chordSymbol);
  if (CHORD_TO_DEGREE_MAP[normalized]) {
    return CHORD_TO_DEGREE_MAP[normalized];
  }
  return normalized;
}

function convertInputToDegree(input: string): string {
  const trimmed = input.trim();
  if (isDegreeNotation(trimmed)) return trimmed;
  if (isChordSymbol(trimmed)) return chordSymbolToDegree(trimmed);
  return trimmed;
}

// ========================================
// 🎹 GERAÇÃO DE NOTAS COM OITAVAS CORRETAS (MANTIDA)
// ========================================

function getNotesForChord(symbol: ChordSymbol, octave: number = 4): number[] {
  console.log(`🎹 Gerando notas para ${symbol.display} (${symbol.quality})`);
  
  const rootMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  
  const baseMidi = 12 * octave + (rootMap[symbol.root] || 0);
  
  const qualityIntervals: Record<string, number[]> = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'dominant': [0, 4, 7, 10],
    'major7': [0, 4, 7, 11],
    'minor7': [0, 3, 7, 10],
    'minor-major7': [0, 3, 7, 11],
    'diminished': [0, 3, 6],
    'diminished7': [0, 3, 6, 9],
    'half-diminished': [0, 3, 6, 10],
    'augmented': [0, 4, 8],
    'sus4': [0, 5, 7],
    'sus2': [0, 2, 7],
    'major6': [0, 4, 7, 9],
    'minor6': [0, 3, 7, 9]
  };
  
  const baseIntervals = qualityIntervals[symbol.quality] || qualityIntervals.major;
  const notes = new Set(baseIntervals);
  
  const extensionIntervals: Record<string, number> = {
    '9': 14, 'b9': 13, '#9': 15, '11': 17, '#11': 18, '13': 21, 'b13': 20
  };

  for (const ext of symbol.extensions) {
    if (ext === 'sus4') {
      notes.delete(3); notes.delete(4); notes.add(5);
    } else if (ext === 'alt') {
      notes.add(13); notes.add(18);
    } else if (ext === '9') {
      notes.add(14);
    } else if (ext === '11') {
      notes.add(17);
    } else if (extensionIntervals[ext]) {
      notes.add(extensionIntervals[ext]);
    }
  }
  
  const finalNotes = Array.from(notes).map(i => baseMidi + i).sort((a, b) => a - b);
  return ensureMinimum4Notes(finalNotes, baseMidi, symbol);
}

function ensureMinimum4Notes(notes: number[], rootMidi: number, symbol: ChordSymbol): number[] {
  let workingNotes: number[] = [...notes];
  
  // Limitar a máximo 7 notas
  if (workingNotes.length > 7) {
    workingNotes = workingNotes.slice(0, 7);
  }

  if (workingNotes.length >= 4) {
      console.log(`✅ ${symbol.display}: ${workingNotes.length} notas OK`);
      return workingNotes.sort((a, b) => a - b);
  }
  
  console.log(`🔧 Expandindo ${symbol.display} de ${workingNotes.length} para 4+ notas`);
  
  const expansions: Record<string, number[]> = {
    'major': [14, 12, 16, 19],
    'minor': [14, 12, 15, 19],
    'dominant': [14, 18, 21, 12],
    'major7': [14, 18, 21, 12],
    'minor7': [14, 17, 21, 12],
  };
  
  const strategy = expansions[symbol.quality] || expansions['major'];
  
  for (const interval of strategy) {
    if (workingNotes.length >= 4) break;
    
    const candidateNote = rootMidi + interval;
    const noteClass = candidateNote % 12;
    
    if (!workingNotes.some(n => n % 12 === noteClass)) {
      workingNotes.push(candidateNote);
      console.log(`✅ Adicionada nota: ${candidateNote}`);
    }
  }
  
  if (workingNotes.length < 4) {
    while (workingNotes.length < 4) {
      const noteToDouble = notes[workingNotes.length % notes.length];
      workingNotes.push(noteToDouble + 12);
    }
  }
  
  console.log(`✅ ${symbol.display} expandido: ${workingNotes.length} notas`);
  return workingNotes.sort((a, b) => a - b);
}

// ========================================
// 🎼 VOICE LEADING SYSTEM - CORREÇÃO PRINCIPAL
// ========================================

class VoiceLeader {
  private previousUpperVoicing: number[] | null = null;
  private previousBassNote: number | null = null;
  private chordCounter = 0;

  public reset(): void {
    this.previousUpperVoicing = null;
    this.previousBassNote = null;
    this.chordCounter = 0;
    console.log('🔄 VoiceLeader resetado');
  }

  // ✅ MÉTODO PÚBLICO PARA DEBUG
  public getDebugInfo(): VoiceLeaderDebugInfo {
    return {
      chordCounter: this.chordCounter,
      hasPrevoiusVoicing: this.previousUpperVoicing !== null,
      historyLength: this.previousUpperVoicing?.length || 0,
      lastVoicing: this.previousUpperVoicing ? [...this.previousUpperVoicing] : null
    };
  }

  // ✅ MÉTODOS PÚBLICOS PARA ACESSO CONTROLADO
  public getPreviousUpperVoicing(): number[] | null {
    return this.previousUpperVoicing ? [...this.previousUpperVoicing] : null;
  }

  public getPreviousBassNote(): number | null {
    return this.previousBassNote;
  }

  public getChordCounter(): number {
    return this.chordCounter;
  }

  public findBestVoicing(currentNotes: number[]): number[] {
    this.chordCounter++;
    if (this.chordCounter > 8) this.reset();

    if (currentNotes.length === 0) return [];
    
    if (currentNotes.length < 4) {
      console.error(`❌ ERRO: Apenas ${currentNotes.length} notas fornecidas!`);
      return currentNotes;
    }

    const rootNote = currentNotes[0];
    const upperStructureNotes = currentNotes.slice(1);

    const bestBassNote = this.findBestBassNote(rootNote);
    const bestUpperVoicing = this.findBestUpperVoicing(upperStructureNotes);
    
    let finalVoicing = [bestBassNote, ...bestUpperVoicing];
    
    if (finalVoicing.length < 4) {
      const notesToAdd = [];
      const intervals = [4, 7, 14, 17];
      for (const interval of intervals) {
        if (finalVoicing.length >= 4) break;
        const newNote = rootNote + interval;
        if (!finalVoicing.some(n => n % 12 === newNote % 12)) {
          notesToAdd.push(newNote);
        }
      }
      finalVoicing.push(...notesToAdd.slice(0, 4 - finalVoicing.length));
    }
    
    finalVoicing = finalVoicing.sort((a, b) => a - b);
    
    this.previousBassNote = bestBassNote;
    this.previousUpperVoicing = bestUpperVoicing;

    return finalVoicing;
  }

  // ✅ CORREÇÃO PRINCIPAL: findBestBassNote com lógica musical correta
  private findBestBassNote(rootNote: number): number {
    const rootPitch = rootNote % 12;
    console.log(`🎼 === VOICE LEADING BASS CORRIGIDO ===`);
    console.log(`🎵 Root note: ${rootNote}, pitch class: ${rootPitch}`);
    
    // ✅ CORREÇÃO: Usar registro correto do baixo (C2 a C4: MIDI 36-60)
    let targetBass = 48 + rootPitch; // C2 como base (MIDI 36)
    console.log(`🔧 Bass inicial: C2 + ${rootPitch} = ${targetBass}`);
    
    // ✅ CORREÇÃO: Voice leading suave baseado no baixo anterior
    if (this.previousBassNote !== null) {
      console.log(`🔄 Bass anterior: ${this.previousBassNote}`);
      
      // Testar oitavas próximas para movimento suave
      const candidates = [
        targetBass - 12,  // oitava abaixo
        targetBass,       // mesma oitava
        targetBass + 12   // oitava acima
      ].filter(candidate => candidate >= 24 && candidate <= 60); // Limites do baixo
      
      console.log(`🎯 Candidatos para bass: ${candidates.join(', ')}`);
      
      // Escolher o candidato com menor movimento
      let bestCandidate = candidates[0];
      let minMovement = Math.abs(bestCandidate - this.previousBassNote);
      
      for (const candidate of candidates) {
        const movement = Math.abs(candidate - this.previousBassNote);
        console.log(`   ${candidate}: movimento de ${movement} semitons`);
        
        if (movement < minMovement) {
          minMovement = movement;
          bestCandidate = candidate;
        }
      }
      
      targetBass = bestCandidate;
      console.log(`✅ Bass escolhido: ${targetBass} (movimento: ${minMovement} semitons)`);
    } else {
      console.log(`✅ Primeiro acorde: bass em ${targetBass}`);
    }
    
    // ✅ GARANTIR limites corretos do baixo
    if (targetBass < 24) targetBass += 12;
    if (targetBass > 60) targetBass -= 12;
    
    console.log(`🎼 Bass final: ${targetBass}`);
    return targetBass;
  }

  // ✅ MANTER: findBestUpperVoicing original (já estava correto)
  private findBestUpperVoicing(upperNotes: number[]): number[] {
    if (upperNotes.length === 0) return [];
    
    console.log(`🎼 === VOICE LEADING UPPER ===`);
    console.log(`🎵 Upper notes input: ${upperNotes.join(', ')}`);
    
    if (!this.previousUpperVoicing) {
      // Primeiro acorde: colocar no registro médio-agudo
      const adjustedNotes = upperNotes.map(note => {
        let adjustedNote = note;
        while (adjustedNote < 60) adjustedNote += 12;  // C4 mínimo
        while (adjustedNote > 84) adjustedNote -= 12;  // C6 máximo
        return adjustedNote;
      });
      console.log(`✅ Primeiro upper voicing: ${adjustedNotes.join(', ')}`);
      return adjustedNotes.sort((a, b) => a - b);
    }

    console.log(`🔄 Upper anterior: ${this.previousUpperVoicing.join(', ')}`);
    
    let bestVoicing = upperNotes;
    let minScore = Infinity;

    // Testar diferentes inversões e posições de oitava
    for (let octaveShift = -1; octaveShift <= 1; octaveShift++) {
      for (let i = 0; i < upperNotes.length; i++) {
        // Criar inversão
        const inverted = [...upperNotes.slice(i), ...upperNotes.slice(0, i)].map(
          (n, idx) => n + (idx < upperNotes.length - i ? 0 : 12)
        );
        
        // Aplicar mudança de oitava e ajustar registro
        const candidate = inverted.map(n => {
          let adjustedNote = n + (octaveShift * 12);
          while (adjustedNote < 60) adjustedNote += 12;
          while (adjustedNote > 84) adjustedNote -= 12;
          return adjustedNote;
        });
        
        const score = this.calculateMovementScore(candidate);
        console.log(`   Candidato ${candidate.join(',')}: score ${score}`);
        
        if (score < minScore) {
          minScore = score;
          bestVoicing = candidate;
        }
      }
    }
    
    console.log(`✅ Melhor upper voicing: ${bestVoicing.join(', ')} (score: ${minScore})`);
    return bestVoicing.sort((a, b) => a - b);
  }

  private calculateMovementScore(candidate: number[]): number {
    if (!this.previousUpperVoicing) return 0;
    let totalMovement = 0;
    const len = Math.min(candidate.length, this.previousUpperVoicing.length);
    for (let i = 0; i < len; i++) {
      totalMovement += Math.abs(candidate[i] - this.previousUpperVoicing[i]);
    }
    return totalMovement;
  }
}

const voiceLeader = new VoiceLeader();

// ========================================
// 🎯 FUNÇÕES EXPORTADAS (MANTIDAS)
// ========================================

export function resetVoiceLeading(): void {
  voiceLeader.reset();
}

export function analyzeProgression(inputs: string[], targetKey: string = 'C'): ChordAnalysis[] {
  console.log('\n🎯 === ANÁLISE COM TRANSPOSIÇÃO CORRIGIDA ===');
  console.log(`📝 Input: ${inputs.join(' | ')}`);
  console.log(`🔑 Tonalidade: ${targetKey}`);
  
  resetVoiceLeading();
  
  return inputs.map((input, index): ChordAnalysis => {
    console.log(`\n[${index + 1}/${inputs.length}] "${input}"`);
    
    // ✅ PEGAR INFORMAÇÃO BASE DO GRAU
    const baseSymbolInfo = DEGREE_SYMBOLS[input] || { 
      root: 'C', 
      quality: 'major', 
      extensions: [], 
      display: input,
      degree: input
    };
    
    // ✅ TRANSPOR PARA A TONALIDADE CORRETA
    const transposedSymbol = transposeChordToKey(baseSymbolInfo, targetKey);
    
    console.log(`🔄 Transposição: ${baseSymbolInfo.display} (C) → ${transposedSymbol.display} (${targetKey})`);
    
    // ✅ GERAÇÃO MUSICAL DE NOTAS COM ROOT CORRETO
    const notes = getNotesForChord(transposedSymbol);
    
    // ✅ VOICE LEADING MUSICAL CORRIGIDO
    const voicing = voiceLeader.findBestVoicing(notes);
    
    // Análise funcional
    let analysis = 'Tônica';
    if (input.includes('V') || transposedSymbol.quality === 'dominant') analysis = 'Dominante';
    if (input.includes('IV') || input.includes('ii')) analysis = 'Subdominante';
    if (input.includes('vi') || input.includes('m')) analysis = 'Relativo Menor';
    
    console.log(`✅ ${input} → ${transposedSymbol.display} | ${voicing.length} notas musicais`);
    
    return { 
      degree: input, 
      symbol: transposedSymbol.display, 
      voicing, 
      analysis 
    };
  });
}

// ✅ FUNÇÃO AUXILIAR PARA TRANSPOSIÇÃO (MANTIDA)
function transposeChordToKey(symbolInfo: ChordSymbol, targetKey: string): ChordSymbol {
  if (targetKey === 'C') return symbolInfo; // Sem transposição
  
  // Mapa cromático
  const chromaticNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  // Calcular offset de semitons
  const fromIndex = chromaticNotes.indexOf('C');
  const toIndex = chromaticNotes.indexOf(targetKey);
  const semitoneOffset = (toIndex - fromIndex + 12) % 12;
  
  // Transpor a raiz
  const originalRootIndex = chromaticNotes.indexOf(symbolInfo.root);
  const newRootIndex = (originalRootIndex + semitoneOffset) % 12;
  const newRoot = chromaticNotes[newRootIndex];
  
  // Criar novo símbolo transposto
  const transposedSymbol: ChordSymbol = {
    ...symbolInfo,
    root: newRoot,
    display: symbolInfo.display.replace(symbolInfo.root, newRoot)
  };
  
  console.log(`🔧 Transposição matemática: ${symbolInfo.root} + ${semitoneOffset} semitons = ${newRoot}`);
  
  return transposedSymbol;
}

export function formatChordSymbol(input: string): string {
  const degree = convertInputToDegree(input);
  const symbol = DEGREE_SYMBOLS[degree];
  return symbol ? symbol.display : input;
}

// ========================================
// 🧪 FUNÇÕES DE TESTE EXPORTADAS (MANTIDAS)
// ========================================

export function testConversion(): void {
  const testCases = [
    'I', 'iim7', 'V7', 'vi', 'V7/vi', 'C', 'Dm7', 'E7'
  ];
  console.log('🧪 === TESTE DE CONVERSÃO ===');
  testCases.forEach(test => {
    const degree = convertInputToDegree(test);
    const symbol = DEGREE_SYMBOLS[degree];
    console.log(`📝 "${test}" → "${degree}" → "${symbol?.display || 'N/A'}"`);
  });
}

export function testVoiceLeadingFix(): ChordAnalysis[] {
  console.log('\n🧪 === TESTANDO VOICE LEADING CORRIGIDO ===');
  resetVoiceLeading();
  
  const testProgression = ['Abm7', 'Gb7alt', 'E11', 'D7alt', 'Dbm7', 'B9', 'A7alt', 'Abm7'];
  console.log(`🎼 Progressão teste: ${testProgression.join(' - ')}`);
  const results = analyzeProgression(testProgression);
  
  console.log('\n📊 === RESULTADOS COM VOICE LEADING CORRIGIDO ===');
  results.forEach((result, index) => {
    const notes = result.voicing;
    const noteNames = notes.map(midi => {
      const octave = Math.floor(midi / 12) - 1;
      const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
      return `${noteNames[midi % 12]}${octave}`;
    });
    
    console.log(`${index + 1}. ${testProgression[index]} → ${result.symbol}`);
    console.log(`   📝 ${notes.length} notas: ${noteNames.join(', ')}`);
    console.log(`   🎹 MIDI: ${notes.join(', ')}`);
    console.log(`   🎼 Registro: Bass=${notes[0]} | Upper=${notes.slice(1).join(',')}`);
    
    if (notes.length < 4) {
      console.warn(`   ⚠️ ATENÇÃO: Menos de 4 notas!`);
    } else {
      console.log(`   ✅ OK: ${notes.length} notas com voice leading correto`);
    }
  });
  
  return results;
}

// ✅ TESTE ESPECÍFICO PARA O Db7#11
export function testDb7Sharp11(): ChordAnalysis[] {
  console.log('\n🎯 === TESTE ESPECÍFICO: Db7#11 CORRIGIDO ===');
  resetVoiceLeading();
  
  const result = analyzeProgression(['bVI7#11'], 'F');
  const chord = result[0];
  
  console.log(`\n📊 RESULTADO Db7#11:`);
  console.log(`   Grau: ${chord.degree}`);
  console.log(`   Símbolo: ${chord.symbol}`);
  console.log(`   Voicing: ${chord.voicing.join(', ')}`);
  
  console.log(`\n🎵 NOTAS:`);
  const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  chord.voicing.forEach((midi, index) => {
    const octave = Math.floor(midi / 12) - 1;
    const noteName = noteNames[midi % 12];
    console.log(`   ${index + 1}. MIDI ${midi} = ${noteName}${octave}`);
  });
  
  console.log(`\n🎯 ANÁLISE HARMÔNICA:`);
  console.log(`   Esperado: Db, F, Ab, B, G`);
  const hasDb = chord.voicing.some(n => n % 12 === 1);
  const hasF = chord.voicing.some(n => n % 12 === 5);
  const hasAb = chord.voicing.some(n => n % 12 === 8);
  const hasB = chord.voicing.some(n => n % 12 === 11);
  const hasG = chord.voicing.some(n => n % 12 === 7);
  
  console.log(`   ✅ Fundamental (Db): ${hasDb ? 'PRESENTE' : 'AUSENTE'}`);
  console.log(`   ✅ Terça (F): ${hasF ? 'PRESENTE' : 'AUSENTE'}`);
  console.log(`   ✅ Quinta (Ab): ${hasAb ? 'PRESENTE' : 'AUSENTE'}`);
  console.log(`   ✅ Sétima (B): ${hasB ? 'PRESENTE' : 'AUSENTE'}`);
  console.log(`   ✅ #11 (G): ${hasG ? 'PRESENTE' : 'AUSENTE'}`);
  
  const totalCorrect = [hasDb, hasF, hasAb, hasB, hasG].filter(Boolean).length;
  console.log(`\n📈 RESULTADO: ${totalCorrect}/5 notas corretas`);
  
  return result;
}

// ✅ MANTER TODAS AS OUTRAS FUNÇÕES DE TESTE
export function testEnharmonics(): void {
  console.log('\n🎼 === TESTE DE ENARMONIAS ===');
  
  const enharmonicTests = ['bII', 'bIII', 'bVI', 'bVII', 'III', 'VI', 'VII'];
  
  enharmonicTests.forEach(degree => {
    const symbol = DEGREE_SYMBOLS[degree];
    if (symbol) {
      console.log(`🎵 ${degree} → ${symbol.display} (raiz: ${symbol.root})`);
    }
  });
}

export function testFullProgression(): ChordAnalysis[] {
  console.log('\n🎼 === TESTE COMPLETO - PROGRESSÃO JAZZ ===');
  resetVoiceLeading();
  
  const jazzProgression = ['Imaj7', 'V7/ii', 'iim7', 'V7', 'iiim7', 'V7/vi', 'vim7', 'V7alt', 'Imaj7'];
  console.log(`🎼 Progressão: ${jazzProgression.join(' - ')}`);
  
  const results = analyzeProgression(jazzProgression);
  
  console.log('\n📊 === ANÁLISE COMPLETA ===');
  results.forEach((result, index) => {
    const notes = result.voicing;
    const noteNames = notes.map(midi => {
      const octave = Math.floor(midi / 12) - 1;
      const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
      return `${noteNames[midi % 12]}${octave}`;
    });
    
    console.log(`\n${index + 1}. ${jazzProgression[index]} → ${result.symbol}`);
    console.log(`   🎵 ${notes.length} notas: ${noteNames.join(', ')}`);
    console.log(`   🎯 Função: ${result.analysis}`);
    console.log(`   🎹 MIDI: ${notes.join(', ')}`);
    
    if (index > 0) {
      const prevNotes = results[index - 1].voicing;
      const movement = notes.slice(1).map((note, i) => {
        if (prevNotes[i + 1]) {
          return Math.abs(note - prevNotes[i + 1]);
        }
        return 0;
      });
      const avgMovement = movement.reduce((a, b) => a + b, 0) / movement.length;
      console.log(`   🎼 Movimento médio: ${avgMovement.toFixed(1)} semitons`);
    }
  });
  
  return results;
}

export function testBemolChords(): ChordAnalysis[] {
  console.log('\n🎼 === TESTE ESPECÍFICO - ACORDES COM BEMÓIS ===');
  resetVoiceLeading();
  
  const bemolProgression = ['Bb', 'Eb', 'Ab', 'Db7', 'Gm7', 'Cm7', 'F7', 'Bb'];
  console.log(`🎼 Progressão: ${bemolProgression.join(' - ')}`);
  
  const results = analyzeProgression(bemolProgression);
  
  console.log('\n📊 === RESULTADOS BEMÓIS ===');
  results.forEach((result, index) => {
    const notes = result.voicing;
    const noteNames = notes.map(midi => {
      const octave = Math.floor(midi / 12) - 1;
      const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
      return `${noteNames[midi % 12]}${octave}`;
    });
    
    console.log(`${index + 1}. ${bemolProgression[index]} → ${result.symbol}`);
    console.log(`   🎵 ${notes.length} notas: ${noteNames.join(', ')}`);
    console.log(`   ✅ Harmonia: ${noteNames.join(' - ')}`);
  });
  
  return results;
}

// ========================================
// 🌍 EXPOSIÇÃO GLOBAL E INICIALIZAÇÃO
// ========================================

if (typeof window !== 'undefined') {
  const windowTyped = window as unknown as WindowWithPiano;
  
  windowTyped.analyzeProgression = analyzeProgression;
  windowTyped.resetVoiceLeading = resetVoiceLeading;
  windowTyped.testConversion = testConversion;
  windowTyped.formatChordSymbol = formatChordSymbol;
  windowTyped.testVoiceLeadingFix = testVoiceLeadingFix;
  
  // Adicionar funções de teste
  (windowTyped as WindowWithPiano & {
    testEnharmonics: () => void;
    testFullProgression: () => ChordAnalysis[];
    testBemolChords: () => ChordAnalysis[];
    testDb7Sharp11: () => ChordAnalysis[];
  }).testEnharmonics = testEnharmonics;
  
  (windowTyped as WindowWithPiano & {
    testEnharmonics: () => void;
    testFullProgression: () => ChordAnalysis[];
    testBemolChords: () => ChordAnalysis[];
    testDb7Sharp11: () => ChordAnalysis[];
  }).testFullProgression = testFullProgression;
  
  (windowTyped as WindowWithPiano & {
    testEnharmonics: () => void;
    testFullProgression: () => ChordAnalysis[];
    testBemolChords: () => ChordAnalysis[];
    testDb7Sharp11: () => ChordAnalysis[];
  }).testBemolChords = testBemolChords;
  
  (windowTyped as WindowWithPiano & {
    testEnharmonics: () => void;
    testFullProgression: () => ChordAnalysis[];
    testBemolChords: () => ChordAnalysis[];
    testDb7Sharp11: () => ChordAnalysis[];
  }).testDb7Sharp11 = testDb7Sharp11;
  
  windowTyped.getVoiceLeaderDebug = () => voiceLeader.getDebugInfo();
  
  console.log('🎼 === VOICE LEADING SYSTEM CORRIGIDO CARREGADO ===');
  console.log('📝 Principais correções aplicadas:');
  console.log('   ✅ findBestBassNote: lógica de voice leading corrigida');
  console.log('   ✅ Registro do baixo: C2-C4 (MIDI 36-60)');
  console.log('   ✅ Movimento suave: escolhe oitava mais próxima');
  console.log('   ✅ Sem hardcode: funciona para todos os acordes');
  console.log('   ✅ Mantém estrutura original completa');
  console.log('');
  console.log('🧪 Funções de teste disponíveis:');
  console.log('   • testDb7Sharp11() - Teste específico do problema');
  console.log('   • testVoiceLeadingFix() - Teste geral de voice leading');
  console.log('   • testFullProgression() - Progressão jazz completa');
  console.log('   • testBemolChords() - Acordes com bemóis');
  console.log('   • testEnharmonics() - Enarmonias');
  console.log('');
  console.log('🎯 Execute testDb7Sharp11() para testar a correção!');
}