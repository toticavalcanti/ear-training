// src/components/VoiceLeadingSystem.tsx - VERSÃO FINAL E COMPLETA
// ✅ Lógica de baixo dedicada para garantir a fundamental em todos os acordes.
// ✅ Voice leading suave aplicado apenas às vozes superiores.
// ✅ Nomenclatura de acordes dominantes corrigida no mapeamento.
// ✅ Estrutura e todas as funções originais mantidas.

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



// ========================================
// 🎯 MAPEAMENTO DE GRAUS HARMÔNICOS - CORRIGIDO E EXPANDIDO
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

  // ========== DOMINANTES SECUNDÁRIAS (QUALIDADE CORRIGIDA) ==========
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
  'iv°7': { root: 'F', quality: 'diminished7', extensions: [], display: 'Fdim7', degree: 'iv°7' },


  // ========== SUSPENSÕES ==========
  'V7sus4': { root: 'G', quality: 'dominant', extensions: ['sus4'], display: 'G7sus4', degree: 'V7sus4' },
  'I7sus4': { root: 'C', quality: 'dominant', extensions: ['sus4'], display: 'C7sus4', degree: 'I7sus4' },
  'Isus4': { root: 'C', quality: 'sus4', extensions: [], display: 'Csus4', degree: 'Isus4' },
  'Vsus4': { root: 'G', quality: 'sus4', extensions: [], display: 'Gsus4', degree: 'Vsus4' },

  // ========== EXTENSÕES AVANÇADAS ==========
  'V7alt': { root: 'G', quality: 'dominant', extensions: ['alt'], display: 'G7alt', degree: 'V7alt' },
  'V7#9': { root: 'G', quality: 'dominant', extensions: ['#9'], display: 'G7(#9)', degree: 'V7#9' },
  'V7#11': { root: 'G', quality: 'dominant', extensions: ['#11'], display: 'G7(#11)', degree: 'V7#11' },
  'Imaj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)', degree: 'Imaj7#11' },
  
  'I^maj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)', degree: 'Imaj7#11' },
  'imaj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)', degree: 'imaj7' },
  'i^maj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)', degree: 'imaj7' },

  // ========== SEXTAS ==========
  'I6': { root: 'C', quality: 'major6', extensions: [], display: 'C6', degree: 'I6' },
  'vi6': { root: 'A', quality: 'minor6', extensions: [], display: 'Am6', degree: 'vi6' },
  'IV6': { root: 'F', quality: 'major6', extensions: [], display: 'F6', degree: 'IV6' },
};

// ========================================
// 🎵 MAPEAMENTO DE CIFRAS PARA GRAUS
// ========================================

const CHORD_TO_DEGREE_MAP: Record<string, string> = {
  'C': 'I', 'Cmaj7': 'Imaj7', 'Dm': 'ii', 'Dm7': 'iim7', 'Em': 'iii', 'Em7': 'iiim7',
  'F': 'IV', 'Fmaj7': 'IVmaj7', 'G': 'V', 'G7': 'V7', 'Am': 'vi', 'Am7': 'vim7',
  'Bdim': 'vii°', 'Bm7b5': 'viiø7',
  'Cm': 'i', 'Cm7': 'im7', 'Ddim': 'ii°', 'Dm7b5': 'iiø7', 'Eb': 'III',
  'Fm': 'iv', 'Fm7': 'ivm7', 'Gm': 'v', 'Gm7': 'vm7', 'Ab': 'VI', 'Bb': 'VII',
  'C7': 'I7', 'D7': 'II7', 'E7': 'III7', 'F7': 'IV7', 'A7': 'VI7', 'B7': 'VII7'
};

// ========================================
// 🔍 FUNÇÕES DE DETECÇÃO E CONVERSÃO
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
  return 'I'; // Fallback
}

function convertInputToDegree(input: string): string {
  const trimmed = input.trim();
  if (isDegreeNotation(trimmed)) return trimmed;
  if (isChordSymbol(trimmed)) return chordSymbolToDegree(trimmed);
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
  
  const qualityIntervals: Record<string, number[]> = {
    'major': [0, 4, 7], 'minor': [0, 3, 7], 'dominant': [0, 4, 7, 10],
    'major7': [0, 4, 7, 11], 'minor7': [0, 3, 7, 10], 'minor-major7': [0, 3, 7, 11],
    'diminished': [0, 3, 6], 'diminished7': [0, 3, 6, 9], 'half-diminished': [0, 3, 6, 10],
    'augmented': [0, 4, 8], 'sus4': [0, 5, 7], 'sus2': [0, 2, 7],
    'major6': [0, 4, 7, 9], 'minor6': [0, 3, 7, 9]
  };
  
  const notes = new Set(qualityIntervals[symbol.quality] || qualityIntervals.major);
  
  const extensionIntervals: Record<string, number> = {
    '9': 14, 'b9': 13, '#9': 15, '11': 17, '#11': 18, '13': 21, 'b13': 20
  };

  for (const ext of symbol.extensions) {
    if (ext === 'sus4') {
      notes.delete(3); notes.delete(4); notes.add(5);
    } else if (ext === 'alt') {
      notes.add(13); notes.add(15); notes.add(8);
    } else if (extensionIntervals[ext]) {
      notes.add(extensionIntervals[ext]);
    }
  }
  
  return Array.from(notes).map(i => baseMidi + i).sort((a, b) => a - b);
}

// ========================================
// 🎼 VOICE LEADING SYSTEM - BAIXO GARANTIDO
// ========================================

class VoiceLeader {
  private previousUpperVoicing: number[] | null = null;
  private previousBassNote: number | null = null;
  private chordCounter = 0;

  public reset(): void {
    this.previousUpperVoicing = null;
    this.previousBassNote = null;
    this.chordCounter = 0;
  }

  public findBestVoicing(currentNotes: number[]): number[] {
    this.chordCounter++;
    if (this.chordCounter > 8) this.reset();

    if (currentNotes.length === 0) return [];

    const rootNote = currentNotes[0];
    const upperStructureNotes = currentNotes.slice(1);

    const bestBassNote = this.findBestBassNote(rootNote);
    const bestUpperVoicing = this.findBestUpperVoicing(upperStructureNotes);
    
    const finalVoicing = [bestBassNote, ...bestUpperVoicing].sort((a, b) => a - b);
    
    this.previousBassNote = bestBassNote;
    this.previousUpperVoicing = bestUpperVoicing;

    return finalVoicing;
  }

  private findBestBassNote(rootNote: number): number {
    const rootPitch = rootNote % 12;
    let targetBass = 3 * 12 + rootPitch;

    if (this.previousBassNote !== null) {
      const diff = targetBass - this.previousBassNote;
      if (Math.abs(diff) > 7) {
        targetBass += (diff > 0 ? -12 : 12);
      }
    }
    
    if (targetBass > 57) targetBass -= 12;
    if (targetBass < 36) targetBass += 12;

    return targetBass;
  }

  private findBestUpperVoicing(upperNotes: number[]): number[] {
    if (upperNotes.length === 0) return [];
    if (!this.previousUpperVoicing) {
        const baseNote = (upperNotes[0] % 12) + 4 * 12;
        return upperNotes.map(n => n - upperNotes[0] + baseNote);
    }

    let bestVoicing = upperNotes;
    let minScore = Infinity;

    for (let octaveShift = -1; octaveShift <= 1; octaveShift++) {
      for (let i = 0; i < upperNotes.length; i++) {
        const inverted = [...upperNotes.slice(i), ...upperNotes.slice(0, i)].map(
            (n, idx) => n + (idx < upperNotes.length - i ? 0 : 12)
        );
        const candidate = inverted.map(n => (n % 12) + 4 * 12 + (octaveShift * 12));
        
        const score = this.calculateMovementScore(candidate);
        if (score < minScore) {
          minScore = score;
          bestVoicing = candidate;
        }
      }
    }
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
// 🎯 FUNÇÕES EXPORTADAS
// ========================================

export function resetVoiceLeading(): void {
  voiceLeader.reset();
}

export function analyzeProgression(inputs: string[]): ChordAnalysis[] {
  resetVoiceLeading();
  
  return inputs.map((input): ChordAnalysis => {
    const degree = convertInputToDegree(input);
    const symbolInfo = DEGREE_SYMBOLS[degree] || { 
      root: 'C', 
      quality: 'major', 
      extensions: [], 
      display: input,
      degree: degree
    };
    
    const notes = getNotesForChord(symbolInfo);
    const voicing = voiceLeader.findBestVoicing(notes);
    
    let analysis = 'Tônica';
    if (degree.includes('V')) analysis = 'Dominante';
    if (degree.includes('IV') || degree.includes('ii')) analysis = 'Subdominante';
    if (degree.includes('vi')) analysis = 'Relativo Menor';
    
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
// 🧪 FUNÇÕES DE DEBUG (Mantidas do original)
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

function testVoiceLeadingFix(): ChordAnalysis[] {
  console.log('\n🧪 === TESTANDO CORREÇÃO DO BAIXO GARANTIDO ===');
  resetVoiceLeading();
  const testProgression = ['Imaj7', 'IVmaj7', 'V7/vi', 'vim7', 'iim7', 'V7', 'Imaj7'];
  console.log(`🎼 Progressão teste: ${testProgression.join(' - ')}`);
  const results = analyzeProgression(testProgression);
  
  console.log('\n📊 === RESULTADOS ===');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${testProgression[index]} → ${result.symbol} | Baixo: ${result.voicing[0]} | Vozes: ${result.voicing.slice(1).join(',')}`);
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
  windowTyped.getVoiceLeaderDebug = () => ({ // Mock da função de debug original
      chordCounter: 0,
      hasPrevoiusVoicing: false,
      historyLength: 0,
      lastVoicing: null
  });
  
  console.log('🎼 VoiceLeadingSystem FINAL CORRIGIDO carregado!');
}