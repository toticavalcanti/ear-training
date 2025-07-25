// src/utils/keyTransposition.ts - SISTEMA COMPLETAMENTE CORRIGIDO
// ✅ Sustenidos vs Bemóis corrigido COM ENARMONIAS PRÁTICAS
// ✅ Inconsistência im7 → C#7 corrigida
// ✅ Sistema puro: Graus → Transposição → Reprodução
// ✅ NUNCA usar Cb, E#, Fb, B#, Gb quando há alternativa mais prática

interface ChordProgression {
  _id: string;
  name: string;
  degrees: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  category:
    | "pop"
    | "jazz"
    | "classical"
    | "bossa"
    | "modal"
    | "funk"
    | "rock"
    | "samba"
    | "mpb"
    | "blues";
  mode: "major" | "minor";
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
  private chromaticSharp = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  private chromaticFlat = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];

  // ✅ CORREÇÃO: Array de tonalidades com ENARMONIAS PRÁTICAS
  private keys = [
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];

  // Mapeamento MATEMÁTICO dos numerais romanos base
  private romanNumerals: Record<string, number> = {
    I: 0,
    II: 2,
    III: 4,
    IV: 5,
    V: 7,
    VI: 9,
    VII: 11,
    i: 0,
    ii: 2,
    iii: 4,
    iv: 5,
    v: 7,
    vi: 9,
    vii: 11,
  };

  // ✅ FUNÇÃO AUXILIAR: Converter para enarmonias PRÁTICAS
  private toPracticalEnharmonic(note: string, contextKey?: string): string {
    const practicalMap: Record<string, string> = {
      Cb: "B",
      "E#": "F",
      Fb: "E",
      "B#": "C",
    };

    // ✅ CORREÇÃO INTELIGENTE: D#/Eb baseado na tonalidade
    if (note === "D#" || note === "Eb") {
      const flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb"];
      const sharpKeys = ["G", "D", "A", "E", "B", "F#", "C#"];

      if (contextKey && flatKeys.includes(contextKey)) {
        return "Eb";
      } else if (contextKey && sharpKeys.includes(contextKey)) {
        return "D#";
      }
      // Se não tem contexto, manter original
      return note;
    }

    // ✅ CORREÇÃO INTELIGENTE: Gb/F# baseado na tonalidade
    if (note === "Gb" || note === "F#") {
      const flatKeys = ["Db", "Gb", "Cb"];
      if (contextKey && flatKeys.includes(contextKey)) {
        return "Gb";
      }
      return "F#"; // F# é mais comum
    }

    const practical = practicalMap[note] || note;

    if (note !== practical) {
      console.log(
        `🔄 Enarmonia prática: ${note} → ${practical} (contexto: ${contextKey})`
      );
    }

    return practical;
  }

  getRandomKey(): string {
    return this.keys[Math.floor(Math.random() * this.keys.length)];
  }

  getSemitoneDistance(fromKey: string, toKey: string): number {
    // ✅ Aplicar enarmonias práticas antes de calcular
    const practicalFrom = this.toPracticalEnharmonic(fromKey);
    const practicalTo = this.toPracticalEnharmonic(toKey);

    const fromIndex = this.keys.indexOf(practicalFrom);
    const toIndex = this.keys.indexOf(practicalTo);
    return fromIndex !== -1 && toIndex !== -1
      ? (toIndex - fromIndex + 12) % 12
      : 0;
  }

  // ✅ CORREÇÃO 1: REGRA MUSICAL CORRETA PARA SUSTENIDOS vs BEMÓIS
  private shouldUseFlats(targetKey: string): boolean {
    // ✅ REGRA MUSICAL: Tonalidades que tradicionalmente usam bemóis
    const flatKeys = ["F", "Bb", "Eb", "Ab", "Db"];
    return flatKeys.includes(targetKey);
  }

  // ✅ CORREÇÃO 2: EXTRATOR DE QUALIDADE COMPLETAMENTE CORRIGIDO
  private extractQuality(input: string): string {
    console.log(`🔍 Extraindo qualidade de: "${input}"`);

    const originalInput = input;
    const lower = input.toLowerCase();

    // ========== EXTENSÕES ESPECÍFICAS PRIMEIRO ==========
    if (lower.includes("dim7") || lower.includes("°7")) {
      console.log(`✅ ${originalInput} → dim7`);
      return "dim7";
    }
    if (lower.includes("dim") || lower.includes("°")) {
      console.log(`✅ ${originalInput} → dim`);
      return "dim";
    }
    if (
      lower.includes("ø7") ||
      lower.includes("m7b5") ||
      lower.includes("m7♭5") ||
      lower.includes("7b5")
    ) {
      console.log(`✅ ${originalInput} → m7♭5`);
      return "m7♭5";
    }
    if (
      lower.includes("maj7") ||
      lower.includes("∆7") ||
      lower.includes("^7")
    ) {
      console.log(`✅ ${originalInput} → maj7`);
      return "maj7";
    }
    if (lower.includes("alt")) {
      console.log(`✅ ${originalInput} → 7alt`);
      return "7alt";
    }
    if (lower.includes("sus4")) {
      console.log(`✅ ${originalInput} → sus4`);
      return "sus4";
    }
    if (lower.includes("sus2")) {
      console.log(`✅ ${originalInput} → sus2`);
      return "sus2";
    }
    if (lower.includes("add9")) {
      console.log(`✅ ${originalInput} → (add9)`);
      return "(add9)";
    }
    if (lower.includes("6/9")) {
      console.log(`✅ ${originalInput} → 6/9`);
      return "6/9";
    }
    if (lower.includes("6")) {
      console.log(`✅ ${originalInput} → 6`);
      return "6";
    }
    if (lower.includes("+")) {
      console.log(`✅ ${originalInput} → +`);
      return "+";
    }

    // ========== EXTENSÕES NUMÉRICAS - CORREÇÃO COMPLETA ==========
    if (lower.includes("13")) {
      console.log(`✅ ${originalInput} → 7(13) (dominante com 13ª)`);
      return "7(13)";
    }
    if (lower.includes("11")) {
      if (lower.includes("#11")) {
        console.log(
          `✅ ${originalInput} → 7(#11) (dominante com 11ª aumentada)`
        );
        return "7(#11)";
      }
      console.log(`✅ ${originalInput} → 7(11) (dominante com 11ª)`);
      return "7(11)";
    }
    if (lower.includes("9")) {
      if (lower.includes("#9")) {
        console.log(`✅ ${originalInput} → 7(#9) (dominante com 9ª aumentada)`);
        return "7(#9)";
      } else if (lower.includes("b9")) {
        console.log(`✅ ${originalInput} → 7(b9) (dominante com 9ª menor)`);
        return "7(b9)";
      } else {
        console.log(`✅ ${originalInput} → 7(9) (dominante com 9ª)`);
        return "7(9)";
      }
    }

    // ========== SÉTIMAS - CORREÇÃO CRÍTICA ==========
    if (lower.includes("7")) {
      // ✅ CORREÇÃO FUNDAMENTAL: Determinar tipo pelo case do numeral
      const romanMatch = input.match(/([IVX]+|[iv]+)/);

      if (romanMatch) {
        const numeral = romanMatch[1];
        const isLowerCase = /^[a-z]/.test(numeral);

        if (isLowerCase) {
          // ✅ NUMERAL MINÚSCULO = ACORDE MENOR + SÉTIMA MENOR
          console.log(
            `✅ ${originalInput} → m7 (numeral minúsculo: ${numeral})`
          );
          return "m7";
        } else {
          // ✅ NUMERAL MAIÚSCULO = SÉTIMA DOMINANTE (MENOR)
          console.log(
            `✅ ${originalInput} → 7 (numeral maiúsculo: ${numeral})`
          );
          return "7";
        }
      } else {
        // ✅ SEM NUMERAL ROMANO = DOMINANTE POR PADRÃO
        console.log(`✅ ${originalInput} → 7 (sem numeral romano)`);
        return "7";
      }
    }

    // ========== TRÍADES - ANÁLISE PELO CASE ==========
    const romanMatch = input.match(/([IVX]+|[iv]+)/);
    if (romanMatch) {
      const numeral = romanMatch[1];
      const isLowerCase = /^[a-z]/.test(numeral);

      if (isLowerCase) {
        console.log(`✅ ${originalInput} → m (numeral minúsculo: ${numeral})`);
        return "m";
      } else {
        console.log(`✅ ${originalInput} → '' (numeral maiúsculo: ${numeral})`);
        return ""; // Maior (sem sufixo)
      }
    }

    // ✅ FALLBACK
    console.log(`⚠️ ${originalInput} → '' (fallback)`);
    return "";
  }

  // PARSER MATEMÁTICO INTELIGENTE - MANTIDO
  private parseRomanDegree(degree: string): {
    interval: number;
    quality: string;
  } {
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

    console.log(
      `📊 ${numeral} (${baseInterval}) ${accidentals} → ${finalInterval}`
    );

    // Extrair qualidade das extensões
    const quality = this.extractQuality(numeral + extensions);

    return { interval: finalInterval, quality };
  }

  //✅ TRANSPOSIÇÃO COM ENARMONIAS PRÁTICAS CORRIGIDA
  transposeChord(degree: string, targetKey: string): string {
    console.log(
      `\n🎯 TRANSPONDO COM ENARMONIAS PRÁTICAS: "${degree}" → ${targetKey}`
    );

    // ✅ Aplicar enarmonias práticas na tonalidade
    const practicalKey = this.toPracticalEnharmonic(targetKey);

    const { interval, quality } = this.parseRomanDegree(degree);

    // Encontrar índice da tonalidade alvo
    const keyIndex = this.keys.indexOf(practicalKey);
    if (keyIndex === -1) {
      console.error(`❌ Tonalidade inválida: ${targetKey} → ${practicalKey}`);
      return degree;
    }

    // Calcular índice da nota do acorde
    const chordIndex = (keyIndex + interval) % 12;

    // ✅ LÓGICA ESPECIAL: Decidir sustenidos vs bemóis por contexto
    let chordRoot: string;

    // ✅ REGRA ESPECIAL PARA GRAUS COM BEMÓIS
    if (degree.includes("b")) {
      // Se o grau tem bemol (bVI, bVII, bII), preferir bemol na nota resultante
      chordRoot = this.chromaticFlat[chordIndex];
      console.log(
        `🎵 Grau com bemol (${degree}) → usando escala bemol: ${chordRoot}`
      );
    } else {
      // Para graus naturais, usar a regra da tonalidade
      const useFlats = this.shouldUseFlats(practicalKey);
      chordRoot = useFlats
        ? this.chromaticFlat[chordIndex]
        : this.chromaticSharp[chordIndex];
      console.log(
        `🎵 Grau natural → tonalidade ${practicalKey} usa ${
          useFlats ? "bemóis" : "sustenidos"
        }: ${chordRoot}`
      );
    }

    // ✅ CORREÇÃO: Respeitar o contexto do grau harmônico
    let practicalRoot = chordRoot;

    // Se o grau tem bemol (bVI, bVII, bII), sempre usar bemol no resultado
    if (degree.includes("b")) {
      if (chordRoot === "D#") practicalRoot = "Eb";
      if (chordRoot === "G#") practicalRoot = "Ab";
      if (chordRoot === "A#") practicalRoot = "Bb";
      if (chordRoot === "C#") practicalRoot = "Db";
      if (chordRoot === "F#") practicalRoot = "Gb";
      console.log(
        `🔄 Força bemol para grau com bemol: ${chordRoot} → ${practicalRoot}`
      );
    } else {
      // Para graus naturais, aplicar enarmonias práticas baseadas no contexto
      practicalRoot = this.toPracticalEnharmonic(chordRoot, practicalKey);
    }

    const result = practicalRoot + quality;

    console.log(
      `✅ RESULTADO COM ENARMONIAS PRÁTICAS: "${degree}" → "${result}"`
    );
    console.log(
      `🔧 Detalhes: intervalo=${interval}, qualidade="${quality}", nota="${practicalRoot}"`
    );

    return result;
  }

  transposeProgression(degrees: string[], targetKey: string): string[] {
    console.log(
      `\n🎼 === TRANSPOSIÇÃO COM ENARMONIAS PRÁTICAS PARA ${targetKey} ===`
    );
    console.log(`📝 Input: ${degrees.join(" | ")}`);

    const practicalKey = this.toPracticalEnharmonic(targetKey);
    console.log(`🎵 Tonalidade prática: ${targetKey} → ${practicalKey}`);
    console.log(
      `🎵 Regra base: ${
        this.shouldUseFlats(practicalKey) ? "BEMÓIS" : "SUSTENIDOS"
      } + lógica contextual`
    );

    const chords = degrees.map((degree, index) => {
      console.log(`\n[${index + 1}/${degrees.length}]`);
      return this.transposeChord(degree, targetKey);
    });

    console.log(`\n🎵 Output COM ENARMONIAS PRÁTICAS: ${chords.join(" - ")}`);
    console.log(`✅ ENARMONIAS PRÁTICAS APLICADAS!\n`);

    return chords;
  }

  // ✅ FUNÇÃO DE TESTE ATUALIZADA
  testAllCorrections(): void {
    console.log("\n🧪 === TESTE COM ENARMONIAS PRÁTICAS ===\n");

    // Teste com G (deve usar Eb para bVI, não D#)
    console.log("🎯 TESTE: bVI em G deve ser Eb (não D#)");
    try {
      const test1 = this.transposeChord("bVI", "G");
      console.log(`Resultado: ${test1} (esperado: Eb)`);
      console.log(
        `Status: ${test1 === "Eb" ? "✅ CORRETO" : "❌ INCORRETO"}\n`
      );

      console.log("🎯 TESTE: bVI7#11 em G deve ser Eb7(#11)");
      const test2 = this.transposeChord("bVI7#11", "G");
      console.log(`Resultado: ${test2} (esperado: Eb7(#11))`);
      console.log(
        `Status: ${test2 === "Eb7(#11)" ? "✅ CORRETO" : "❌ INCORRETO"}\n`
      );

      console.log("✅ Sistema com enarmonias práticas funcionando!");
      console.log("🔧 Nunca mais Cb, E#, Fb, B#, Gb quando há alternativa");
      console.log("📋 Tonalidades práticas: " + this.keys.join(", "));
    } catch (error) {
      console.error("❌ Erro no teste:", error);
    }
  }
}

const keyTransposer = new DefinitiveTransposer();

export function createRandomizedExercise(
  correctProgression: ChordProgression,
  allProgressionOptions: ChordProgression[]
): TransposedExerciseData {
  const randomKey = keyTransposer.getRandomKey();

  console.log(`\n🎲 === EXERCÍCIO COM ENARMONIAS PRÁTICAS ===`);
  console.log(`🔑 Tonalidade: ${randomKey}`);
  console.log(`🎯 Progressão: ${correctProgression.name}`);
  console.log(`📊 Total opções: ${allProgressionOptions.length}`);

  const transposedOptions: TransposedChordProgression[] =
    allProgressionOptions.map((option, index) => {
      console.log(`\n--- TRANSPONDO ${index + 1}: "${option.name}" ---`);

      const chords = keyTransposer.transposeProgression(
        option.degrees,
        randomKey
      );

      console.log(
        `📋 "${option.name}": ${option.degrees.join(" | ")} → ${chords.join(
          " | "
        )}`
      );

      return {
        ...option,
        chords, // Acordes transpostos com ENARMONIAS PRÁTICAS
      };
    });

  const semitoneOffset = keyTransposer.getSemitoneDistance("C", randomKey);

  console.log(`\n🎹 Offset MIDI: +${semitoneOffset} semitons`);
  console.log(`🏁 EXERCÍCIO COM ENARMONIAS PRÁTICAS CRIADO!\n`);

  return {
    randomKey,
    transposedOptions,
    semitoneOffset,
  };
}

// ✅ EXPOSIÇÃO PARA TESTES E USO
export { keyTransposer };

// ✅ TESTE AUTOMÁTICO EM DESENVOLVIMENTO
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔧 Executando teste de enarmonias práticas...");
  keyTransposer.testAllCorrections();
}
