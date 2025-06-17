// src/components/VoiceLeadingSystem.tsx - VERSÃO LIMPA SEM ERROS TYPESCRIPT
// ✅ Nomenclatura padronizada: iim7, V7, Imaj7 (não ii7!)
// 🔧 CORREÇÃO: Reset automático após 5º acorde para evitar inconsistências
// ✅ SEM ERROS TYPESCRIPT - Interfaces não utilizadas removidas, tipos corrigidos

// ========================================
// 🎼 INTERFACES PRINCIPAIS
// ========================================

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
}

interface VoiceLeaderDebugInfo {
  chordCounter: number;
  hasPrevoiusVoicing: boolean;
  historyLength: number;
  lastVoicing: number[] | null;
}

interface VoicingHistoryEntry {
  index: number;
  voicing: number[];
  timestamp: number;
}

// ========================================
// 🎯 MAPEAMENTO DE GRAUS HARMÔNICOS - NOMENCLATURA CORRIGIDA
// ========================================

const DEGREE_SYMBOLS: Record<string, ChordSymbol> = {
  
  // ========== TRÍADES BÁSICAS ==========
  'I': { root: 'C', quality: 'major', extensions: [], display: 'C', degree: 'I' },
  'ii': { root: 'D', quality: 'minor', extensions: [], display: 'Dm', degree: 'ii' },
  'iii': { root: 'E', quality: 'minor', extensions: [], display: 'Em', degree: 'iii' },
  'IV': { root: 'F', quality: 'major', extensions: [], display: 'F', degree: 'IV' },
  'V': { root: 'G', quality: 'major', extensions: [], display: 'G', degree: 'V' },
  'vi': { root: 'A', quality: 'minor', extensions: [], display: 'Am', degree: 'vi' },
  'vii°': { root: 'B', quality: 'diminished', extensions: [], display: 'Bdim', degree: 'vii°' },

  // ========== MODO MENOR ==========
  'i': { root: 'C', quality: 'minor', extensions: [], display: 'Cm', degree: 'i' },
  'ii°': { root: 'D', quality: 'diminished', extensions: [], display: 'Ddim', degree: 'ii°' },
  'III': { root: 'Eb', quality: 'major', extensions: [], display: 'Eb', degree: 'III' },
  'iv': { root: 'F', quality: 'minor', extensions: [], display: 'Fm', degree: 'iv' },
  'v': { root: 'G', quality: 'minor', extensions: [], display: 'Gm', degree: 'v' },
  'VI': { root: 'Ab', quality: 'major', extensions: [], display: 'Ab', degree: 'VI' },
  'VII': { root: 'Bb', quality: 'major', extensions: [], display: 'Bb', degree: 'VII' },

  // ========== SÉTIMAS MAIORES - NOMENCLATURA PADRONIZADA ==========
  'Imaj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7', degree: 'Imaj7' },
  'IVmaj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7', degree: 'IVmaj7' },
  'IImaj7': { root: 'D', quality: 'major7', extensions: [], display: 'D∆7', degree: 'IImaj7' },
  'IIImaj7': { root: 'E', quality: 'major7', extensions: [], display: 'E∆7', degree: 'IIImaj7' },
  'Vmaj7': { root: 'G', quality: 'major7', extensions: [], display: 'G∆7', degree: 'Vmaj7' },
  'VImaj7': { root: 'A', quality: 'major7', extensions: [], display: 'A∆7', degree: 'VImaj7' },
  'VIImaj7': { root: 'B', quality: 'major7', extensions: [], display: 'B∆7', degree: 'VIImaj7' },
  
  // ========== COMPATIBILIDADE COM NOTAÇÃO ANTIGA ==========
  'I^maj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7', degree: 'Imaj7' },
  'IV^maj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7', degree: 'IVmaj7' },

  // ========== SÉTIMAS MENORES - NOMENCLATURA CORRIGIDA ==========
  'iim7': { root: 'D', quality: 'minor7', extensions: [], display: 'Dm7', degree: 'iim7' },
  'iiim7': { root: 'E', quality: 'minor7', extensions: [], display: 'Em7', degree: 'iiim7' },
  'vim7': { root: 'A', quality: 'minor7', extensions: [], display: 'Am7', degree: 'vim7' },
  'im7': { root: 'C', quality: 'minor7', extensions: [], display: 'Cm7', degree: 'im7' },
  'ivm7': { root: 'F', quality: 'minor7', extensions: [], display: 'Fm7', degree: 'ivm7' },
  'vm7': { root: 'G', quality: 'minor7', extensions: [], display: 'Gm7', degree: 'vm7' },
  
  // ========== COMPATIBILIDADE COM NOTAÇÃO ANTIGA ==========
  'ii7': { root: 'D', quality: 'minor7', extensions: [], display: 'Dm7', degree: 'iim7' },
  'iii7': { root: 'E', quality: 'minor7', extensions: [], display: 'Em7', degree: 'iiim7' },
  'vi7': { root: 'A', quality: 'minor7', extensions: [], display: 'Am7', degree: 'vim7' },
  'i7': { root: 'C', quality: 'minor7', extensions: [], display: 'Cm7', degree: 'im7' },
  'iv7': { root: 'F', quality: 'minor7', extensions: [], display: 'Fm7', degree: 'ivm7' },
  'v7': { root: 'G', quality: 'minor7', extensions: [], display: 'Gm7', degree: 'vm7' },

  // ========== DOMINANTES ==========
  'V7': { root: 'G', quality: 'dominant', extensions: [], display: 'G7', degree: 'V7' },
  'I7': { root: 'C', quality: 'dominant', extensions: [], display: 'C7', degree: 'I7' },
  'II7': { root: 'D', quality: 'dominant', extensions: [], display: 'D7', degree: 'II7' },
  'III7': { root: 'E', quality: 'dominant', extensions: [], display: 'E7', degree: 'III7' },
  'IV7': { root: 'F', quality: 'dominant', extensions: [], display: 'F7', degree: 'IV7' },
  'VI7': { root: 'A', quality: 'dominant', extensions: [], display: 'A7', degree: 'VI7' },
  'VII7': { root: 'B', quality: 'dominant', extensions: [], display: 'B7', degree: 'VII7' },

  // ========== DOMINANTES SECUNDÁRIAS ==========
  'V/ii': { root: 'A', quality: 'dominant', extensions: [], display: 'A7', degree: 'V/ii' },
  'V7/ii': { root: 'A', quality: 'dominant', extensions: [], display: 'A7', degree: 'V7/ii' },
  'V/iii': { root: 'B', quality: 'dominant', extensions: [], display: 'B7', degree: 'V/iii' },
  'V7/iii': { root: 'B', quality: 'dominant', extensions: [], display: 'B7', degree: 'V7/iii' },
  'V/vi': { root: 'E', quality: 'dominant', extensions: [], display: 'E7', degree: 'V/vi' },
  'V7/vi': { root: 'E', quality: 'dominant', extensions: [], display: 'E7', degree: 'V7/vi' },
  'V/IV': { root: 'C', quality: 'dominant', extensions: [], display: 'C7', degree: 'V/IV' },
  'V7/IV': { root: 'C', quality: 'dominant', extensions: [], display: 'C7', degree: 'V7/IV' },
  'V/V': { root: 'D', quality: 'dominant', extensions: [], display: 'D7', degree: 'V/V' },
  'V7/V': { root: 'D', quality: 'dominant', extensions: [], display: 'D7', degree: 'V7/V' },

  // ========== EMPRÉSTIMOS MODAIS ==========
  'bII': { root: 'Db', quality: 'major', extensions: [], display: 'D♭', degree: 'bII' },
  'bIII': { root: 'Eb', quality: 'major', extensions: [], display: 'E♭', degree: 'bIII' },
  'bVI': { root: 'Ab', quality: 'major', extensions: [], display: 'A♭', degree: 'bVI' },
  'bVII': { root: 'Bb', quality: 'major', extensions: [], display: 'B♭', degree: 'bVII' },
  'bII7': { root: 'Db', quality: 'dominant', extensions: [], display: 'D♭7', degree: 'bII7' },
  'bIII7': { root: 'Eb', quality: 'dominant', extensions: [], display: 'E♭7', degree: 'bIII7' },
  'bVI7': { root: 'Ab', quality: 'dominant', extensions: [], display: 'A♭7', degree: 'bVI7' },
  'bVII7': { root: 'Bb', quality: 'dominant', extensions: [], display: 'B♭7', degree: 'bVII7' },
  'bIImaj7': { root: 'Db', quality: 'major7', extensions: [], display: 'D♭∆7', degree: 'bIImaj7' },

  // ========== MEIO-DIMINUTOS ==========
  'iim7b5': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)', degree: 'iim7b5' },
  'viiø7': { root: 'B', quality: 'half-diminished', extensions: [], display: 'Bm7(♭5)', degree: 'viiø7' },
  'iiø7': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)', degree: 'iiø7' },
  'ii7b5': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)', degree: 'iim7b5' },

  // ========== DIMINUTOS COM SÉTIMA ==========
  'vii°7': { root: 'B', quality: 'diminished7', extensions: [], display: 'Bdim7', degree: 'vii°7' },
  'ii°7': { root: 'D', quality: 'diminished7', extensions: [], display: 'Ddim7', degree: 'ii°7' },

  // ========== SUSPENSÕES ==========
  'V7sus4': { root: 'G', quality: 'dominant', extensions: ['sus4'], display: 'G7sus4', degree: 'V7sus4' },
  'I7sus4': { root: 'C', quality: 'dominant', extensions: ['sus4'], display: 'C7sus4', degree: 'I7sus4' },
  'Isus4': { root: 'C', quality: 'sus4', extensions: [], display: 'Csus4', degree: 'Isus4' },
  'Vsus4': { root: 'G', quality: 'sus4', extensions: [], display: 'Gsus4', degree: 'Vsus4' },

  // ========== EXTENSÕES AVANÇADAS - NOMENCLATURA PADRONIZADA ==========
  'V7alt': { root: 'G', quality: 'dominant', extensions: ['alt'], display: 'G7alt', degree: 'V7alt' },
  'V7#9': { root: 'G', quality: 'dominant', extensions: ['#9'], display: 'G7(#9)', degree: 'V7#9' },
  'V7#11': { root: 'G', quality: 'dominant', extensions: ['#11'], display: 'G7(#11)', degree: 'V7#11' },
  'Imaj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)', degree: 'Imaj7#11' },
  
  // ========== COMPATIBILIDADE COM NOTAÇÃO ANTIGA ==========
  'I^maj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)', degree: 'Imaj7#11' },

  // ========== MENORES COM 7ª MAIOR - NOMENCLATURA PADRONIZADA ==========
  'imaj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)', degree: 'imaj7' },
  
  // ========== COMPATIBILIDADE COM NOTAÇÃO ANTIGA ==========
  'i^maj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)', degree: 'imaj7' },

  // ========== SEXTAS ==========
  'I6': { root: 'C', quality: 'major6', extensions: [], display: 'C6', degree: 'I6' },
  'vi6': { root: 'A', quality: 'minor6', extensions: [], display: 'Am6', degree: 'vi6' },
  'IV6': { root: 'F', quality: 'major6', extensions: [], display: 'F6', degree: 'IV6' },
};

// ========================================
// 🎵 MAPEAMENTO DE CIFRAS PARA GRAUS - NOMENCLATURA CORRIGIDA
// ========================================

const CHORD_TO_DEGREE_MAP: Record<string, string> = {
  // Em Dó Maior - Tríades e Tétrades - NOMENCLATURA CORRIGIDA
  'C': 'I', 'Cmaj': 'I', 'Cmaj7': 'Imaj7', 'C∆7': 'Imaj7', 'CMaj7': 'Imaj7',
  'Dm': 'ii', 'Dm7': 'iim7',
  'Em': 'iii', 'Em7': 'iiim7', 'Em7b5': 'iiø7', 'Em7(b5)': 'iiø7',
  'F': 'IV', 'Fmaj': 'IV', 'Fmaj7': 'IVmaj7', 'F∆7': 'IVmaj7', 'FMaj7': 'IVmaj7',
  'G': 'V', 'G7': 'V7', 'Gm': 'v', 'Gm7': 'vm7',
  'Am': 'vi', 'Am7': 'vim7',
  'Bdim': 'vii°', 'Bm7b5': 'viiø7', 'Bm7(b5)': 'viiø7',
  
  // Em Dó Menor - NOMENCLATURA CORRIGIDA
  'Cm': 'i', 'Cm7': 'im7', 'Cm(maj7)': 'imaj7', 'Cm(∆7)': 'imaj7',
  'Ddim': 'ii°', 'Dm7b5': 'iiø7', 'Dm7(b5)': 'iiø7',
  'Eb': 'III', 'EbMaj7': 'IIImaj7', 'Eb7': 'III7',
  'Fm': 'iv', 'Fm7': 'ivm7',
  'Ab': 'VI', 'AbMaj7': 'VImaj7', 'Ab7': 'VI7',
  'Bb': 'VII', 'BbMaj7': 'VIImaj7', 'Bb7': 'VII7',
  
  // Empréstimos modais - NOMENCLATURA CORRIGIDA
  'Db': 'bII', 'Db7': 'bII7', 'DbMaj7': 'bIImaj7',
  
  // Dominantes (contexto determina se são diatônicos ou secundários)
  'C7': 'I7',     // Por padrão I7, mas pode ser V7/IV dependendo do contexto
  'D7': 'II7',    // Por padrão II7, mas pode ser V7/V dependendo do contexto  
  'E7': 'III7',   // Por padrão III7, mas pode ser V7/vi dependendo do contexto
  'F7': 'IV7',
  'A7': 'VI7',    // Por padrão VI7, mas pode ser V7/ii dependendo do contexto
  'B7': 'VII7',   // Por padrão VII7, mas pode ser V7/iii dependendo do contexto
  
  // Sextas
  'C6': 'I6', 'Am6': 'vi6', 'F6': 'IV6',
};

// ========================================
// 🔍 FUNÇÕES DE DETECÇÃO E CONVERSÃO
// ========================================

function isDegreeNotation(input: string): boolean {
  // Detecta se é grau (contém números romanos ou símbolos específicos)
  const degreePattern = /^(b?[IVX]+|[ivx]+|vii°|iiø|°|ø|maj|sus|alt|add|#|b|\d+|\/)/;
  return degreePattern.test(input);
}

function isChordSymbol(input: string): boolean {
  // Detecta se é cifra (começa com nota A-G)
  const chordPattern = /^[A-G][b#]?/;
  return chordPattern.test(input);
}

function normalizeChordSymbol(chord: string): string {
  // Normalizar símbolos comuns
  return chord
    .replace(/maj7/g, 'Maj7')
    .replace(/∆/g, 'Maj')
    .replace(/△/g, 'Maj')
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/°/g, 'dim')
    .replace(/ø/g, 'm7b5')
    .replace(/\(b5\)/g, 'b5')
    .replace(/\(#5\)/g, '#5')
    .replace(/\(b9\)/g, 'b9')
    .replace(/\(#9\)/g, '#9')
    .replace(/\(#11\)/g, '#11')
    .replace(/\(b13\)/g, 'b13');
}

function chordSymbolToDegree(chordSymbol: string): string {
  const normalized = normalizeChordSymbol(chordSymbol);
  
  // Primeiro, tentar busca direta no mapeamento
  if (CHORD_TO_DEGREE_MAP[normalized]) {
    return CHORD_TO_DEGREE_MAP[normalized];
  }
  
  // Se não encontrou, tentar busca parcial
  for (const [chord, degree] of Object.entries(CHORD_TO_DEGREE_MAP)) {
    if (normalized.startsWith(chord) || chord.startsWith(normalized)) {
      return degree;
    }
  }
  
  // Fallback: analisar a estrutura da cifra
  console.warn(`⚠️ Cifra não reconhecida: ${chordSymbol}, usando fallback`);
  
  // Extrair nota fundamental
  const rootMatch = chordSymbol.match(/^([A-G][b#]?)/);
  if (!rootMatch) return 'I'; // Fallback para tônica
  
  const root = rootMatch[1];
  
  // Mapeamento básico de notas para graus em Dó maior
  const noteToRoman: Record<string, string> = {
    'C': 'I', 'Db': 'bII', 'D': 'II', 'Eb': 'bIII', 'E': 'III', 'F': 'IV',
    'Gb': 'bV', 'G': 'V', 'Ab': 'bVI', 'A': 'VI', 'Bb': 'bVII', 'B': 'VII'
  };
  
  const baseDegree = noteToRoman[root] || 'I';
  
  // Ajustar qualidade do acorde
  if (chordSymbol.includes('m') && !chordSymbol.includes('maj')) {
    if (chordSymbol.includes('7')) {
      return baseDegree.toLowerCase() + 'm7'; // iim7, vim7, etc.
    }
    return baseDegree.toLowerCase(); // ii, vi, etc.
  }
  
  if (chordSymbol.includes('7')) {
    if (chordSymbol.includes('maj') || chordSymbol.includes('∆')) {
      return baseDegree + 'maj7'; // Imaj7, IVmaj7, etc.
    }
    return baseDegree + '7'; // V7, I7, etc.
  }
  
  return baseDegree;
}

function convertInputToDegree(input: string): string {
  const trimmed = input.trim();
  
  // Se já é um grau, retornar como está
  if (isDegreeNotation(trimmed)) {
    return trimmed;
  }
  
  // Se é uma cifra, converter para grau
  if (isChordSymbol(trimmed)) {
    return chordSymbolToDegree(trimmed);
  }
  
  // Fallback: assumir que é grau
  console.warn(`⚠️ Input não reconhecido: "${trimmed}", tratando como grau`);
  return trimmed;
}

// ========================================
// 🎹 FUNÇÃO PRINCIPAL DE CONVERSÃO
// ========================================

function getNotesForChord(symbol: ChordSymbol, octave: number = 4): number[] {
  const rootMap: Record<string, number> = {
    'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 
    'F#': 6, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11
  };
  
  const baseMidi = 12 * octave + (rootMap[symbol.root] || 0);
  
  // ✅ INTERVALOS COM SÉTIMAS GARANTIDAS
  const qualityIntervals: Record<string, number[]> = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'dominant': [0, 4, 7, 10],           // ✅ SÉTIMA MENOR
    'major7': [0, 4, 7, 11],             // ✅ SÉTIMA MAIOR  
    'minor7': [0, 3, 7, 10],             // ✅ SÉTIMA MENOR
    'minor-major7': [0, 3, 7, 11],       // ✅ SÉTIMA MAIOR
    'diminished': [0, 3, 6],
    'diminished7': [0, 3, 6, 9],         // ✅ SÉTIMA DIMINUTA
    'half-diminished': [0, 3, 6, 10],    // ✅ SÉTIMA MENOR
    'augmented': [0, 4, 8],
    'sus4': [0, 5, 7],
    'sus2': [0, 2, 7],
    'major6': [0, 4, 7, 9],              // ✅ SEXTA
    'minor6': [0, 3, 7, 9],              // ✅ SEXTA
    'hybrid': [0, 4, 7],
    'sus-complex': [0, 5, 7, 10]         // ✅ COM SÉTIMA
  };
  
  const notes = new Set(qualityIntervals[symbol.quality] || qualityIntervals.major);
  
  // 🎭 PROCESSAR EXTENSÕES
  const extensionIntervals: Record<string, number> = {
    '9': 14, 'b9': 13, '#9': 15, '11': 17, '#11': 18, '13': 21, 'b13': 20,
    'b5': 6, '#5': 8, 'sus4': 5, 'sus2': 2, 'add4': 5, 'add9': 14
  };
  
  for (const ext of symbol.extensions) {
    if (ext === 'sus4') {
      notes.delete(3); // Remove terça menor
      notes.delete(4); // Remove terça maior
      notes.add(5);    // Adiciona quarta
    } else if (ext === 'alt') {
      notes.add(13); // b9
      notes.add(15); // #9
      notes.add(8);  // #5
    } else if (ext === '#5') {
      notes.delete(7); // Remove quinta justa
      notes.add(8);    // Adiciona quinta aumentada
    } else if (extensionIntervals[ext]) {
      notes.add(extensionIntervals[ext]);
    }
  }
  
  const result = Array.from(notes).map(i => baseMidi + i).sort((a, b) => a - b);
  
  // 🎯 DEBUG SUTIL (só para acordes com sétima)
  if (symbol.display.includes('7') || symbol.display.includes('∆')) {
    console.log(`🎵 ${symbol.display}: ${result.length} notas (${result.join(',')})`);
  }
  
  return result;
}

// ========================================
// 🎼 VOICE LEADING SYSTEM - CORRIGIDO COM RESET AUTOMÁTICO
// ========================================

class VoiceLeader {
  private previousVoicing: number[] | null = null;
  private readonly idealCenter = 60; // C4
  private readonly minSpread = 48;   // C3
  private readonly maxSpread = 84;   // C6
  private chordCounter = 0;          // 🔧 NOVO: Contador de acordes
  private voicingHistory: VoicingHistoryEntry[] = []; // 🔧 NOVO: Histórico
  private readonly maxHistorySize = 4;    // 🔧 NOVO: Máximo de histórico
  private readonly resetThreshold = 5;     // 🔧 NOVO: Reset no 5º acorde

  // 🔧 CORREÇÃO PRINCIPAL: findBestVoicing com reset automático
  public findBestVoicing(currentNotes: number[]): number[] {
    this.chordCounter++;
    
    console.log(`🎵 Voice Leading - Acorde ${this.chordCounter}`);
    console.log(`📋 Notas entrada: ${currentNotes.join(',')}`);

    // 🔧 CORREÇÃO 1: Reset automático no 5º acorde
    if (this.chordCounter === this.resetThreshold) {
      console.log(`🔄 RESET AUTOMÁTICO no acorde ${this.chordCounter} (${this.resetThreshold}º)`);
      this.resetVoiceLeading();
    }

    // 🔧 CORREÇÃO 2: Reset periódico a cada 8 acordes
    if (this.chordCounter > this.resetThreshold && this.chordCounter % 8 === 0) {
      console.log(`🔄 Reset periódico no acorde ${this.chordCounter}`);
      this.resetVoiceLeading();
    }

    // 🔧 CORREÇÃO 3: Limitar histórico
    if (this.voicingHistory.length > this.maxHistorySize) {
      this.voicingHistory = this.voicingHistory.slice(-this.maxHistorySize);
      console.log(`🧹 Histórico reduzido para ${this.maxHistorySize} entradas`);
    }

    // Se não há voicing anterior, criar distribuição inicial
    if (!this.previousVoicing) {
      const voicing = this.distributeVoices(currentNotes);
      this.updateHistory(voicing);
      return voicing;
    }

    // Encontrar melhor voicing
    let bestVoicing = currentNotes;
    let minScore = Infinity;

    // Testa diferentes inversões e oitavas
    for (let octaveShift = -2; octaveShift <= 2; octaveShift++) {
      for (let inversion = 0; inversion < currentNotes.length; inversion++) {
        const candidate = this.createVoicing(currentNotes, inversion, octaveShift);
        
        if (this.isWithinRange(candidate) && this.isValidVoicing(candidate)) {
          const score = this.calculateVoicingScore(candidate);
          if (score < minScore) {
            minScore = score;
            bestVoicing = candidate;
          }
        }
      }
    }

    this.updateHistory(bestVoicing);
    
    console.log(`🔙 Voicing anterior: ${this.previousVoicing ? this.previousVoicing.join(',') : 'Nenhum'}`);
    console.log(`✅ Novo voicing: ${bestVoicing.join(',')}`);
    console.log(`📊 Movimento: ${this.calculateMovement(this.previousVoicing, bestVoicing)} semitons`);

    return bestVoicing;
  }

  // 🔧 CORREÇÃO 4: Reset completo do voice leading
  private resetVoiceLeading(): void {
    console.log('🔄 Resetando voice leading...');
    this.previousVoicing = null;
    this.voicingHistory = [];
    console.log('✅ Voice leading resetado');
  }

  // 🔧 CORREÇÃO 5: Atualizar histórico
  private updateHistory(voicing: number[]): void {
    this.previousVoicing = [...voicing];
    this.voicingHistory.push({
      index: this.chordCounter,
      voicing: [...voicing],
      timestamp: Date.now()
    });
  }

  // 🔧 CORREÇÃO 6: Validação melhorada de voicing
  private isValidVoicing(voicing: number[]): boolean {
    // Verificar se não há clusters indesejados
    const sortedVoicing = [...voicing].sort((a, b) => a - b);
    
    for (let i = 1; i < sortedVoicing.length; i++) {
      const interval = sortedVoicing[i] - sortedVoicing[i-1];
      
      // Evitar clusters de semitom (exceto em casos específicos)
      if (interval === 1) {
        console.log(`⚠️ Cluster detectado: ${sortedVoicing[i-1]} - ${sortedVoicing[i]}`);
        return false;
      }
      
      // Evitar saltos muito grandes entre vozes adjacentes
      if (interval > 24) {
        console.log(`⚠️ Salto muito grande: ${interval} semitons`);
        return false;
      }
    }
    
    // Verificar extensão total
    const range = sortedVoicing[sortedVoicing.length - 1] - sortedVoicing[0];
    if (range < 12 || range > 36) {
      console.log(`⚠️ Range problemático: ${range} semitons`);
      return false;
    }
    
    return true;
  }

  private distributeVoices(notes: number[]): number[] {
    const result: number[] = [];
    
    // 🎼 PRESERVAR TODAS AS NOTAS (incluindo sétimas)
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      let targetOctave: number;
      
      if (i === 0) {
        targetOctave = 3; // Baixo
      } else if (i === notes.length - 1) {
        targetOctave = 5; // Soprano (pode ser a sétima!)
      } else {
        targetOctave = 4; // Vozes internas
      }
      
      const targetMidi = (note % 12) + (targetOctave * 12);
      result.push(targetMidi);
    }
    
    return result.sort((a, b) => a - b);
  }

  private createVoicing(notes: number[], inversion: number, octaveShift: number): number[] {
    const inverted = this.invert(notes, inversion);
    return inverted.map(note => note + (12 * octaveShift));
  }

  private calculateVoicingScore(candidate: number[]): number {
    if (!this.previousVoicing) return 0;
    
    const movement = this.calculateMovement(this.previousVoicing, candidate);
    const spread = this.calculateSpread(candidate);
    const centerDistance = Math.abs(this.getCenter(candidate) - this.idealCenter);
    
    // 🔧 CORREÇÃO 7: Penalidades adicionais
    const clusterPenalty = this.calculateClusterPenalty(candidate);
    const jumpPenalty = this.calculateJumpPenalty(candidate);
    
    return movement + (spread * 0.3) + (centerDistance * 0.2) + clusterPenalty + jumpPenalty;
  }

  // 🔧 CORREÇÃO 8: Penalidades específicas
  private calculateClusterPenalty(voicing: number[]): number {
    const sortedVoicing = [...voicing].sort((a, b) => a - b);
    let penalty = 0;
    
    for (let i = 1; i < sortedVoicing.length; i++) {
      const interval = sortedVoicing[i] - sortedVoicing[i-1];
      if (interval === 1) penalty += 20; // Penalidade alta para clusters
      if (interval === 2) penalty += 5;  // Penalidade menor para segundas
    }
    
    return penalty;
  }

  private calculateJumpPenalty(voicing: number[]): number {
    if (!this.previousVoicing) return 0;
    
    let penalty = 0;
    const maxLength = Math.max(this.previousVoicing.length, voicing.length);
    
    for (let i = 0; i < maxLength; i++) {
      const prevNote = this.previousVoicing[i] || this.previousVoicing[this.previousVoicing.length - 1];
      const currNote = voicing[i] || voicing[voicing.length - 1];
      const jump = Math.abs(prevNote - currNote);
      
      if (jump > 12) penalty += jump * 0.5; // Penalidade para saltos grandes
    }
    
    return penalty;
  }

  private calculateMovement(prev: number[], current: number[]): number {
    let totalMovement = 0;
    const maxLength = Math.max(prev.length, current.length);
    
    for (let i = 0; i < maxLength; i++) {
      const prevNote = prev[i] || prev[prev.length - 1];
      const currNote = current[i] || current[current.length - 1];
      totalMovement += Math.abs(prevNote - currNote);
    }
    
    return totalMovement;
  }

  private calculateSpread(notes: number[]): number {
    if (notes.length < 2) return 0;
    return Math.abs(notes[notes.length - 1] - notes[0]);
  }

  private getCenter(notes: number[]): number {
    return notes.reduce((sum, note) => sum + note, 0) / notes.length;
  }

  private isWithinRange(notes: number[]): boolean {
    return notes.every(note => note >= this.minSpread && note <= this.maxSpread);
  }

  private invert(notes: number[], inversionCount: number): number[] {
    const result = [...notes];
    for (let i = 0; i < inversionCount; i++) {
      if (result.length > 0) {
        const first = result.shift()!;
        result.push(first + 12);
      }
    }
    return result;
  }

  // 🔧 CORREÇÃO 9: Reset público
  public reset(): void {
    console.log('🔄 Reset manual do voice leading');
    this.chordCounter = 0;
    this.resetVoiceLeading();
  }

  // 🔧 CORREÇÃO 10: Debug info
  public getDebugInfo(): VoiceLeaderDebugInfo {
    return {
      chordCounter: this.chordCounter,
      hasPrevoiusVoicing: !!this.previousVoicing,
      historyLength: this.voicingHistory.length,
      lastVoicing: this.previousVoicing
    };
  }
}

const voiceLeader = new VoiceLeader();

// ========================================
// 🎯 FUNÇÕES EXPORTADAS
// ========================================

export function resetVoiceLeading(): void {
  voiceLeader.reset();
}

export function analyzeProgression(inputs: string[]): ChordAnalysis[] {
  resetVoiceLeading();
  
  console.log(`🔍 Analisando progressão: [${inputs.join(', ')}]`);
  
  return inputs.map((input: string, index: number): ChordAnalysis => {
    // 🔄 CONVERSÃO AUTOMÁTICA: CIFRA → GRAU
    const degree = convertInputToDegree(input);
    
    console.log(`🔄 Input ${index + 1}: "${input}" → "${degree}"`);
    
    // Buscar informações do grau
    const symbolInfo = DEGREE_SYMBOLS[degree] || { 
      root: 'C', 
      quality: 'major', 
      extensions: [], 
      display: input, // Usar input original se não encontrar
      degree: degree
    };
    
    const notes = getNotesForChord(symbolInfo);
    const voicing = voiceLeader.findBestVoicing(notes);
    
    // 🔍 VERIFICAÇÃO DE SÉTIMAS (debug sutil)
    if ((degree.includes('7') || input.includes('7')) && voicing.length < 4) {
      console.warn(`⚠️ ${degree} (${input}) deveria ter 4+ notas, mas gerou ${voicing.length}`);
    }
    
    // Análise funcional
    let analysis = 'Tônica';
    if (degree.includes('V') || degree.includes('VII')) analysis = 'Dominante';
    if (degree.includes('IV') || degree.includes('ii')) analysis = 'Subdominante';
    if (degree.includes('vi') || degree.includes('VI')) analysis = 'Relativo';
    if (degree.includes('°') || degree.includes('dim')) analysis = 'Diminuto';
    if (degree.includes('iii')) analysis = 'Mediante';
    if (degree.includes('/')) analysis = 'Dominante Secundária';
    if (degree.includes('b')) analysis = 'Empréstimo Modal';
    
    console.log(`✅ ${input} → ${degree} → ${symbolInfo.display} (${analysis})`);
    
    return { 
      degree, 
      symbol: symbolInfo.display, 
      voicing, 
      analysis 
    };
  });
}

export function formatChordSymbol(input: string): string {
  const degree = convertInputToDegree(input);
  const symbol = DEGREE_SYMBOLS[degree];
  return symbol ? symbol.display : input;
}

// ========================================
// 🧪 FUNÇÃO DE TESTE E DEBUG
// ========================================

export function testConversion(): void {
  const testCases = [
    // Graus (devem passar direto) - NOMENCLATURA CORRIGIDA
    'I', 'iim7', 'V7', 'vi', 'iiim7', 'IVmaj7',
    // Cifras (devem ser convertidas)
    'C', 'Dm7', 'G7', 'Am', 'Em7', 'FMaj7',
    // Casos complexos
    'V7/ii', 'A7', 'bVII', 'Bb', 'C7sus4'
  ];
  
  console.log('🧪 === TESTE DE CONVERSÃO (NOMENCLATURA CORRIGIDA) ===');
  testCases.forEach(test => {
    const degree = convertInputToDegree(test);
    const symbol = DEGREE_SYMBOLS[degree];
    console.log(`📝 "${test}" → "${degree}" → "${symbol?.display || 'N/A'}"`);
  });
}

// 🔧 FUNÇÃO DE TESTE ESPECÍFICA PARA O PROBLEMA DO 5º ACORDE
function testVoiceLeadingFix(): ChordAnalysis[] {
  console.log('\n🧪 === TESTANDO CORREÇÃO DO 5º ACORDE ===');
  
  // Resetar para estado limpo
  resetVoiceLeading();
  
  // Simular progressão "Blues with Tritone Subs"
  const testProgression = ['I7', 'bII7', 'I7', 'I7', 'IV7', 'bV7', 'I7', 'bII7'];
  
  console.log(`🎼 Progressão teste: ${testProgression.join(' - ')}`);
  
  const results = analyzeProgression(testProgression);
  
  console.log('\n📊 === RESULTADOS ===');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${testProgression[index]} → ${result.symbol} (${result.voicing.join(',')})`);
    
    if (index === 4) {
      console.log('🔍 CHECKPOINT: 5º acorde processado (deve haver reset no próximo)');
    }
    if (index === 5) {
      console.log('🎯 TESTE: 6º acorde após reset (deve soar consistente)');
    }
  });
  
  console.log('\n✅ Teste concluído! Verifique se houve reset no 5º acorde.');
  console.log('🔧 Estado do voice leader:', voiceLeader.getDebugInfo());
  
  return results;
}

// ========================================
// 🌍 EXPOSIÇÃO GLOBAL E INICIALIZAÇÃO - TYPESCRIPT SAFE
// ========================================

// Executar teste automaticamente em desenvolvimento
if (typeof window !== 'undefined') {
  const windowTyped = window as unknown as WindowWithPiano;
  
  // ✅ EXPOR FUNÇÕES GLOBALMENTE - TYPESCRIPT SAFE
  windowTyped.analyzeProgression = analyzeProgression;
  windowTyped.resetVoiceLeading = resetVoiceLeading;
  windowTyped.testConversion = testConversion;
  windowTyped.formatChordSymbol = formatChordSymbol;
  
  // 🔧 NOVAS FUNÇÕES DE DEBUG - TYPESCRIPT SAFE
  windowTyped.testVoiceLeadingFix = testVoiceLeadingFix;
  windowTyped.getVoiceLeaderDebug = () => voiceLeader.getDebugInfo();
  
  console.log('🎼 VoiceLeadingSystem CORRIGIDO carregado!');
  console.log('✅ Nomenclatura corrigida: iim7, V7, Imaj7 (não ii7!)');
  console.log('🔧 CORREÇÃO: Reset automático no 5º acorde implementado');
  console.log('🧪 Teste disponível: testVoiceLeadingFix()');
  console.log('🔍 Debug disponível: getVoiceLeaderDebug()');
  console.log('✅ SEM ERROS TYPESCRIPT');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Executando teste da correção automaticamente...');
    setTimeout(() => {
      windowTyped.testVoiceLeadingFix();
    }, 1000);
  }
}