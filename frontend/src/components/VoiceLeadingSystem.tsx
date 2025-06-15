// 📁 ARQUIVO: src/components/VoiceLeadingSystem.tsx
// 🔧 VERSÃO CORRIGIDA - SEM MISTURA DE CIFRAS E GRAUS

// ========================================
// 🎼 INTERFACES
// ========================================

export interface ChordSymbol {
  root: string;
  quality: string;
  extensions: string[];
  display: string;
  degree?: string; // Grau harmônico correspondente
}

export interface ChordAnalysis {
  degree: string;
  symbol: string;
  voicing: number[];
  analysis: string;
}

// ========================================
// 🎯 MAPEAMENTO DE GRAUS HARMÔNICOS
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

  // ========== SÉTIMAS MAIORES ==========
  'I^maj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7', degree: 'I^maj7' },
  'Imaj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7', degree: 'Imaj7' },
  'IV^maj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7', degree: 'IV^maj7' },
  'IVmaj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7', degree: 'IVmaj7' },

  // ========== SÉTIMAS MENORES ==========
  'ii7': { root: 'D', quality: 'minor7', extensions: [], display: 'Dm7', degree: 'ii7' },
  'iii7': { root: 'E', quality: 'minor7', extensions: [], display: 'Em7', degree: 'iii7' },
  'vi7': { root: 'A', quality: 'minor7', extensions: [], display: 'Am7', degree: 'vi7' },
  'i7': { root: 'C', quality: 'minor7', extensions: [], display: 'Cm7', degree: 'i7' },
  'iv7': { root: 'F', quality: 'minor7', extensions: [], display: 'Fm7', degree: 'iv7' },

  // ========== DOMINANTES ==========
  'V7': { root: 'G', quality: 'dominant', extensions: [], display: 'G7', degree: 'V7' },
  'I7': { root: 'C', quality: 'dominant', extensions: [], display: 'C7', degree: 'I7' },
  'IV7': { root: 'F', quality: 'dominant', extensions: [], display: 'F7', degree: 'IV7' },
  'VI7': { root: 'A', quality: 'dominant', extensions: [], display: 'A7', degree: 'VI7' },
  'II7': { root: 'D', quality: 'dominant', extensions: [], display: 'D7', degree: 'II7' },
  'III7': { root: 'E', quality: 'dominant', extensions: [], display: 'E7', degree: 'III7' },

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

  // ========== MEIO-DIMINUTOS ==========
  'ii7b5': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)', degree: 'ii7b5' },
  'viiø7': { root: 'B', quality: 'half-diminished', extensions: [], display: 'Bm7(♭5)', degree: 'viiø7' },
  'iiø7': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)', degree: 'iiø7' },

  // ========== DIMINUTOS COM SÉTIMA ==========
  'vii°7': { root: 'B', quality: 'diminished7', extensions: [], display: 'Bdim7', degree: 'vii°7' },
  'ii°7': { root: 'D', quality: 'diminished7', extensions: [], display: 'Ddim7', degree: 'ii°7' },

  // ========== SUSPENSÕES ==========
  'V7sus4': { root: 'G', quality: 'dominant', extensions: ['sus4'], display: 'G7sus4', degree: 'V7sus4' },
  'I7sus4': { root: 'C', quality: 'dominant', extensions: ['sus4'], display: 'C7sus4', degree: 'I7sus4' },
  'Isus4': { root: 'C', quality: 'sus4', extensions: [], display: 'Csus4', degree: 'Isus4' },
  'Vsus4': { root: 'G', quality: 'sus4', extensions: [], display: 'Gsus4', degree: 'Vsus4' },

  // ========== EXTENSÕES AVANÇADAS ==========
  'V7alt': { root: 'G', quality: 'dominant', extensions: ['alt'], display: 'G7alt', degree: 'V7alt' },
  'V7#9': { root: 'G', quality: 'dominant', extensions: ['#9'], display: 'G7(#9)', degree: 'V7#9' },
  'V7#11': { root: 'G', quality: 'dominant', extensions: ['#11'], display: 'G7(#11)', degree: 'V7#11' },
  'I^maj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)', degree: 'I^maj7#11' },
  'Imaj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)', degree: 'Imaj7#11' },

  // ========== MENORES COM 7ª MAIOR ==========
  'i^maj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)', degree: 'i^maj7' },
  'imaj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)', degree: 'imaj7' },
};

// ========================================
// 🎵 MAPEAMENTO DE CIFRAS PARA GRAUS
// ========================================

const CHORD_TO_DEGREE_MAP: Record<string, string> = {
  // Em Dó Maior - Tríades e Tétrades
  'C': 'I', 'Cmaj': 'I', 'Cmaj7': 'I^maj7', 'C∆7': 'I^maj7', 'CMaj7': 'I^maj7',
  'Dm': 'ii', 'Dm7': 'ii7',
  'Em': 'iii', 'Em7': 'iii7', 'Em7b5': 'iiø7', 'Em7(b5)': 'iiø7',
  'F': 'IV', 'Fmaj': 'IV', 'Fmaj7': 'IV^maj7', 'F∆7': 'IV^maj7', 'FMaj7': 'IV^maj7',
  'G': 'V', 'G7': 'V7', 'Gm': 'v', 'Gm7': 'v7',
  'Am': 'vi', 'Am7': 'vi7',
  'Bdim': 'vii°', 'Bm7b5': 'viiø7', 'Bm7(b5)': 'viiø7',
  
  // Em Dó Menor
  'Cm': 'i', 'Cm7': 'i7', 'Cm(maj7)': 'i^maj7', 'Cm(∆7)': 'i^maj7',
  'Ddim': 'ii°', 'Dm7b5': 'iiø7', 'Dm7(b5)': 'iiø7',
  'Eb': 'III', 'EbMaj7': 'bIII^maj7', 'Eb7': 'bIII7',
  'Fm': 'iv', 'Fm7': 'iv7',
  'Ab': 'VI', 'AbMaj7': 'bVI^maj7', 'Ab7': 'bVI7',
  'Bb': 'VII', 'BbMaj7': 'bVII^maj7', 'Bb7': 'bVII7',
  
  // Empréstimos modais
  'Db': 'bII', 'Db7': 'bII7', 'DbMaj7': 'bII^maj7',
  
  // Dominantes (contexto determina se são diatônicos ou secundários)
  'C7': 'I7',     // Por padrão I7, mas pode ser V7/IV dependendo do contexto
  'D7': 'II7',    // Por padrão II7, mas pode ser V7/V dependendo do contexto  
  'E7': 'III7',   // Por padrão III7, mas pode ser V7/vi dependendo do contexto
  'F7': 'IV7',
  'A7': 'VI7',    // Por padrão VI7, mas pode ser V7/ii dependendo do contexto
  'B7': 'VII7',   // Por padrão VII7, mas pode ser V7/iii dependendo do contexto
};

// ========================================
// 🔍 FUNÇÕES DE DETECÇÃO E CONVERSÃO
// ========================================

function isDegreeNotation(input: string): boolean {
  // Detecta se é grau (contém números romanos ou simbolos específicos)
  const degreePattern = /^(b?[IVX]+|[iv]+|vii°|iiø|°|ø|\^maj|maj|sus|alt|add|#|b|\d+|\/)/;
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
    return baseDegree.toLowerCase(); // Menor
  }
  
  if (chordSymbol.includes('7')) {
    return baseDegree + '7';
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
// 🎼 VOICE LEADING SYSTEM
// ========================================

class VoiceLeader {
  private previousVoicing: number[] | null = null;
  private readonly idealCenter = 60; // C4
  private readonly minSpread = 48;   // C3
  private readonly maxSpread = 84;   // C6

  public findBestVoicing(currentNotes: number[]): number[] {
    if (!this.previousVoicing) {
      const voicing = this.distributeVoices(currentNotes);
      this.previousVoicing = voicing;
      return voicing;
    }

    let bestVoicing = currentNotes;
    let minScore = Infinity;

    // Testa diferentes inversões e oitavas
    for (let octaveShift = -2; octaveShift <= 2; octaveShift++) {
      for (let inversion = 0; inversion < currentNotes.length; inversion++) {
        const candidate = this.createVoicing(currentNotes, inversion, octaveShift);
        
        if (this.isWithinRange(candidate)) {
          const score = this.calculateVoicingScore(candidate);
          if (score < minScore) {
            minScore = score;
            bestVoicing = candidate;
          }
        }
      }
    }

    this.previousVoicing = bestVoicing;
    return bestVoicing;
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
    
    return movement + (spread * 0.3) + (centerDistance * 0.2);
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

  public reset() {
    this.previousVoicing = null;
  }
}

const voiceLeader = new VoiceLeader();

// ========================================
// 🎯 FUNÇÕES EXPORTADAS
// ========================================

export function resetVoiceLeading() {
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

export function testConversion() {
  const testCases = [
    // Graus (devem passar direto)
    'I', 'ii7', 'V7', 'vi', 'iii7', 'IV^maj7',
    // Cifras (devem ser convertidas)
    'C', 'Dm7', 'G7', 'Am', 'Em7', 'FMaj7',
    // Casos complexos
    'V7/ii', 'A7', 'bVII', 'Bb', 'C7sus4'
  ];
  
  console.log('🧪 === TESTE DE CONVERSÃO ===');
  testCases.forEach(test => {
    const degree = convertInputToDegree(test);
    const symbol = DEGREE_SYMBOLS[degree];
    console.log(`📝 "${test}" → "${degree}" → "${symbol?.display || 'N/A'}"`);
  });
}

// Executar teste automaticamente em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // testConversion();
}