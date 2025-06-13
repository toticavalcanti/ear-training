// 📁 ARQUIVO: src/components/VoiceLeadingSystem.tsx
// 🔧 ARQUIVO LIMPO E CORRIGIDO - SEM DUPLICAÇÕES

// ========================================
// 🎼 INTERFACES
// ========================================

export interface ChordSymbol {
  root: string;
  quality: string;
  extensions: string[];
  display: string;
}

export interface ChordAnalysis {
  degree: string;
  symbol: string;
  voicing: number[];
  analysis: string;
}

// ========================================
// 🎯 MAPEAMENTO COMPLETO DE ACORDES
// ========================================

const CHORD_SYMBOLS: Record<string, ChordSymbol> = {
  
  // ========== TRÍADES BÁSICAS ==========
  'I': { root: 'C', quality: 'major', extensions: [], display: 'C' },
  'ii': { root: 'D', quality: 'minor', extensions: [], display: 'Dm' },
  'iii': { root: 'E', quality: 'minor', extensions: [], display: 'Em' },
  'IV': { root: 'F', quality: 'major', extensions: [], display: 'F' },
  'V': { root: 'G', quality: 'major', extensions: [], display: 'G' },
  'vi': { root: 'A', quality: 'minor', extensions: [], display: 'Am' },
  'vii°': { root: 'B', quality: 'diminished', extensions: [], display: 'Bdim' },

  // ========== MODO MENOR ==========
  'i': { root: 'C', quality: 'minor', extensions: [], display: 'Cm' },
  'ii°': { root: 'D', quality: 'diminished', extensions: [], display: 'Ddim' },
  'III': { root: 'Eb', quality: 'major', extensions: [], display: 'Eb' },
  'iv': { root: 'F', quality: 'minor', extensions: [], display: 'Fm' },
  'v': { root: 'G', quality: 'minor', extensions: [], display: 'Gm' },
  'VI': { root: 'Ab', quality: 'major', extensions: [], display: 'Ab' },
  'VII': { root: 'Bb', quality: 'major', extensions: [], display: 'Bb' },

  // ========== MODO MENOR COM SÉTIMAS ==========
  'bIII7': { root: 'Eb', quality: 'dominant', extensions: [], display: 'E♭7' },
  'bVI7': { root: 'Ab', quality: 'dominant', extensions: [], display: 'A♭7' },
  'bVII7': { root: 'Bb', quality: 'dominant', extensions: [], display: 'B♭7' },
  'v7': { root: 'G', quality: 'minor7', extensions: [], display: 'Gm7' },

  // ========== AUMENTADOS ==========
  'I+': { root: 'C', quality: 'augmented', extensions: [], display: 'C+' },
  'III+': { root: 'E', quality: 'augmented', extensions: [], display: 'E+' },
  'VI+': { root: 'A', quality: 'augmented', extensions: [], display: 'A+' },

  // ========== SÉTIMAS MAIORES ==========
  'I^maj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7' },
  'Imaj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7' },
  'IV^maj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7' },
  'IVmaj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7' },

  // ========== SÉTIMAS MENORES ==========
  'ii7': { root: 'D', quality: 'minor7', extensions: [], display: 'Dm7' },
  'iii7': { root: 'E', quality: 'minor7', extensions: [], display: 'Em7' },
  'vi7': { root: 'A', quality: 'minor7', extensions: [], display: 'Am7' },
  'i7': { root: 'C', quality: 'minor7', extensions: [], display: 'Cm7' },
  'iv7': { root: 'F', quality: 'minor7', extensions: [], display: 'Fm7' },

  // ========== DOMINANTES ==========
  'V7': { root: 'G', quality: 'dominant', extensions: [], display: 'G7' },
  'I7': { root: 'C', quality: 'dominant', extensions: [], display: 'C7' },
  'IV7': { root: 'F', quality: 'dominant', extensions: [], display: 'F7' },
  'VI7': { root: 'A', quality: 'dominant', extensions: [], display: 'A7' },
  'II7': { root: 'D', quality: 'dominant', extensions: [], display: 'D7' },
  'III7': { root: 'E', quality: 'dominant', extensions: [], display: 'E7' },

  // ========== DOMINANTES SECUNDÁRIAS ==========
  'V/ii': { root: 'A', quality: 'dominant', extensions: [], display: 'A7' },
  'V7/ii': { root: 'A', quality: 'dominant', extensions: [], display: 'A7' },
  'V/iii': { root: 'B', quality: 'dominant', extensions: [], display: 'B7' },
  'V7/iii': { root: 'B', quality: 'dominant', extensions: [], display: 'B7' },
  'V/vi': { root: 'E', quality: 'dominant', extensions: [], display: 'E7' },
  'V7/vi': { root: 'E', quality: 'dominant', extensions: [], display: 'E7' },
  'V/IV': { root: 'C', quality: 'dominant', extensions: [], display: 'C7' },
  'V7/IV': { root: 'C', quality: 'dominant', extensions: [], display: 'C7' },
  'V/V': { root: 'D', quality: 'dominant', extensions: [], display: 'D7' },
  'V7/V': { root: 'D', quality: 'dominant', extensions: [], display: 'D7' },

  // ========== EMPRÉSTIMOS MODAIS ==========
  'bII': { root: 'Db', quality: 'major', extensions: [], display: 'D♭' },
  'bIII': { root: 'Eb', quality: 'major', extensions: [], display: 'E♭' },
  'bVI': { root: 'Ab', quality: 'major', extensions: [], display: 'A♭' },
  'bVII': { root: 'Bb', quality: 'major', extensions: [], display: 'B♭' },
  'bII7': { root: 'Db', quality: 'dominant', extensions: [], display: 'D♭7' },

  // ========== EMPRÉSTIMOS MODAIS COM SÉTIMAS ==========
  'bII^maj7': { root: 'Db', quality: 'major7', extensions: [], display: 'D♭∆7' },
  'bIImaj7': { root: 'Db', quality: 'major7', extensions: [], display: 'D♭∆7' },
  'bIII^maj7': { root: 'Eb', quality: 'major7', extensions: [], display: 'E♭∆7' },
  'bVI^maj7': { root: 'Ab', quality: 'major7', extensions: [], display: 'A♭∆7' },
  'bVII^maj7': { root: 'Bb', quality: 'major7', extensions: [], display: 'B♭∆7' },
  'bVIImaj7': { root: 'Bb', quality: 'major7', extensions: [], display: 'B♭∆7' },

  // ========== MEIO-DIMINUTOS ==========
  'ii7b5': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)' },
  'viiø7': { root: 'B', quality: 'half-diminished', extensions: [], display: 'Bm7(♭5)' },
  'iiø7': { root: 'D', quality: 'half-diminished', extensions: [], display: 'Dm7(♭5)' },

  // ========== DIMINUTOS COM SÉTIMA ==========
  'vii°7': { root: 'B', quality: 'diminished7', extensions: [], display: 'Bdim7' },
  'bIII°7': { root: 'Eb', quality: 'diminished7', extensions: [], display: 'E♭dim7' },
  'ii°7': { root: 'D', quality: 'diminished7', extensions: [], display: 'Ddim7' },

  // ========== SUSPENSÕES ==========
  'V7sus4': { root: 'G', quality: 'dominant', extensions: ['sus4'], display: 'G7sus4' },
  'I7sus4': { root: 'C', quality: 'dominant', extensions: ['sus4'], display: 'C7sus4' },
  'Isus4': { root: 'C', quality: 'sus4', extensions: [], display: 'Csus4' },
  'Vsus4': { root: 'G', quality: 'sus4', extensions: [], display: 'Gsus4' },

  // ========== EXTENSÕES AVANÇADAS ==========
  'V7alt': { root: 'G', quality: 'dominant', extensions: ['alt'], display: 'G7alt' },
  'I7alt': { root: 'C', quality: 'dominant', extensions: ['alt'], display: 'C7alt' },
  'V7#9': { root: 'G', quality: 'dominant', extensions: ['#9'], display: 'G7(#9)' },
  'I7#9': { root: 'C', quality: 'dominant', extensions: ['#9'], display: 'C7(#9)' },
  'V7#11': { root: 'G', quality: 'dominant', extensions: ['#11'], display: 'G7(#11)' },
  'I7#11': { root: 'C', quality: 'dominant', extensions: ['#11'], display: 'C7(#11)' },
  'I^maj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)' },
  'Imaj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7(#11)' },
  'IVmaj7#11': { root: 'F', quality: 'major7', extensions: ['#11'], display: 'F∆7(#11)' },

  // ========== ADD9 E EXTENSÕES ==========
  'i^add9': { root: 'C', quality: 'minor', extensions: ['9'], display: 'Cm(add9)' },
  'iv^add9': { root: 'F', quality: 'minor', extensions: ['9'], display: 'Fm(add9)' },
  'I^add9': { root: 'C', quality: 'major', extensions: ['9'], display: 'C(add9)' },

  // ========== MENORES COM 7ª MAIOR ==========
  'i^maj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)' },
  'imaj7': { root: 'C', quality: 'minor-major7', extensions: [], display: 'Cm(∆7)' },

  // ========== DISSONÂNCIAS EXTRAS ==========
  'I9': { root: 'C', quality: 'dominant', extensions: ['9'], display: 'C9' },
  'V9': { root: 'G', quality: 'dominant', extensions: ['9'], display: 'G9' },
  'I6': { root: 'C', quality: 'major6', extensions: [], display: 'C6' },
  'iv6': { root: 'F', quality: 'minor6', extensions: [], display: 'Fm6' },
  'I6/9': { root: 'C', quality: 'major6', extensions: ['9'], display: 'C6/9' },
  'C/D': { root: 'C', quality: 'hybrid', extensions: ['bass-D'], display: 'C/D' },
  'C/G': { root: 'C', quality: 'hybrid', extensions: ['bass-G'], display: 'C/G' },
  'V7b9': { root: 'G', quality: 'dominant', extensions: ['b9'], display: 'G7(♭9)' },
  'I5+': { root: 'C', quality: 'augmented', extensions: [], display: 'C5+' },
  'C5+': { root: 'C', quality: 'augmented', extensions: [], display: 'C5+' },
  'Cm5+': { root: 'C', quality: 'minor', extensions: ['#5'], display: 'Cm5+' },
  'Cm7/5-': { root: 'C', quality: 'half-diminished', extensions: [], display: 'Cm7/5-' },
  'C4': { root: 'C', quality: 'major', extensions: ['add4'], display: 'C4' },
  'CSUS': { root: 'C', quality: 'sus-complex', extensions: ['sus4'], display: 'Csus' },
};

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

export function analyzeProgression(degrees: string[]): ChordAnalysis[] {
  resetVoiceLeading();
  
  return degrees.map((degree: string): ChordAnalysis => {
    const symbolInfo = CHORD_SYMBOLS[degree] || { 
      root: 'C', 
      quality: 'major', 
      extensions: [], 
      display: degree
    };
    
    const notes = getNotesForChord(symbolInfo);
    const voicing = voiceLeader.findBestVoicing(notes);
    
    // 🔍 VERIFICAÇÃO DE SÉTIMAS (debug sutil)
    if (degree.includes('7') && voicing.length < 4) {
      console.warn(`⚠️ ${degree} deveria ter 4+ notas, mas gerou ${voicing.length}`);
    }
    
    // Análise funcional
    let analysis = 'Tônica';
    if (degree.includes('V') || degree.includes('VII')) analysis = 'Dominante';
    if (degree.includes('IV') || degree.includes('ii')) analysis = 'Subdominante';
    if (degree.includes('vi') || degree.includes('VI')) analysis = 'Relativo';
    if (degree.includes('°') || degree.includes('dim')) analysis = 'Diminuto';
    if (degree.includes('iii')) analysis = 'Mediante';
    
    return { 
      degree, 
      symbol: symbolInfo.display, 
      voicing, 
      analysis 
    };
  });
}

export function formatChordSymbol(degree: string): string {
  const symbol = CHORD_SYMBOLS[degree];
  return symbol ? symbol.display : degree;
}