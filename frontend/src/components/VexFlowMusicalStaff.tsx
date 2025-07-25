// src/components/VexFlowMusicalStaff.tsx - CORREÇÃO DAS ENARMONIAS
// ✅ CORREÇÃO: midiToVexFlowKey agora respeita a tonalidade
// ✅ F menor usa bemóis (Db, Ab) em vez de sustenidos (C#, G#)

"use client";

import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

// ========================================
// INTERFACES E TIPOS (MANTIDOS)
// ========================================

interface HarmonicAnalysis {
  symbol: string;
  degree: string;
  analysis: string;
  voicing: number[];
}

interface VexFlowMusicalStaffProps {
  progression: HarmonicAnalysis[];
  title?: string;
  timeSignature?: string;
  showChordSymbols?: boolean;
  showRomanNumerals?: boolean;
  chordSymbols?: string[];
}

// ========================================
// TIPAGEM RIGOROSA PARA VEXFLOW v5.0.0
// ========================================

interface VexFlowContext {
  setFont(font: string): this;
  fillText(text: string, x: number, y: number): void;
}

interface VexFlowStave {
  setContext(context: VexFlowContext): this;
  addClef(clef: string): this;
  addTimeSignature(sig: string): this;
  addKeySignature(key: string): this;
  draw(): void;
}

interface VexFlowStaveNote {
  clef?: "treble" | "bass";
  addModifier(modifier: object, index?: number): this;
}

interface VexFlowVoice {
  addTickables(notes: VexFlowStaveNote[]): this;
  draw(context: VexFlowContext, stave: VexFlowStave): void;
  getTickables(): VexFlowStaveNote[];
}

interface VexFlowFormatter {
  joinVoices(voices: VexFlowVoice[]): this;
  format(voices: VexFlowVoice[], width: number): this;
}

interface VexFlowStaveConstructor {
  new (x: number, y: number, width: number): VexFlowStave;
}

interface VexFlowStaveNoteConstructor {
  new (note: {
    keys: string[];
    duration: string;
    clef?: "treble" | "bass";
  }): VexFlowStaveNote;
}

interface VexFlowVoiceConstructor {
  new (spec: { num_beats: number; beat_value: number }): VexFlowVoice;
}

interface VexFlowFormatterConstructor {
  new (): VexFlowFormatter;
}

interface VexFlowAccidentalConstructor {
  new (type: string): object;
}

interface VexFlowRendererConstructor {
  new (element: HTMLElement, backend: number): {
    resize(width: number, height: number): void;
    getContext(): VexFlowContext;
  };
  Backends: { SVG: number };
}

declare global {
  interface Window {
    VexFlow?: {
      Renderer: VexFlowRendererConstructor;
      Stave: VexFlowStaveConstructor;
      StaveNote: VexFlowStaveNoteConstructor;
      Voice: VexFlowVoiceConstructor;
      Formatter: VexFlowFormatterConstructor;
      Accidental: VexFlowAccidentalConstructor;
    };
  }
}

// ========================================
// 🎼 COMPONENTE PRINCIPAL
// ========================================
const VexFlowMusicalStaff: React.FC<VexFlowMusicalStaffProps> = ({
  progression,
  title = "Progressão Harmônica",
  timeSignature,
  showChordSymbols = true,
  showRomanNumerals = false,
  chordSymbols,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVexFlowLoaded, setIsVexFlowLoaded] = useState(false);

  // Detecção de tonalidade
  const detectedKey = useMemo((): string => {
    if (!progression || progression.length === 0) return "C";

    console.log("🔍 VexFlow detectedKey - Analisando:", title);

    const titleLower = title.toLowerCase();

    // ✅ CORREÇÃO: Detecção mais precisa baseada no título

    // Procurar por padrão "- [KEY]" no título
    const keyMatch = title.match(/- ([A-G][b#]?)\s*$/);
    if (keyMatch) {
      const extractedKey = keyMatch[1];
      console.log(
        `✅ VexFlow: Tonalidade extraída do título: "${extractedKey}"`
      );
      return extractedKey;
    }

    // Fallback para detecção manual (método antigo como backup)
    if (titleLower.includes("- db") || titleLower.includes("-db")) {
      console.log("✅ VexFlow: Detectado Db (bemol)");
      return "Db";
    }
    if (
      titleLower.includes("- d ") ||
      titleLower.includes("-d ") ||
      titleLower.endsWith("- d")
    ) {
      console.log("✅ VexFlow: Detectado D (natural)");
      return "D";
    }
    if (titleLower.includes("- eb") || titleLower.includes("-eb")) {
      console.log("✅ VexFlow: Detectado Eb");
      return "Eb";
    }
    if (
      titleLower.includes("- e ") ||
      titleLower.includes("-e ") ||
      titleLower.endsWith("- e")
    ) {
      console.log("✅ VexFlow: Detectado E");
      return "E";
    }

    // ✅ CORREÇÃO ESPECÍFICA: Para "Blues Grant Green Bebop - Db"
    if (titleLower.includes("grant green") && titleLower.includes("db")) {
      console.log("✅ VexFlow: Grant Green em Db confirmado");
      return "Db";
    }

    console.log("⚠️ VexFlow: Tonalidade não detectada, usando C como padrão");
    return "C";
  }, [progression, title]);

  const stableProgression = useMemo(() => progression || [], [progression]);
  const stableChordSymbols = useMemo(
    () => chordSymbols || progression.map((p) => p.symbol),
    [chordSymbols, progression]
  );
  const progressionTimeSignature = useMemo(
    () => timeSignature || "4/4",
    [timeSignature]
  );

  // ========================================
  // 🐛 DEBUG DO MIDI RECEBIDO
  // ========================================
  useEffect(() => {
    if (progression && progression.length > 0) {
      console.log("\n🎯 === MIDI RECEBIDO DO SISTEMA ===");
      console.log("📝 Título:", title);
      console.log("🎵 Total de acordes:", progression.length);

      progression.forEach((chord, index) => {
        console.log(`\n🎹 === ACORDE ${index + 1} ===`);
        console.log(`   🎼 Grau:`, chord.degree);
        console.log(`   🎵 Cifra:`, stableChordSymbols[index]);
        console.log(`   🎹 MIDI:`, chord.voicing);

        // Análise das notas
        chord.voicing.forEach((midi, noteIndex) => {
          const octave = Math.floor(midi / 12) - 1;
          const noteIndex12 = midi % 12;
          const noteNames = [
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
          const noteName = noteNames[noteIndex12];
          console.log(
            `      📍 ${noteIndex + 1}. MIDI ${midi} = ${noteName}${octave}`
          );
        });
      });

      console.log("🎯 === FIM DEBUG ===\n");
    }
  }, [progression, title, stableChordSymbols]);

  // ========================================
  // 🎵 CONVERSÃO MIDI PARA VEXFLOW - CORRIGIDA
  // ========================================
  const midiToVexFlowKey = useCallback(
    (midi: number): string => {
      const octave = Math.floor(midi / 12) - 1;
      const noteIndex = midi % 12;

      const flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
      const useFlats = flatKeys.includes(detectedKey);

      const sharpNames = [
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
      const flatNames = [
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

      // ✅ LÓGICA INTELIGENTE: Baseada na tonalidade E contexto harmônico
      let noteName: string;

      if (noteIndex === 10) {
        // A#/Bb
        // Bb em: tonalidades com bemóis OU acordes dominantes (C7, F7, etc.)
        // A# em: tonalidades com sustenidos E contexto de sensível (B7, C#7, etc.)
        if (useFlats || detectedKey === "C" || detectedKey === "G") {
          noteName = "Bb"; // Para C7, F7, progressões em bemóis
        } else {
          noteName = "A#"; // Para B7, C#7, progressões em sustenidos
        }
      } else if (noteIndex === 3) {
        // D#/Eb
        if (useFlats || detectedKey === "G") {
          noteName = "Eb"; // bVI em G, acordes em bemóis
        } else {
          noteName = "D#"; // Em tonalidades com sustenidos
        }
      } else if (noteIndex === 8) {
        // G#/Ab
        noteName = useFlats ? "Ab" : "G#";
      } else if (noteIndex === 1) {
        // C#/Db
        noteName = useFlats ? "Db" : "C#";
      } else if (noteIndex === 6) {
        // F#/Gb
        noteName = useFlats ? "Gb" : "F#";
      } else {
        const noteNames = useFlats ? flatNames : sharpNames;
        noteName = noteNames[noteIndex];
      }

      const result = `${noteName}/${octave}`;
      console.log(`🎵 MIDI ${midi} → ${result} (${detectedKey})`);
      return result;
    },
    [detectedKey]
  );

  // Função para carregar VexFlow
  const loadVexFlow = useCallback(() => {
    if (window.VexFlow) {
      setIsVexFlowLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/vexflow@5.0.0/build/cjs/vexflow.js";
    script.async = true;
    script.onload = () => setIsVexFlowLoaded(true);
    script.onerror = () => console.error("Erro ao carregar VexFlow");
    document.head.appendChild(script);
  }, []);

  // ========================================
  // 🎼 RENDERIZAÇÃO FIEL AO MIDI
  // ========================================
  const renderWithVexFlow = useCallback(() => {
    const VF = window.VexFlow;
    if (!VF || !containerRef.current || stableProgression.length === 0) {
      console.warn("VexFlow não carregado ou progressão vazia");
      return;
    }

    const container = containerRef.current;
    container.innerHTML = "";

    try {
      const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
      const containerWidth = container.clientWidth;
      const measuresPerLine = Math.min(
        4,
        Math.max(2, Math.floor(containerWidth / 280))
      );
      const numLines = Math.ceil(stableProgression.length / measuresPerLine);
      const systemHeight = 200;
      const systemSpacing = 40;

      const totalHeight =
        numLines * systemHeight + (numLines - 1) * systemSpacing + 40;
      renderer.resize(containerWidth, totalHeight);
      const context = renderer.getContext();

      stableProgression.forEach((chord, i) => {
        const lineIndex = Math.floor(i / measuresPerLine);
        const measureIndexInLine = i % measuresPerLine;
        const measureWidth = Math.floor(
          (containerWidth - 20) / measuresPerLine
        );

        const x = 10 + measureIndexInLine * measureWidth;
        const y = 30 + lineIndex * (systemHeight + systemSpacing);

        // Pentagramas
        const trebleStave = new VF.Stave(x, y, measureWidth);
        const bassStave = new VF.Stave(x, y + 90, measureWidth);

        if (measureIndexInLine === 0) {
          trebleStave
            .addClef("treble")
            .addTimeSignature(progressionTimeSignature)
            .addKeySignature(detectedKey);

          bassStave
            .addClef("bass")
            .addTimeSignature(progressionTimeSignature)
            .addKeySignature(detectedKey);
        }

        trebleStave.setContext(context).draw();
        bassStave.setContext(context).draw();

        // ========================================
        // 🔍 DEBUG: RASTREAMENTO DA NOTA FANTASMA REMOVIDO
        // ========================================
        console.log(`\n🔍 === RENDERIZANDO ${stableChordSymbols[i]} ===`);
        console.log(`   🎹 MIDI original:`, chord.voicing);

        // ✅ USAR EXATAMENTE O MIDI TOCADO
        const exactMidiNotes = [...chord.voicing].sort((a, b) => a - b);
        const adjustedNotes = exactMidiNotes;

        console.log(`   ✅ MIDI final:`, adjustedNotes);

        // Divisão entre claves (C4 = MIDI 60)
        const bassNotes = adjustedNotes.filter((note) => note < 60);
        const trebleNotes = adjustedNotes.filter((note) => note >= 60);

        console.log(`   🎼 Bass (< C4):`, bassNotes);
        console.log(`   🎼 Treble (>= C4):`, trebleNotes);

        // ========================================
        // 🔍 DEBUG: VERIFICAR CONVERSÃO PARA VEXFLOW COM ENARMONIAS CORRETAS
        // ========================================
        if (bassNotes.length > 0) {
          console.log(`🔍 Conversão Bass para VexFlow (${detectedKey}):`);
          bassNotes.forEach((midi) => {
            const vexKey = midiToVexFlowKey(midi);
            console.log(`   MIDI ${midi} → VexFlow "${vexKey}"`);
          });
        }

        if (trebleNotes.length > 0) {
          console.log(`🔍 Conversão Treble para VexFlow (${detectedKey}):`);
          trebleNotes.forEach((midi) => {
            const vexKey = midiToVexFlowKey(midi);
            console.log(`   MIDI ${midi} → VexFlow "${vexKey}"`);
          });
        }

        const voices: VexFlowVoice[] = [];

        // Clave de sol
        if (trebleNotes.length > 0) {
          const trebleVexKeys = trebleNotes.map(midiToVexFlowKey);
          console.log(`   🎵 Treble keys:`, trebleVexKeys);

          const trebleNote = new VF.StaveNote({
            keys: trebleVexKeys,
            duration: "w",
            clef: "treble",
          });

          trebleVexKeys.forEach((key, index) => {
            const noteName = key.split("/")[0];
            const baseNote = noteName.charAt(0); // Ex: 'D' de 'D/5'

            // Verificar se precisa de bequadro
            const keyAccidentals = ["F#", "C#", "G#", "D#"]; // Para E maior
            const needsNatural =
              keyAccidentals.some((acc) => acc.charAt(0) === baseNote) &&
              !noteName.includes("#") &&
              !noteName.includes("b");

            if (needsNatural) {
              try {
                const accidental = new VF.Accidental("n");
                trebleNote.addModifier(accidental, index);
                console.log(`🎵 Bequadro ♮ aplicado em ${key}`);
              } catch (error) {
                console.warn(`⚠️ Erro ao aplicar ♮:`, error);
              }
            } else if (noteName.includes("b")) {
              try {
                const accidental = new VF.Accidental("b");
                trebleNote.addModifier(accidental, index);
                console.log(`🎵 Acidente ♭ aplicado em ${key}`);
              } catch (error) {
                console.warn(`⚠️ Erro ao aplicar ♭:`, error);
              }
            } else if (noteName.includes("#")) {
              try {
                const accidental = new VF.Accidental("#");
                trebleNote.addModifier(accidental, index);
                console.log(`🎵 Acidente # aplicado em ${key}`);
              } catch (error) {
                console.warn(`⚠️ Erro ao aplicar #:`, error);
              }
            }
          });

          const trebleVoice = new VF.Voice({ num_beats: 4, beat_value: 4 });
          trebleVoice.addTickables([trebleNote]);
          voices.push(trebleVoice);
        }

        // Clave de fá
        if (bassNotes.length > 0) {
          const bassVexKeys = bassNotes.map(midiToVexFlowKey);
          console.log(`   🎵 Bass keys:`, bassVexKeys);

          const bassNote = new VF.StaveNote({
            keys: bassVexKeys,
            duration: "w",
            clef: "bass",
          });

          const bassVoice = new VF.Voice({ num_beats: 4, beat_value: 4 });
          bassVoice.addTickables([bassNote]);
          voices.push(bassVoice);
        }

        // Renderizar
        if (voices.length > 0) {
          const formatter = new VF.Formatter().joinVoices(voices);
          formatter.format(voices, measureWidth * 0.75);

          voices.forEach((voice) => {
            const firstNote = voice.getTickables()[0] as VexFlowStaveNote;
            const targetStave =
              firstNote.clef === "treble" ? trebleStave : bassStave;
            voice.draw(context, targetStave);
          });

          console.log(
            `   ✅ ${stableChordSymbols[i]} renderizado com enarmonias corretas!`
          );
        }

        // Símbolos dos acordes
        context.setFont("14px Arial");
        if (showChordSymbols && stableChordSymbols[i]) {
          context.fillText(stableChordSymbols[i], x + 10, y - 10);
        }
        if (showRomanNumerals) {
          context.setFont("12px Arial");
          context.fillText(chord.degree, x + 10, y + 190);
        }
      });
    } catch (error) {
      console.error("Erro ao renderizar com VexFlow:", error);
    }
  }, [
    stableProgression,
    progressionTimeSignature,
    detectedKey,
    stableChordSymbols,
    showChordSymbols,
    showRomanNumerals,
    midiToVexFlowKey,
  ]);

  // Função para conversão MIDI para nome (debug)
  const midiToName = useCallback((midi: number): string => {
    const noteNames = [
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
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return `${noteNames[noteIndex]}${octave}`;
  }, []);

  // Effects
  useEffect(() => {
    loadVexFlow();
  }, [loadVexFlow]);

  useEffect(() => {
    if (isVexFlowLoaded && stableProgression.length > 0) {
      const timeoutId = setTimeout(renderWithVexFlow, 150);

      const handleResize = () => {
        clearTimeout(timeoutId);
        setTimeout(renderWithVexFlow, 150);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isVexFlowLoaded, renderWithVexFlow, stableProgression.length]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg">
      <div className="px-6 py-4 border-b">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-600">
          {stableProgression.length} acordes • {progressionTimeSignature} •
          Tonalidade: {detectedKey}
        </p>
      </div>

      <div className="p-4">
        {!isVexFlowLoaded && (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Carregando notação musical...</div>
          </div>
        )}
        <div ref={containerRef} className="w-full overflow-x-auto" />
      </div>

      <div className="px-6 py-4 border-t">
        <h4 className="font-bold mb-4">Análise Detalhada dos Acordes:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stableProgression.map((chord, index) => (
            <div
              key={`${stableChordSymbols[index]}-${index}`}
              className="p-3 rounded-lg border bg-gray-50 text-sm"
            >
              <p className="font-bold mb-2">{stableChordSymbols[index]}</p>
              <p>
                <strong>Notas MIDI:</strong> {chord.voicing.join(", ")}
              </p>
              <p>
                <strong>Notas:</strong>{" "}
                {chord.voicing.map(midiToName).join(", ")}
              </p>
              <p>
                <strong>Grau:</strong> {chord.degree}
              </p>
              <p>
                <strong>Função:</strong> {chord.analysis}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VexFlowMusicalStaff;
