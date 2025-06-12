// src/components/VoiceLeadingSystem.ts
// Este arquivo contém apenas a lógica pura de teoria musical, sem componentes React.

// Tipos para cifras padronizadas (estilo Real Book)
export interface ChordSymbol {
  root: string;
  quality: string;
  extensions: string[];
  bass?: string;
  display: string; // Como mostrar (ex: "Cm7", "F∆7", "G7alt")
}

// Tipo para a análise de cada acorde da progressão
export interface ChordAnalysis {
  degree: string;
  symbol: string;
  voicing: number[];
  analysis: string;
}

// Mapeamento de graus para cifras reais (em C)
const CHORD_SYMBOLS: Record<string, ChordSymbol> = {
  // === MAIOR ===
  'I': { root: 'C', quality: 'major', extensions: [], display: 'C' },
  'I^maj7': { root: 'C', quality: 'major7', extensions: [], display: 'C∆7' },
  'I^maj9': { root: 'C', quality: 'major7', extensions: ['9'], display: 'C∆9' },
  'I^maj7#11': { root: 'C', quality: 'major7', extensions: ['#11'], display: 'C∆7#11' },
  'I^add9': { root: 'C', quality: 'major', extensions: ['add9'], display: 'Cadd9' },

  // === MENORES ===
  'ii': { root: 'D', quality: 'minor', extensions: [], display: 'Dm' },
  'ii7': { root: 'D', quality: 'minor7', extensions: [], display: 'Dm7' },
  'ii7b5': { root: 'D', quality: 'minor7b5', extensions: [], display: 'Dm7♭5' },
  'ii9': { root: 'D', quality: 'minor7', extensions: ['9'], display: 'Dm9' },

  'iii': { root: 'E', quality: 'minor', extensions: [], display: 'Em' },
  'iii7': { root: 'E', quality: 'minor7', extensions: [], display: 'Em7' },

  'vi': { root: 'A', quality: 'minor', extensions: [], display: 'Am' },
  'vi7': { root: 'A', quality: 'minor7', extensions: [], display: 'Am7' },
  'vi^add9': { root: 'A', quality: 'minor', extensions: ['add9'], display: 'Amadd9' },

  // === DOMINANTES ===
  'V': { root: 'G', quality: 'major', extensions: [], display: 'G' },
  'V7': { root: 'G', quality: 'dominant7', extensions: [], display: 'G7' },
  'V7sus4': { root: 'G', quality: 'dominant7sus4', extensions: [], display: 'G7sus4' },
  'V7alt': { root: 'G', quality: 'dominant7', extensions: ['alt'], display: 'G7alt' },
  'V7#9': { root: 'G', quality: 'dominant7', extensions: ['#9'], display: 'G7#9' },
  'V7#11': { root: 'G', quality: 'dominant7', extensions: ['#11'], display: 'G7#11' },

  // === SUBDOMINANTES ===
  'IV': { root: 'F', quality: 'major', extensions: [], display: 'F' },
  'IV^maj7': { root: 'F', quality: 'major7', extensions: [], display: 'F∆7' },
  'iv': { root: 'F', quality: 'minor', extensions: [], display: 'Fm' },
  'iv7': { root: 'F', quality: 'minor7', extensions: [], display: 'Fm7' },
  'iv^add9': { root: 'F', quality: 'minor', extensions: ['add9'], display: 'Fmadd9' },

  // === ACORDES EMPRESTADOS ===
  'bVII': { root: 'B♭', quality: 'major', extensions: [], display: 'B♭' },
  'bVII^maj7': { root: 'B♭', quality: 'major7', extensions: [], display: 'B♭∆7' },
  'bVI': { root: 'A♭', quality: 'major', extensions: [], display: 'A♭' },
  'bVI^maj7': { root: 'A♭', quality: 'major7', extensions: [], display: 'A♭∆7' },
  'bIII': { root: 'E♭', quality: 'major', extensions: [], display: 'E♭' },
  'bII': { root: 'D♭', quality: 'major', extensions: [], display: 'D♭' },
  'bII^maj7': { root: 'D♭', quality: 'major7', extensions: [], display: 'D♭∆7' },

  // === DOMINANTES SECUNDÁRIAS ===
  'VI7': { root: 'A', quality: 'dominant7', extensions: [], display: 'A7' },
  'III7': { root: 'E', quality: 'dominant7', extensions: [], display: 'E7' },
  'bII7': { root: 'D♭', quality: 'dominant7', extensions: [], display: 'D♭7' }, // tritone sub

  // === DIMINUTOS ===
  'vii°': { root: 'B', quality: 'diminished', extensions: [], display: 'B°' },
  'vii°7': { root: 'B', quality: 'diminished7', extensions: [], display: 'B°7' },
  'bIII°7': { root: 'E♭', quality: 'diminished7', extensions: [], display: 'E♭°7' },

  // === MENOR NATURAL ===
  'i': { root: 'C', quality: 'minor', extensions: [], display: 'Cm' },
  'i7': { root: 'C', quality: 'minor7', extensions: [], display: 'Cm7' },
  'i^maj7': { root: 'C', quality: 'minorMaj7', extensions: [], display: 'Cm∆7' },
  'i^add9': { root: 'C', quality: 'minor', extensions: ['add9'], display: 'Cmadd9' }
};

// Voice leading inteligente
class VoiceLeader {
  private previousVoicing: number[] = [60, 64, 67]; // C major position

  // Voicings otimizados para cada tipo de acorde
  private getVoicings(chordSymbol: ChordSymbol): number[][] {
    const voicings: Record<string, number[][]> = {
      // Mapeamento de voicings... (o seu código original está ótimo aqui)
      // === TRÍADES MAIORES ===
      'C': [[48, 60, 64, 67], [48, 64, 67, 72], [48, 67, 72, 76]],
      'F': [[53, 65, 69, 72], [53, 69, 72, 77], [53, 72, 77, 81]],
      'G': [[55, 67, 71, 74], [55, 71, 74, 79], [55, 74, 79, 83]],
      // === ACORDES DE SÉTIMA MAIOR ===
      'C∆7': [[48, 60, 64, 67, 71], [48, 64, 71, 72, 76], [48, 67, 71, 72, 76]],
      'F∆7': [[53, 65, 69, 72, 76], [53, 69, 76, 77, 81], [53, 72, 76, 77, 81]],
      // === ACORDES MENORES ===
      'Dm': [[50, 62, 65, 69], [50, 65, 69, 74], [50, 69, 74, 77]],
      'Dm7': [[50, 62, 65, 69, 72], [50, 65, 72, 74, 77], [50, 69, 72, 74, 77]],
      'Am': [[57, 69, 72, 76], [57, 72, 76, 81], [57, 76, 81, 84]],
      'Am7': [[57, 69, 72, 76, 79], [57, 72, 79, 81, 84], [57, 76, 79, 81, 84]],
      // === DOMINANTES ===
      'G7': [[55, 67, 71, 74, 77], [55, 71, 77, 79, 83], [55, 74, 77, 79, 83]],
      'G7sus4': [[55, 67, 72, 74, 77], [55, 72, 77, 79, 84]],
      'G7alt': [[55, 71, 75, 77, 81], [55, 75, 81, 83, 87]]
    };

    const result = voicings[chordSymbol.display];
    if (!result || !Array.isArray(result) || result.length === 0) {
      // Fallback para acordes não mapeados
      return [[48, 60, 64, 67]];
    }
    return result;
  }

  // Escolher melhor voicing baseado na condução de vozes
  public getBestVoicing(chordSymbol: ChordSymbol): number[] {
    const availableVoicings = this.getVoicings(chordSymbol);

    if (availableVoicings.length === 0) {
      return [48, 60, 64, 67]; // fallback
    }

    let bestVoicing = availableVoicings[0];
    let smallestMovement = Infinity;

    // Calcular menor movimento das vozes superiores (ignora o baixo)
    for (const voicing of availableVoicings) {
      if (!Array.isArray(voicing) || voicing.length === 0) continue;

      const upperVoices = voicing.slice(1); // Ignora o baixo
      const prevUpperVoices = this.previousVoicing.slice(1);

      let totalMovement = 0;
      const minLength = Math.min(upperVoices.length, prevUpperVoices.length);

      for (let i = 0; i < minLength; i++) {
        const current = upperVoices[i];
        const previous = prevUpperVoices[i];
        if (typeof current === 'number' && typeof previous === 'number') {
          totalMovement += Math.abs(current - previous);
        }
      }

      if (totalMovement < smallestMovement) {
        smallestMovement = totalMovement;
        bestVoicing = voicing;
      }
    }

    this.previousVoicing = bestVoicing;
    return bestVoicing;
  }

  // Reset para nova progressão
  public reset() {
    this.previousVoicing = [48, 60, 64, 67]; // C major com baixo
  }
}

// Instância global do voice leader
const voiceLeader = new VoiceLeader();

// Função para converter grau em cifra formatada
export function formatChordSymbol(degree: string): string {
  if (typeof degree !== 'string') {
    console.warn('Grau inválido para formatChordSymbol:', degree);
    return 'C';
  }

  const symbol = CHORD_SYMBOLS[degree];
  if (!symbol || !symbol.display) {
    console.warn('Símbolo não encontrado para:', degree);
    return degree;
  }

  return symbol.display;
}

// Função para obter voicing otimizado
export function getOptimizedVoicing(degree: string): number[] {
  if (typeof degree !== 'string') {
    console.warn('Grau inválido para getOptimizedVoicing:', degree);
    return [48, 60, 64, 67];
  }

  const symbol = CHORD_SYMBOLS[degree];
  if (!symbol) {
    console.warn('Voicing não encontrado para:', degree);
    return [48, 60, 64, 67];
  }

  return voiceLeader.getBestVoicing(symbol);
}

// Resetar voice leading para nova progressão
export function resetVoiceLeading() {
  voiceLeader.reset();
}

// Função para analisar progressão e gerar cifras bonitas
export function analyzeProgression(degrees: string[]): ChordAnalysis[] {
  resetVoiceLeading();

  return degrees.map((degree): ChordAnalysis => {
    if (typeof degree !== 'string') {
      console.warn('Grau inválido:', degree);
      return { degree: 'I', symbol: 'C', voicing: [48, 60, 64, 67], analysis: 'Desconhecido' };
    }

    const symbol = formatChordSymbol(degree);
    const voicing = getOptimizedVoicing(degree);

    let analysis = 'Outros';
    if (degree.includes('V7') || degree.includes('V')) {
      analysis = 'Dominante';
    } else if (degree.includes('ii') || degree.includes('II')) {
      analysis = 'Predominante';
    } else if (degree.startsWith('I') || degree.startsWith('i')) {
      analysis = 'Tônica';
    } else if (degree.includes('vi') || degree.includes('VI')) {
      analysis = 'Relativo menor';
    } else if (degree.includes('IV') || degree.includes('iv')) {
      analysis = 'Subdominante';
    }

    return { degree, symbol, voicing, analysis };
  });
}