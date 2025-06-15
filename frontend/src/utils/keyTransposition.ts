// src/utils/keyTransposition.ts - SOLUÇÃO DEFINITIVA

interface ChordProgression {
  _id: string;
  name: string;
  degrees: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'pop' | 'jazz' | 'classical' | 'bossa' | 'modal' | 'funk' | 'rock' | 'samba' | 'mpb' | 'blues';
  mode: 'major' | 'minor';
  timeSignature: string;
  tempo: number;
  description: string;
  reference?: string;
  isActive: boolean;
}

interface TransposedChordProgression extends ChordProgression {
  chords: string[];
}

interface TransposedExerciseData {
  randomKey: string;
  transposedOptions: TransposedChordProgression[];
  semitoneOffset: number;
}

class DefinitiveTransposer {
  private chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private chromaticFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  private keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Mapeamento MATEMÁTICO dos numerais romanos base
  private romanNumerals: Record<string, number> = {
    'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11,
    'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11
  };

  getRandomKey(): string {
    return this.keys[Math.floor(Math.random() * this.keys.length)];
  }

  getSemitoneDistance(fromKey: string, toKey: string): number {
    const fromIndex = this.keys.indexOf(fromKey);
    const toIndex = this.keys.indexOf(toKey);
    return fromIndex !== -1 && toIndex !== -1 ? (toIndex - fromIndex + 12) % 12 : 0;
  }

  // PARSER MATEMÁTICO INTELIGENTE
  private parseRomanDegree(degree: string): { interval: number; quality: string } {
    console.log(`🧮 Analisando matematicamente: "${degree}"`);

    // Regex para capturar: acidentes + numeral + extensões
    const match = degree.match(/^(b*|#*)([IVX]+|[iv]+)(.*)$/);
    
    if (!match) {
      console.warn(`⚠️ Não é grau romano: "${degree}"`);
      return { interval: 0, quality: this.extractQuality(degree) };
    }

    const [, accidentals, numeral, extensions] = match;
    
    // Obter intervalo base do numeral
    const baseInterval = this.romanNumerals[numeral];
    if (baseInterval === undefined) {
      console.warn(`⚠️ Numeral desconhecido: "${numeral}"`);
      return { interval: 0, quality: this.extractQuality(degree) };
    }

    // Aplicar acidentes matematicamente
    const flats = (accidentals.match(/b/g) || []).length;
    const sharps = (accidentals.match(/#/g) || []).length;
    
    const finalInterval = (baseInterval - flats + sharps + 12) % 12;
    
    console.log(`📊 ${numeral} (${baseInterval}) ${accidentals} → ${finalInterval}`);

    // Extrair qualidade das extensões
    const quality = this.extractQuality(numeral + extensions);
    
    return { interval: finalInterval, quality };
  }

  // EXTRATOR DE QUALIDADE INTELIGENTE
  private extractQuality(input: string): string {
    const lower = input.toLowerCase();
    
    // Ordem específica é crucial!
    if (lower.includes('dim7') || lower.includes('°7')) return 'dim7';
    if (lower.includes('dim') || lower.includes('°')) return 'dim';
    if (lower.includes('ø7') || lower.includes('m7b5') || lower.includes('m7♭5') || lower.includes('7b5')) return 'm7♭5';
    if (lower.includes('maj7') || lower.includes('∆7') || lower.includes('^7')) return 'maj7';
    if (lower.includes('alt')) return '7alt';
    if (lower.includes('sus4')) return 'sus4';
    if (lower.includes('sus2')) return 'sus2';
    if (lower.includes('add9')) return '(add9)';
    if (lower.includes('6/9')) return '6/9';
    if (lower.includes('6')) return '6';
    if (lower.includes('+')) return '+';
    if (lower.includes('9')) return '9';
    if (lower.includes('11')) return '11';
    if (lower.includes('13')) return '13';
    if (lower.includes('7')) return '7';
    
    // Determinar maior/menor pelo case do numeral romano
    const romanMatch = input.match(/([IVX]+|[iv]+)/);
    if (romanMatch) {
      const isLowerCase = /^[a-z]/.test(romanMatch[1]);
      return isLowerCase ? 'm' : '';
    }
    
    return '';
  }

  // TRANSPOSIÇÃO MATEMÁTICA PRINCIPAL
  transposeChord(degree: string, targetKey: string): string {
    console.log(`\n🎯 TRANSPONDO: "${degree}" → ${targetKey}`);

    const { interval, quality } = this.parseRomanDegree(degree);

    // Encontrar índice da tonalidade alvo
    const keyIndex = this.keys.indexOf(targetKey);
    if (keyIndex === -1) {
      console.error(`❌ Tonalidade inválida: ${targetKey}`);
      return degree;
    }

    // Calcular índice da nota do acorde
    const chordIndex = (keyIndex + interval) % 12;

    // Escolher notação (bemol para tonalidades com bemol)
    const useFlats = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'].includes(targetKey);
    const chordRoot = useFlats ? this.chromaticFlat[chordIndex] : this.chromaticSharp[chordIndex];

    const result = chordRoot + quality;
    
    console.log(`✅ RESULTADO: "${degree}" → "${result}"`);
    return result;
  }

  transposeProgression(degrees: string[], targetKey: string): string[] {
    console.log(`\n🎼 === TRANSPOSIÇÃO PARA ${targetKey} ===`);
    console.log(`📝 Input: ${degrees.join(' | ')}`);

    const chords = degrees.map((degree, index) => {
      console.log(`\n[${index + 1}/${degrees.length}]`);
      return this.transposeChord(degree, targetKey);
    });

    console.log(`\n🎵 Output: ${chords.join(' - ')}`);
    console.log(`✅ TRANSPOSIÇÃO MATEMÁTICA CONCLUÍDA!\n`);

    return chords;
  }
}

const keyTransposer = new DefinitiveTransposer();

export function createRandomizedExercise(
  correctProgression: ChordProgression,
  allProgressionOptions: ChordProgression[]
): TransposedExerciseData {
  
  const randomKey = keyTransposer.getRandomKey();
  
  console.log(`\n🎲 === EXERCÍCIO RANDOMIZADO ===`);
  console.log(`🔑 Tonalidade: ${randomKey}`);
  console.log(`🎯 Progressão: ${correctProgression.name}`);
  console.log(`📊 Total opções: ${allProgressionOptions.length}`);

  const transposedOptions: TransposedChordProgression[] = allProgressionOptions.map((option, index) => {
    console.log(`\n--- TRANSPONDO ${index + 1}: "${option.name}" ---`);
    
    const chords = keyTransposer.transposeProgression(option.degrees, randomKey);
    
    console.log(`📋 "${option.name}": ${option.degrees.join(' | ')} → ${chords.join(' | ')}`);
    
    return {
      ...option,
      chords // Esta propriedade contém os ACORDES transpostos
    };
  });

  const semitoneOffset = keyTransposer.getSemitoneDistance('C', randomKey);

  console.log(`\n🎹 Offset MIDI: +${semitoneOffset} semitons`);
  console.log(`🏁 EXERCÍCIO MATEMÁTICO CRIADO!\n`);

  return {
    randomKey,
    transposedOptions,
    semitoneOffset
  };
}

export { keyTransposer };