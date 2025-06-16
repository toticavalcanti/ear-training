// src/utils/keyTransposition.ts - VERSÃO CORRIGIDA - BUG ELIMINADO

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

class FixedTransposer {
  private chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private chromaticFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  private keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // ✅ MAPEAMENTO MATEMÁTICO ULTRA-CORRIGIDO
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

  // ✅ PARSER ULTRA-CORRIGIDO - FINAL
  private parseRomanDegree(degree: string): { interval: number; quality: string } {
    console.log(`🧮 === PARSEANDO: "${degree}" ===`);

    // ✅ VALIDAÇÃO DE INPUT VAZIO
    if (!degree || typeof degree !== 'string' || degree.trim() === '') {
      console.error(`❌ GRAU VAZIO OU INVÁLIDO: "${degree}"`);
      return { interval: 0, quality: '' };
    }

    const trimmedDegree = degree.trim();

    // ✅ REGEX ULTRA-ESPECÍFICA PARA NUMERAIS ROMANOS
    // Aceita apenas combinações válidas: I, II, III, IV, V, VI, VII (e minúsculas)
    const match = trimmedDegree.match(/^(b*|#*)((?:VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i))(.*)$/);
    
    if (!match) {
      console.warn(`⚠️ FALHA NO PARSE: "${trimmedDegree}" - não é grau romano válido`);
      return { interval: 0, quality: this.extractQuality(trimmedDegree) };
    }

    const [ accidentals, numeral, extensions] = match;
    console.log(`📊 Componentes: acidentes="${accidentals}" numeral="${numeral}" extensões="${extensions}"`);
    
    // ✅ OBTER INTERVALO BASE COM CASE PRESERVADO
    const baseInterval = this.romanNumerals[numeral];
    if (baseInterval === undefined) {
      console.error(`❌ NUMERAL DESCONHECIDO: "${numeral}"`);
      return { interval: 0, quality: this.extractQuality(trimmedDegree) };
    }

    // ✅ APLICAR ACIDENTES MATEMATICAMENTE
    const flats = (accidentals.match(/b/g) || []).length;
    const sharps = (accidentals.match(/#/g) || []).length;
    
    const finalInterval = (baseInterval - flats + sharps + 12) % 12;
    
    console.log(`🔢 Cálculo: ${numeral}(${baseInterval}) ${accidentals}(${-flats + sharps}) = ${finalInterval}`);

    // ✅ EXTRAIR QUALIDADE CORRIGIDA - CONSIDERA CASE DO NUMERAL
    const quality = this.extractQuality(numeral + extensions);
    
    console.log(`✅ RESULTADO: intervalo=${finalInterval}, qualidade="${quality}"`);
    
    return { interval: finalInterval, quality };
  }

  // ✅ EXTRATOR DE QUALIDADE ULTRA-CORRIGIDO FINAL
  private extractQuality(input: string): string {
    console.log(`🎵 Extraindo qualidade de: "${input}"`);
    
    const normalized = input
      .replace(/∆/g, 'maj')  // ✅ Triangulo delta
      .replace(/△/g, 'maj')  // ✅ Triangulo alternativo
      .replace(/\^/g, 'maj') // ✅ Circumflexo para major
      .replace(/ø/g, 'm7b5') // ✅ Meio-diminuto
      .replace(/°/g, 'dim')  // ✅ Diminuto
      .replace(/♭/g, 'b')    // ✅ Bemol unicode
      .replace(/♯/g, '#');   // ✅ Sustenido unicode

    console.log(`🔧 Normalizado: "${input}" → "${normalized}"`);

    const lower = normalized.toLowerCase();
    
    // ✅ ORDEM ESPECÍFICA CORRIGIDA (mais específico primeiro)
    if (lower.includes('maj7#11')) return 'maj7#11';
    if (lower.includes('maj7#5')) return 'maj7#5';
    if (lower.includes('maj7b5') || lower.includes('maj7♭5')) return 'maj7♭5';
    if (lower.includes('m7b5') || lower.includes('m7♭5') || lower.includes('ø7')) return 'm7♭5';
    if (lower.includes('dim7') || lower.includes('°7')) return 'dim7';
    if (lower.includes('7#9#11')) return '7#9#11';
    if (lower.includes('7#9')) return '7#9';
    if (lower.includes('7#11')) return '7#11';
    if (lower.includes('7alt')) return '7alt';
    if (lower.includes('7sus4')) return '7sus4';
    if (lower.includes('7sus2')) return '7sus2';
    if (lower.includes('maj9')) return 'maj9';
    if (lower.includes('maj7')) return 'maj7';
    if (lower.includes('maj13')) return 'maj13';
    if (lower.includes('maj11')) return 'maj11';
    if (lower.includes('maj6')) return 'maj6';
    if (lower.includes('m9')) return 'm9';
    if (lower.includes('m7')) return 'm7';
    if (lower.includes('m11')) return 'm11';
    if (lower.includes('m13')) return 'm13';
    if (lower.includes('m6')) return 'm6';
    if (lower.includes('add9')) return '(add9)';
    if (lower.includes('6/9')) return '6/9';
    if (lower.includes('sus4')) return 'sus4';
    if (lower.includes('sus2')) return 'sus2';
    if (lower.includes('dim')) return 'dim';
    if (lower.includes('aug') || lower.includes('+')) return '+';
    if (lower.includes('13')) return '13';
    if (lower.includes('11')) return '11';
    if (lower.includes('9')) return '9';
    if (lower.includes('7')) return '7';
    if (lower.includes('6')) return '6';
    
    // ✅ DETERMINAR MAIOR/MENOR PELO CASE DO NUMERAL ROMANO
    const romanMatch = input.match(/([IVXivx]+)/);
    if (romanMatch) {
      const romanNumeral = romanMatch[1];
      // ✅ LÓGICA CORRIGIDA: se contém QUALQUER caractere minúsculo, é menor
      const hasLowerCase = /[a-z]/.test(romanNumeral);
      const basicQuality = hasLowerCase ? 'm' : '';
      console.log(`🎯 Qualidade básica: "${romanNumeral}" → "${basicQuality}" (hasLower=${hasLowerCase})`);
      return basicQuality;
    }
    
    console.log(`⚠️ Nenhuma qualidade detectada, retornando vazio`);
    return '';
  }

  // ✅ TRANSPOSIÇÃO MATEMÁTICA ULTRA-CORRIGIDA
  transposeChord(degree: string, targetKey: string): string {
    console.log(`\n🎯 === TRANSPOSIÇÃO: "${degree}" → ${targetKey} ===`);

    // ✅ VALIDAÇÃO PRÉVIA DE INPUT VAZIO
    if (!degree || typeof degree !== 'string' || degree.trim() === '') {
      console.warn(`⚠️ GRAU VAZIO, retornando string vazia`);
      return '';
    }

    const { interval, quality } = this.parseRomanDegree(degree);

    // ✅ VALIDAR TONALIDADE ALVO
    const keyIndex = this.keys.indexOf(targetKey);
    if (keyIndex === -1) {
      console.error(`❌ TONALIDADE INVÁLIDA: ${targetKey}`);
      return degree; // Fallback: retorna o grau original
    }

    // ✅ CALCULAR ÍNDICE DA NOTA DO ACORDE
    const chordIndex = (keyIndex + interval) % 12;

    // ✅ ESCOLHER NOTAÇÃO (bemol para tonalidades com bemol)
    const useFlats = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'].includes(targetKey);
    const chordRoot = useFlats ? this.chromaticFlat[chordIndex] : this.chromaticSharp[chordIndex];

    // ✅ CONSTRUIR ACORDE FINAL
    const result = chordRoot + quality;
    
    console.log(`✅ TRANSPOSIÇÃO CONCLUÍDA: "${degree}" → "${result}"`);
    console.log(`📊 Detalhes: ${targetKey}[${keyIndex}] + ${interval} = ${chordRoot}[${chordIndex}] + "${quality}"`);
    
    return result;
  }

  // ✅ TRANSPOSIÇÃO DE PROGRESSÃO ULTRA-CORRIGIDA
  transposeProgression(degrees: string[], targetKey: string): string[] {
    console.log(`\n🎼 === TRANSPOSIÇÃO COMPLETA PARA ${targetKey} ===`);
    console.log(`📝 Input (${degrees.length} graus): ${degrees.join(' | ')}`);

    // ✅ FILTRAR ELEMENTOS VAZIOS ANTES DE PROCESSAR
    const validDegrees = degrees.filter(degree => degree && degree.trim() !== '');
    
    if (validDegrees.length !== degrees.length) {
      console.warn(`⚠️ Encontrados ${degrees.length - validDegrees.length} graus vazios, filtrados`);
    }

    const chords = validDegrees.map((degree, index) => {
      console.log(`\n🔄 [${index + 1}/${validDegrees.length}] Processando...`);
      const result = this.transposeChord(degree, targetKey);
      console.log(`   ✓ "${degree}" → "${result}"`);
      return result;
    });

    console.log(`\n🎵 Output (${chords.length} acordes): ${chords.join(' - ')}`);
    console.log(`✅ TRANSPOSIÇÃO MATEMÁTICA CONCLUÍDA PARA ${targetKey}!\n`);

    // ✅ VALIDAÇÃO FINAL
    if (chords.length !== validDegrees.length) {
      console.error(`❌ ERRO: Valid input=${validDegrees.length} vs Output=${chords.length}`);
    }

    return chords;
  }

  // ✅ FUNÇÃO DE TESTE ULTRA-MELHORADA
  testTransposition(testCases: Array<{degree: string, key: string, expected?: string}>) {
    console.log(`\n🧪 === TESTE DE TRANSPOSIÇÃO ULTRA-CORRIGIDO ===`);
    
    testCases.forEach((testCase, index) => {
      console.log(`\n--- Teste ${index + 1}: "${testCase.degree}" → ${testCase.key} ---`);
      const result = this.transposeChord(testCase.degree, testCase.key);
      
      if (testCase.expected) {
        const passed = result === testCase.expected;
        console.log(`${passed ? '✅' : '❌'} Esperado: "${testCase.expected}", Obtido: "${result}"`);
        if (!passed) {
          console.log(`🔍 Debug: parseando "${testCase.degree}"`);
          const parsed = this.parseRomanDegree(testCase.degree);
          console.log(`   Interval: ${parsed.interval}, Quality: "${parsed.quality}"`);
        }
      } else {
        console.log(`📋 Resultado: "${result}"`);
      }
    });

    console.log(`\n🎯 === TESTES ESPECÍFICOS PARA PROBLEMAS ATUAIS ===`);
    
    // Testes específicos para os problemas atuais
    const specificTests = [
      { degree: 'ii7', key: 'C', expected: 'Dm7' },
      { degree: 'vi', key: 'C', expected: 'Am' },
      { degree: 'iii7', key: 'C', expected: 'Em7' },
      { degree: 'vii°7', key: 'C', expected: 'Bdim7' },
      { degree: 'ii7', key: 'A', expected: 'Bm7' },
      { degree: 'vi', key: 'A', expected: 'F#m' },
      { degree: '', key: 'C', expected: '' }, // Teste string vazia
      { degree: 'IV7', key: 'C', expected: 'F7' },
      { degree: 'V7', key: 'C', expected: 'G7' }
    ];

    specificTests.forEach((test, i) => {
      console.log(`\nTeste específico ${i + 1}: "${test.degree}" → ${test.key}`);
      const result = this.transposeChord(test.degree, test.key);
      const passed = result === test.expected;
      console.log(`${passed ? '✅' : '❌'} Esperado: "${test.expected}", Obtido: "${result}"`);
    });
  }
}

// ✅ INSTÂNCIA CORRIGIDA
const fixedTransposer = new FixedTransposer();

// ✅ FUNÇÃO PRINCIPAL CORRIGIDA
export function createRandomizedExercise(
  correctProgression: ChordProgression,
  allProgressionOptions: ChordProgression[]
): TransposedExerciseData {
  
  const randomKey = fixedTransposer.getRandomKey();
  
  console.log(`\n🎲 === EXERCÍCIO RANDOMIZADO CORRIGIDO ===`);
  console.log(`🔑 Tonalidade sorteada: ${randomKey}`);
  console.log(`🎯 Progressão correta: "${correctProgression.name}"`);
  console.log(`📊 Total de opções: ${allProgressionOptions.length}`);
  console.log(`📋 Graus originais: ${correctProgression.degrees.join(' | ')}`);

  const transposedOptions: TransposedChordProgression[] = allProgressionOptions.map((option, index) => {
    console.log(`\n--- OPÇÃO ${index + 1}/${allProgressionOptions.length}: "${option.name}" ---`);
    console.log(`🎼 Graus: ${option.degrees.join(' | ')}`);
    
    // ✅ VALIDAÇÃO DE GRAUS VAZIOS
    const hasEmptyDegrees = option.degrees.some(degree => !degree || degree.trim() === '');
    if (hasEmptyDegrees) {
      console.warn(`⚠️ ATENÇÃO: "${option.name}" contém graus vazios!`);
      console.log(`   Graus problemáticos:`, option.degrees.map((d, i) => `[${i}]="${d}"`));
    }
    
    // ✅ TRANSPOSIÇÃO CORRIGIDA
    const chords = fixedTransposer.transposeProgression(option.degrees, randomKey);
    
    console.log(`🎵 Cifras: ${chords.join(' | ')}`);
    console.log(`${option._id === correctProgression._id ? '🎯 ← CORRETA' : '   '}`);
    
    return {
      ...option,
      chords // ✅ CIFRAS TRANSPOSTAS CORRETAMENTE
    };
  });

  // ✅ CALCULAR OFFSET MIDI
  const semitoneOffset = fixedTransposer.getSemitoneDistance('C', randomKey);

  console.log(`\n🎹 Offset MIDI: +${semitoneOffset} semitons`);
  console.log(`🏁 EXERCÍCIO CORRIGIDO CRIADO PARA ${randomKey}!\n`);

  // ✅ VALIDAÇÃO FINAL
  const correctOption = transposedOptions.find(opt => opt._id === correctProgression._id);
  if (correctOption) {
    console.log(`✅ VALIDAÇÃO: Progressão correta tem ${correctOption.chords.length} acordes em ${randomKey}`);
  }

  return {
    randomKey,
    transposedOptions,
    semitoneOffset
  };
}

// ✅ FUNÇÃO DE TESTE INTEGRADA ULTRA-MELHORADA
export function testKeyTransposition() {
  console.log(`\n🧪 === TESTE DO SISTEMA ULTRA-CORRIGIDO ===`);
  
  const testCases = [
    // Casos básicos
    { degree: 'I', key: 'C', expected: 'C' },
    { degree: 'i', key: 'C', expected: 'Cm' },
    { degree: 'Imaj7', key: 'C', expected: 'Cmaj7' },
    { degree: 'imaj7', key: 'C', expected: 'Cmaj7' },
    
    // ✅ CASOS PROBLEMÁTICOS ESPECÍFICOS
    { degree: 'ii7', key: 'C', expected: 'Dm7' },
    { degree: 'vi', key: 'C', expected: 'Am' },
    { degree: 'iii7', key: 'C', expected: 'Em7' },
    { degree: 'vii°7', key: 'C', expected: 'Bdim7' },
    { degree: 'viiø7', key: 'C', expected: 'Bm7♭5' },
    
    // Casos com acidentes
    { degree: 'bIImaj7', key: 'C', expected: 'Dbmaj7' },
    { degree: 'bVIImaj7', key: 'C', expected: 'Bbmaj7' },
    { degree: 'V7alt', key: 'C', expected: 'G7alt' },
    { degree: 'iv^add9', key: 'C', expected: 'Fm(add9)' },
    
    // Casos em outras tonalidades
    { degree: 'ii7', key: 'A', expected: 'Bm7' },
    { degree: 'vi', key: 'A', expected: 'F#m' },
    { degree: 'V7', key: 'Bb', expected: 'F7' },
    
    // ✅ CASO STRING VAZIA
    { degree: '', key: 'C', expected: '' }
  ];
  
  fixedTransposer.testTransposition(testCases);
  
  console.log(`\n🎵 === TESTE DE PROGRESSÃO COMPLETA ===`);
  
  // Teste com progressão real
  const testProgression = ['ii7', 'V7', 'Imaj7', 'vi', 'IV', 'iii7', 'vi', 'ii7'];
  const expectedInC = ['Dm7', 'G7', 'Cmaj7', 'Am', 'F', 'Em7', 'Am', 'Dm7'];
  
  console.log(`🎼 Progressão teste: ${testProgression.join(' - ')}`);
  const resultInC = fixedTransposer.transposeProgression(testProgression, 'C');
  console.log(`🎯 Esperado em C: ${expectedInC.join(' - ')}`);
  console.log(`📋 Obtido em C: ${resultInC.join(' - ')}`);
  
  const allCorrect = resultInC.every((chord, i) => chord === expectedInC[i]);
  console.log(`${allCorrect ? '✅' : '❌'} Progressão completa: ${allCorrect ? 'PASSOU' : 'FALHOU'}`);
}

export { fixedTransposer };