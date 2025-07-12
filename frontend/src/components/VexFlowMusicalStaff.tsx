// src/components/VexFlowMusicalStaff.tsx - VERSÃO CORRIGIDA COM ESCOPO CORRETO
'use client';

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';

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
  height?: number;
  chordSymbols?: string[];
}

// Tipos mínimos do VexFlow 5.0.0
declare global {
  interface Window {
    VexFlow?: {
      Factory: new (options: VexFlowFactoryOptions) => VexFlowFactory;
      Renderer: {
        new (element: HTMLElement | SVGElement, backend: number): VexFlowRenderer;
        Backends: {
          SVG: number;
          CANVAS: number;
        };
      };
      Stave: {
        new (x: number, y: number, width: number): VexFlowStave;
      };
      StaveNote: {
        new (noteSpec: VexFlowNoteSpec): unknown;
      };
      Voice: {
        new (voiceSpec: VexFlowVoiceSpec): VexFlowVoice;
      };
      Formatter: {
        new (): VexFlowFormatter;
      };
    };
  }
}

interface VexFlowFactoryOptions {
  renderer: {
    elementId?: string;
    element?: HTMLElement;
    width?: number;
    height?: number;
  };
}

interface VexFlowFactory {
  EasyScore(): VexFlowEasyScore;
  System(): VexFlowSystem;
  draw(): void;
  getContext(): VexFlowRenderingContext;
}

interface VexFlowRenderer {
  resize(width: number, height: number): void;
  getContext(): VexFlowRenderingContext;
}

interface VexFlowStave {
  addClef(clef: string): VexFlowStave;
  addTimeSignature(timeSignature: string): VexFlowStave;
  setContext(context: VexFlowRenderingContext): VexFlowStave;
  draw(): void;
}

interface VexFlowNoteSpec {
  clef: string;
  keys: string[];
  duration: string;
}

interface VexFlowVoiceSpec {
  num_beats: number;
  beat_value: number;
}

interface VexFlowVoice {
  addTickables(notes: unknown[]): void;
  draw(context: VexFlowRenderingContext, stave: VexFlowStave): void;
}

interface VexFlowFormatter {
  joinVoices(voices: VexFlowVoice[]): VexFlowFormatter;
  format(voices: VexFlowVoice[], width: number): void;
}

interface VexFlowEasyScore {
  notes(notation: string, options?: { stem?: string }): VexFlowNote[];
  voice(notes: VexFlowNote[], options?: { time?: string }): VexFlowVoice;
}

interface VexFlowSystem {
  addStave(options: {
    voices: VexFlowVoice[];
    width?: number;
  }): VexFlowStave;
}

interface VexFlowNote {
  duration: string;
  keys: string[];
}

interface VexFlowRenderingContext {
  setFont(family: string, size: number): VexFlowRenderingContext;
  fillText(text: string, x: number, y: number): void;
}

const VexFlowMusicalStaff: React.FC<VexFlowMusicalStaffProps> = ({
  progression,
  title = "Progressão Harmônica",
  timeSignature,
  showChordSymbols = true,
  showRomanNumerals = false,
  height = 400,
  chordSymbols
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVexFlowLoaded, setIsVexFlowLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const stableProgression = useMemo(() => progression || [], [progression]);
  const stableChordSymbols = useMemo(() => 
    chordSymbols || progression.map(p => p.symbol), 
    [chordSymbols, progression]
  );

  const progressionTimeSignature = useMemo(() => {
    return timeSignature || "4/4";
  }, [timeSignature]);

  // Detectar largura
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(Math.max(600, Math.min(1400, rect.width - 40)));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // CONVERSÃO MIDI CORRETA PARA VEXFLOW (formato: "note/octave")
  const midiToVexFlowKey = useCallback((midi: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const note = notes[midi % 12];
    
    // MANTER SUSTENIDOS - não converter para bemóis
    const safeOctave = Math.max(2, Math.min(7, octave));
    
    console.log(`🔍 MIDI ${midi} → ${note}${safeOctave} (oitava calculada: ${octave})`);
    
    return `${note}/${safeOctave}`;
  }, []);

  // Carregar VexFlow 5.0.0
  const loadVexFlow = useCallback(async () => {
    if (window.VexFlow?.Factory) {
      setIsVexFlowLoaded(true);
      return;
    }

    try {
      console.log('🎼 Carregando VexFlow 5.0.0...');
      
      const oldScripts = document.querySelectorAll('script[src*="vexflow"]');
      oldScripts.forEach(script => script.remove());

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/vexflow@5.0.0/build/cjs/vexflow.js';
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          setTimeout(() => {
            if (window.VexFlow?.Factory) {
              console.log('✅ VexFlow 5.0.0 carregado com sucesso!');
              setIsVexFlowLoaded(true);
              resolve();
            } else {
              reject(new Error('VexFlow Factory não disponível'));
            }
          }, 100);
        };

        script.onerror = () => {
          reject(new Error('Erro ao carregar VexFlow'));
        };

        document.head.appendChild(script);
      });

    } catch (error) {
      console.error('❌ Erro ao carregar VexFlow:', error);
      setLoadingError(error instanceof Error ? error.message : 'Erro desconhecido');
      setIsVexFlowLoaded(false);
    }
  }, []);

  // RENDERIZAÇÃO CORRIGIDA - USANDO ANALYZE PROGRESSION REAL
  const renderWithVexFlow = useCallback(() => {
    if (!window.VexFlow?.Factory || !containerRef.current || !stableProgression.length) {
      console.warn('⚠️ Condições não atendidas para renderização');
      return;
    }

    try {
      containerRef.current.innerHTML = '';

      console.log('🎼 Renderizando com VoiceLeadingSystem real...');

      const uniqueId = `vexflow-container-${Date.now()}`;
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.id = uniqueId;
      svgElement.setAttribute('width', containerWidth.toString());
      svgElement.setAttribute('height', height.toString());
      svgElement.style.backgroundColor = '#ffffff';
      containerRef.current.appendChild(svgElement);

      // Criar renderer
      const VF = window.VexFlow;
      if (!VF) {
        throw new Error('VexFlow não carregado');
      }

      const renderer = new VF.Renderer(svgElement, VF.Renderer.Backends.SVG);
      renderer.resize(containerWidth, height);
      const context = renderer.getContext();

      // Layout otimizado
      const numChords = stableProgression.length;
      const marginX = 50;
      const availableWidth = containerWidth - (marginX * 2);
      const staveWidth = Math.max(100, availableWidth / numChords);
      const staveHeight = 80;
      const trebleY = 50;
      const bassY = trebleY + staveHeight + 30;

      console.log(`📐 Layout: ${numChords} acordes, ${staveWidth}px cada`);

      // Processar cada acorde
      for (let i = 0; i < numChords; i++) {
        const chord = stableProgression[i];
        const x = marginX + (i * staveWidth);
        
        console.log(`🎵 Processando acorde ${i + 1}: ${chord.symbol} (grau: ${chord.degree})`);
        
        // USAR VOICING REAL DO ANALYZE PROGRESSION OU DO PROPS
        const voicing = chord.voicing;
        
        // Se não tem voicing, logar warning e pular
        if (!voicing || voicing.length === 0) {
          console.warn(`⚠️ Acorde ${chord.symbol} sem voicing! Pulando...`);
          continue;
        }

        console.log(`🎹 Voicing real: ${voicing.map((midi: number) => {
          const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const octave = Math.floor(midi / 12) - 1;
          return `${notes[midi % 12]}${octave}`;
        }).join(', ')}`);

        // STAVES
        const trebleStave = new VF.Stave(x, trebleY, staveWidth);
        const bassStave = new VF.Stave(x, bassY, staveWidth);
        
        if (i === 0) {
          trebleStave.addClef('treble').addTimeSignature('4/4');
          bassStave.addClef('bass').addTimeSignature('4/4');
        }
        
        trebleStave.setContext(context).draw();
        bassStave.setContext(context).draw();

        // SEPARAR NOTAS POR CLAVE CORRETAMENTE
        const trebleVoicing = voicing.filter((note: number) => note >= 60); // C4 e acima
        const bassVoicing = voicing.filter((note: number) => note < 60);     // Abaixo de C4

        // Garantir que cada clave tenha pelo menos uma nota
        if (trebleVoicing.length === 0 && voicing.length > 0) {
          trebleVoicing.push(voicing[voicing.length - 1]); // Nota mais aguda
        }
        if (bassVoicing.length === 0 && voicing.length > 0) {
          bassVoicing.push(voicing[0]); // Nota mais grave
        }

        // NOTAS TREBLE
        if (trebleVoicing.length > 0) {
          const trebleKeys = trebleVoicing.map((midi: number) => midiToVexFlowKey(midi));
          console.log(`🎼 Treble ${i + 1}:`, trebleKeys);

          const trebleNote = new VF.StaveNote({
            clef: 'treble',
            keys: trebleKeys,
            duration: 'w'
          }) as unknown;

          const trebleVoice = new VF.Voice({ num_beats: 4, beat_value: 4 });
          trebleVoice.addTickables([trebleNote]);

          const trebleFormatter = new VF.Formatter().joinVoices([trebleVoice]);
          trebleFormatter.format([trebleVoice], staveWidth - 20);
          trebleVoice.draw(context, trebleStave);
        }

        // NOTAS BASS
        if (bassVoicing.length > 0) {
          const bassKeys = bassVoicing.map((midi: number) => midiToVexFlowKey(midi));
          console.log(`🎼 Bass ${i + 1}:`, bassKeys);

          const bassNote = new VF.StaveNote({
            clef: 'bass',
            keys: bassKeys,
            duration: 'w'
          }) as unknown;

          const bassVoice = new VF.Voice({ num_beats: 4, beat_value: 4 });
          bassVoice.addTickables([bassNote]);

          const bassFormatter = new VF.Formatter().joinVoices([bassVoice]);
          bassFormatter.format([bassVoice], staveWidth - 20);
          bassVoice.draw(context, bassStave);
        }

        // SÍMBOLOS DOS ACORDES
        if (showChordSymbols) {
          context.setFont('Arial', 14);
          const symbol = stableChordSymbols[i] || chord.symbol;
          const symbolX = x + (staveWidth / 2) - (symbol.length * 4);
          const symbolY = trebleY - 15;
          context.fillText(symbol, symbolX, symbolY);
        }

        // NÚMEROS ROMANOS
        if (showRomanNumerals) {
          context.setFont('Arial', 12);
          const degree = chord.degree;
          const degreeX = x + (staveWidth / 2) - (degree.length * 3);
          const degreeY = bassY + staveHeight + 25;
          context.fillText(degree, degreeX, degreeY);
        }

        console.log(`✅ Acorde ${i + 1}/${numChords} renderizado com voicing REAL`);
      }

      console.log('✅ Partitura completa renderizada com VoiceLeadingSystem!');

    } catch (error) {
      console.error('❌ Erro ao renderizar VexFlow:', error);
      setLoadingError(`Erro na renderização: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  }, [stableProgression, stableChordSymbols, containerWidth, height, showChordSymbols, showRomanNumerals, midiToVexFlowKey]);

  // Renderizar fallback
  const renderFallback = useCallback(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = `
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;">
        <div style="color: #495057; font-weight: bold; font-size: 16px; margin-bottom: 8px;">
          🎼 ${title}
        </div>
        <div style="color: #6c757d; font-size: 14px; margin-bottom: 12px;">
          VexFlow 5 ${isVexFlowLoaded ? 'carregado mas com erro' : 'não carregou'}
        </div>
        ${loadingError ? `
          <div style="color: #dc3545; font-size: 12px; background: #f8d7da; padding: 8px; border-radius: 4px; margin-bottom: 12px;">
            ${loadingError}
          </div>
        ` : ''}
        <button 
          onclick="window.location.reload()"
          style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;"
        >
          🔄 Recarregar
        </button>
        
        <div style="margin-top: 20px; text-align: left;">
          <strong>Progressão:</strong><br/>
          ${stableProgression.map((chord, index) => 
            `${index + 1}. ${stableChordSymbols[index] || chord.symbol} (${chord.degree})`
          ).join('<br/>')}
        </div>
      </div>
    `;
  }, [title, isVexFlowLoaded, loadingError, stableProgression, stableChordSymbols]);

  // Inicializar VexFlow
  useEffect(() => {
    loadVexFlow();
  }, [loadVexFlow]);

  // Renderizar quando pronto
  useEffect(() => {
    if (stableProgression.length > 0) {
      if (isVexFlowLoaded && !loadingError) {
        renderWithVexFlow();
      } else {
        renderFallback();
      }
    }
  }, [stableProgression.length, isVexFlowLoaded, loadingError, renderWithVexFlow, renderFallback]);

  // Estado de carregamento
  if (!isVexFlowLoaded && !loadingError) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-3">🎼</div>
          <div className="text-gray-700 text-base font-medium mb-2">
            Carregando VexFlow 5...
          </div>
          <div className="text-sm text-blue-600">
            Biblioteca de notação musical moderna
          </div>
        </div>
      </div>
    );
  }

  if (!stableProgression.length) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        <div className="text-center text-gray-500">
          <div className="text-3xl mb-3">🎵</div>
          <div className="text-base font-medium">Nenhuma progressão para exibir</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-xl">🎹</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
              <div className="text-sm text-gray-600">
                {stableProgression.length} acordes • VexFlow 5 VoiceLeading • {progressionTimeSignature}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${isVexFlowLoaded && !loadingError ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className="text-gray-600">
                {isVexFlowLoaded && !loadingError ? 'VexFlow 5' : 'Fallback'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">VoiceLeading Real</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div 
          ref={containerRef}
          className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden"
          style={{ minHeight: height }}
        />
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="font-semibold text-gray-800 mb-3">🎹 Detalhes dos Acordes:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stableProgression.map((chord, index) => {
              const voicing = chord.voicing || [];
              
              const midiToName = (midi: number): string => {
                const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                const octave = Math.floor(midi / 12) - 1;
                return `${names[midi % 12]}${octave}`;
              };

              return (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                  <div className="font-bold text-sm mb-1">{stableChordSymbols[index] || chord.symbol}</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">MIDI:</span> {voicing.map(midiToName).join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">VexFlow:</span> {voicing.map(midiToVexFlowKey).join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Grau:</span> {chord.degree}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            🎼 VexFlow 5 com VoiceLeadingSystem • Sem hardcode • {progressionTimeSignature}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VexFlowMusicalStaff;