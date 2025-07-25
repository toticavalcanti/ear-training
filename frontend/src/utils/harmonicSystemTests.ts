// ============================================
// 🎼 TESTES HARMÔNICOS COM PAT MARTINO - SEM ERROS TYPESCRIPT
// Salvar como: src/utils/harmonicSystemTests.ts
// ============================================

// ========================================
// INTERFACES BÁSICAS
// ========================================

interface ChordData {
  degree: string;
  symbol: string;
  midi: number[];
  notes: string[];
}

// ========================================
// DADOS DE TESTE ATUALIZADOS
// ========================================

const TEST_PROGRESSIONS = [
  {
    name: "Blues Allan Holdsworth Fusion",
    degrees: ["Imaj7#11", "bII7alt", "bVIImaj7", "bVImaj7", "bVmaj7#11", "iv^sus4", "bIII7#9", "Imaj7#11"],
    expected: ["D∆7(#11)", "Eb7alt", "C∆7", "Bb∆7", "Ab∆7(#11)", "Gsus4", "F7(#9)", "D∆7(#11)"],
    key: "D"
  },
  {
    name: "Blues Pat Martino", 
    degrees: ["i7", "bVII7alt", "bVI7#11", "bV7alt", "iv7", "bIII7#9", "bII7alt", "i7"],
    expected: ["Fm7", "Eb7alt", "Db7(#11)", "Cb7alt", "Bbm7", "Ab7(#9)", "Gb7alt", "Fm7"],
    key: "F"
  },
  {
    name: "Bossa Baden Powell", 
    degrees: ["im7", "ivm7", "bVIImaj7", "bIIImaj7", "VImaj7", "ii7b5", "V7", "im7"],
    expected: ["Cm7", "Fm7", "Bb∆7", "Eb∆7", "A∆7", "Dm7♭5", "G7", "Cm7"],
    key: "C"
  },
  {
    name: "Bossa Corcovado",
    degrees: ["I", "iii", "vi", "ii", "V", "I", "iii", "vi"],  
    expected: ["C", "Em", "Am", "Dm", "G", "C", "Em", "Am"],
    key: "C"
  },
  {
    name: "Blues Grant Green Bebop",
    degrees: ["I7", "VI7", "ii7", "V7", "iii7", "VI7", "ii7", "V7"],
    expected: ["C7", "A7", "Dm7", "G7", "Em7", "A7", "Dm7", "G7"],
    key: "C"
  }
];

// ========================================
// SISTEMA DE TRANSPOSIÇÃO AVANÇADO
// ========================================

class AdvancedTransposer {
  private keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  private romanToInterval: Record<string, number> = {
    'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11,
    'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11
  };

  private extractQuality(degree: string): string {
    // Extensões específicas primeiro
    if (degree.includes('maj7') && degree.includes('#11')) return 'maj7(#11)';
    if (degree.includes('maj7') || degree.includes('∆7')) return 'maj7';
    if (degree.includes('7alt')) return '7alt';
    if (degree.includes('7#11')) return '7(#11)';
    if (degree.includes('7#9')) return '7(#9)';
    if (degree.includes('sus4')) return 'sus4';
    if (degree.includes('m7♭5') || degree.includes('7b5')) return 'm7♭5';
    
    // Sétimas
    if (degree.includes('7')) {
      const romanMatch = degree.match(/([IVX]+|[iv]+)/);
      if (romanMatch) {
        const numeral = romanMatch[1];
        const isMinor = /^[a-z]/.test(numeral);
        return isMinor ? 'm7' : '7';
      }
      return '7';
    }
    
    // Tríades
    const romanMatch = degree.match(/([IVX]+|[iv]+)/);
    if (romanMatch) {
      const numeral = romanMatch[1];
      const isMinor = /^[a-z]/.test(numeral);
      return isMinor ? 'm' : '';
    }
    
    return '';
  }

  transposeChord(degree: string, targetKey: string): string {
    console.log(`🔄 Transpondo: ${degree} para ${targetKey}`);
    
    const match = degree.match(/^(b*|#*)(.*)/);
    if (!match) return degree;

    const [, accidentals, rest] = match;
    const romanMatch = rest.match(/([IVX]+|[iv]+)/);
    if (!romanMatch) return degree;

    const roman = romanMatch[1];
    const interval = this.romanToInterval[roman];
    if (interval === undefined) return degree;

    // Calcular alterações
    const flatCount = (accidentals.match(/b/g) || []).length;
    const sharpCount = (accidentals.match(/#/g) || []).length;
    const finalInterval = (interval - flatCount + sharpCount + 12) % 12;
    
    const keyIndex = this.keys.indexOf(targetKey);
    const chordIndex = (keyIndex + finalInterval) % 12;
    const root = this.keys[chordIndex];
    const quality = this.extractQuality(degree);

    const result = root + quality;
    console.log(`   ${degree} → ${result} (intervalo: ${finalInterval})`);
    
    return result;
  }

  getSemitoneOffset(fromKey: string, toKey: string): number {
    const fromIndex = this.keys.indexOf(fromKey);
    const toIndex = this.keys.indexOf(toKey);
    return (toIndex - fromIndex + 12) % 12;
  }
}

// ========================================
// GERAÇÃO MIDI AVANÇADA
// ========================================

function generateAdvancedMidiForChord(root: string, quality: string): number[] {
  const rootMap: Record<string, number> = {
    'C': 60, 'Db': 61, 'D': 62, 'Eb': 63, 'E': 64, 'F': 65,
    'Gb': 66, 'G': 67, 'Ab': 68, 'A': 69, 'Bb': 70, 'B': 71
  };

  const baseNote = rootMap[root] || 60;
  
  const qualityIntervals: Record<string, number[]> = {
    '': [0, 4, 7],                    // maior
    'm': [0, 3, 7],                   // menor  
    '7': [0, 4, 7, 10],               // dominante
    'm7': [0, 3, 7, 10],              // menor com sétima
    'maj7': [0, 4, 7, 11],            // maior com sétima maior
    'sus4': [0, 5, 7],                // suspensa
    '7alt': [0, 4, 7, 10, 13, 15],    // alterada (b9, #9)
    '7(#11)': [0, 4, 7, 10, 18],      // dominante com #11
    '7(#9)': [0, 4, 7, 10, 15],       // dominante com #9
    'm7♭5': [0, 3, 6, 10],            // meio-diminuta
    'maj7(#11)': [0, 4, 7, 11, 18],   // maior com #11
  };

  const intervals = qualityIntervals[quality] || qualityIntervals[''];
  const midi = intervals.map(interval => baseNote + interval);
  
  // Voice leading: baixo + upper structure
  const finalMidi = [
    midi[0] - 12,  // fundamental no baixo (uma oitava abaixo)
    ...midi.slice(1) // estrutura superior
  ];

  return finalMidi;
}

function midiToNote(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = notes[midi % 12];
  return `${note}${octave}`;
}

// ========================================
// 🧪 FUNÇÕES DE TESTE PRINCIPAIS
// ========================================

export function testHarmonicSystem(): void {
  console.log('\n🎯 === TESTE HARMÔNICO COM PAT MARTINO ===\n');
  
  const transposer = new AdvancedTransposer();
  
  TEST_PROGRESSIONS.forEach((progression, index) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎼 ${index + 1}. ${progression.name}`);
    console.log(`${'='.repeat(60)}`);
    
    const targetKey = progression.key;
    const semitoneOffset = transposer.getSemitoneOffset('C', targetKey);
    
    console.log(`🔑 Tonalidade: ${targetKey} (+${semitoneOffset} semitons)`);
    console.log(`📝 Graus: ${progression.degrees.join(' | ')}`);
    
    // Transpor cada acorde
    const results: ChordData[] = [];
    
    progression.degrees.forEach((degree, i) => {
      const transposedChord = transposer.transposeChord(degree, targetKey);
      
      // Extrair raiz e qualidade para MIDI
      const rootMatch = transposedChord.match(/^[A-G][b#]?/);
      const root = rootMatch ? rootMatch[0] : 'C';
      const quality = transposedChord.replace(root, '');
      
      const midi = generateAdvancedMidiForChord(root, quality);
      const notes = midi.map(midiToNote);
      
      console.log(`\n   ${i + 1}. ${degree} → ${transposedChord}`);
      console.log(`      🎹 MIDI: [${midi.join(', ')}]`);
      console.log(`      🎵 Notas: ${notes.join(', ')}`);
      
      // Dividir por registro
      const bass = midi.filter(m => m < 60);
      const treble = midi.filter(m => m >= 60);
      console.log(`      📊 Bass: ${bass.map(midiToNote).join(', ')}`);
      console.log(`      📊 Treble: ${treble.map(midiToNote).join(', ')}`);
      
      results.push({
        degree,
        symbol: transposedChord,
        midi,
        notes
      });
    });
    
    // Validação
    const allValid = results.every(r => r.midi.length >= 3);
    console.log(`\n✅ Status: ${allValid ? 'FUNCIONANDO' : 'COM PROBLEMAS'}`);
    console.log(`📊 Acordes válidos: ${results.filter(r => r.midi.length >= 3).length}/${results.length}`);
    
    // Comparar com esperado
    console.log('\n🔍 COMPARAÇÃO COM ESPERADO:');
    results.forEach((result, i) => {
      const expected = progression.expected[i];
      const match = result.symbol.includes(expected.replace('∆', 'maj')) || 
                   expected.includes(result.symbol.replace('maj7', '∆')) ||
                   result.symbol === expected;
      console.log(`   ${i + 1}. ${match ? '✅' : '❓'} ${result.symbol} (esperado: ${expected})`);
    });
  });
  
  console.log('\n🎉 === TESTE CONCLUÍDO ===');
  console.log('✅ Sistema testado com Pat Martino');
  console.log('📋 Verifique os resultados acima');
  console.log('🔧 Use os dados para corrigir problemas encontrados');
}

export function testPatMartinoOnly(): void {
  console.log('\n🎸 === TESTE ESPECÍFICO: BLUES PAT MARTINO ===');
  
  const progression = TEST_PROGRESSIONS[1]; // Pat Martino é o índice 1
  const transposer = new AdvancedTransposer();
  
  console.log(`🎯 ${progression.name}`);
  console.log(`📝 Graus: ${progression.degrees.join(' - ')}`);
  console.log(`🎵 Esperado em F: ${progression.expected.join(' - ')}`);
  
  const results = progression.degrees.map((degree, i) => {
    const chord = transposer.transposeChord(degree, 'F');
    const expected = progression.expected[i];
    
    // Análise mais detalhada para acordes alterados
    let match = false;
    if (chord === expected) {
      match = true;
    } else if (chord.includes(expected.replace('∆', 'maj')) || 
               expected.includes(chord.replace('maj7', '∆'))) {
      match = true;
    } else if (chord.replace('(#11)', '#11') === expected.replace('(#11)', '#11')) {
      match = true;
    }
    
    console.log(`\n${i + 1}. ${degree} → ${chord}`);
    console.log(`   Esperado: ${expected}`);
    console.log(`   Status: ${match ? '✅ OK' : '❓ VERIFICAR'}`);
    
    // Análise harmônica específica
    if (degree === 'bVI7#11') {
      console.log(`   🔍 ANÁLISE DO bVI7#11:`);
      console.log(`      - Deve ser Db7(#11) em F`);
      console.log(`      - Resultado: ${chord}`);
      console.log(`      - Notas esperadas: Db, F, Ab, B, G`);
    }
    
    return { degree, chord, expected, match };
  });
  
  const totalMatches = results.filter(r => r.match).length;
  console.log(`\n📊 Resultado: ${totalMatches}/${results.length} corretos`);
  
  if (totalMatches === results.length) {
    console.log('🎉 PERFEITO! Sistema funcionando corretamente');
  } else {
    console.log('🔧 Ajustes necessários nos graus que falharam');
  }
}

export function testBluesOnly(): void {
  console.log('\n🎸 === TESTE ESPECÍFICO: BLUES ALLAN HOLDSWORTH ===');
  
  const progression = TEST_PROGRESSIONS[0];
  const transposer = new AdvancedTransposer();
  
  console.log(`🎯 ${progression.name}`);
  console.log(`📝 Graus: ${progression.degrees.join(' - ')}`);
  console.log(`🎵 Esperado em D: ${progression.expected.join(' - ')}`);
  
  const results = progression.degrees.map((degree, i) => {
    const chord = transposer.transposeChord(degree, 'D');
    const expected = progression.expected[i];
    const match = chord.includes(expected.replace('∆', 'maj')) || 
                 expected.includes(chord.replace('maj7', '∆'));
    
    console.log(`\n${i + 1}. ${degree} → ${chord}`);
    console.log(`   Esperado: ${expected}`);
    console.log(`   Status: ${match ? '✅ OK' : '❓ VERIFICAR'}`);
    
    return { degree, chord, expected, match };
  });
  
  const totalMatches = results.filter(r => r.match).length;
  console.log(`\n📊 Resultado: ${totalMatches}/${results.length} corretos`);
  
  if (totalMatches === results.length) {
    console.log('🎉 PERFEITO! Sistema funcionando corretamente');
  } else {
    console.log('🔧 Ajustes necessários nos graus que falharam');
  }
}

// ========================================
// 🌍 EXPOSIÇÃO GLOBAL
// ========================================

declare global {
  interface Window {
    testHarmonicSystem?: () => void;
    testPatMartinoOnly?: () => void;
    testBluesOnly?: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.testHarmonicSystem = testHarmonicSystem;
  window.testPatMartinoOnly = testPatMartinoOnly;
  window.testBluesOnly = testBluesOnly;
  
  console.log('\n🧪 === TESTES HARMÔNICOS COM PAT MARTINO CARREGADOS ===');
  console.log('📝 Funções disponíveis:');
  console.log('   • testHarmonicSystem() - Teste completo (todos)');
  console.log('   • testPatMartinoOnly() - Só o Blues Pat Martino');
  console.log('   • testBluesOnly() - Só o Blues Allan Holdsworth');
  console.log('\n🎯 Execute testPatMartinoOnly() para testar o Pat Martino!');
}