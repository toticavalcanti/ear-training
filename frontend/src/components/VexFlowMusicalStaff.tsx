// src/components/VexFlowMusicalStaff.tsx - VERSÃO CORRIGIDA
'use client';

import React, { useEffect, useRef, useCallback } from 'react';

// Tipos específicos para VexFlow
interface VexFlowLib {
  Renderer: {
    new (element: HTMLElement, backend: number): VexFlowRenderer;
    Backends: {
      SVG: number;
    };
  };
  Stave: {
    new (x: number, y: number, width: number): VexFlowStave;
  };
  Voice: {
    new (options: { num_beats: number; beat_value: number }): VexFlowVoice;
  };
  StaveNote: {
    new (options: { clef: string; keys: string[]; duration: string }): VexFlowStaveNote;
  };
  Formatter: {
    new (): VexFlowFormatter;
  };
  Accidental: {
    new (type: string): unknown;
  };
}

interface VexFlowRenderer {
  resize(width: number, height: number): void;
  getContext(): VexFlowContext;
}

interface VexFlowContext {
  setFillStyle(color: string): void;
  setStrokeStyle(color: string): void;
  setFont(family: string, size: number, weight: string): void;
  fillText(text: string, x: number, y: number): void;
  measureText(text: string): { width: number };
  save(): void;
  restore(): void;
}

interface VexFlowStave {
  addClef(clef: string): VexFlowStave;
  addTimeSignature(timeSignature: string): VexFlowStave;
  setContext(context: VexFlowContext): VexFlowStave;
  draw(): void;
}

interface VexFlowVoice {
  addTickables(notes: VexFlowStaveNote[]): void;
  draw(context: VexFlowContext, stave: VexFlowStave): void;
}

interface VexFlowStaveNote {
  addAccidental?(index: number, accidental: unknown): void;
  addModifier?(modifier: unknown, index?: number): void;
  getDuration(): string;
}

interface VexFlowFormatter {
  joinVoices(voices: VexFlowVoice[]): VexFlowFormatter;
  format(voices: VexFlowVoice[], width: number): void;
}

// Interface removida - VexFlowAccidental não precisa de tipagem específica
// O VexFlow usa internamente, mas não precisamos definir suas propriedades

// Declarações de tipos para VexFlow
declare global {
  interface Window {
    VexFlow: VexFlowLib;
  }
}

interface HarmonicAnalysis {
  degree: string;
  symbol: string;
  voicing: number[];
  analysis: string;
}

interface VexFlowMusicalStaffProps {
  progression: HarmonicAnalysis[];
  title?: string;
  timeSignature?: string;
  showChordSymbols?: boolean;
  showRomanNumerals?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  width?: number;
  height?: number;
}

const VexFlowMusicalStaff: React.FC<VexFlowMusicalStaffProps> = ({
  progression,
  title,
  timeSignature = "4/4",
  showChordSymbols = true,
  showRomanNumerals = true,
  backgroundColor = "#ffffff",
  foregroundColor = "#000000",
  width = 800,
  height = 300
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef<boolean>(false);

  // Converter MIDI para notação VexFlow
  const midiToVexFlowNote = (midiNote: number): string => {
    const noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}/${octave}`;
  };

  // Renderizar fallback quando VexFlow não está disponível
  const renderFallback = useCallback(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = `
      <div style="
        width: ${width}px; 
        height: ${height}px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: ${backgroundColor}; 
        border: 1px solid #ccc; 
        border-radius: 8px;
      ">
        <div style="text-align: center; color: ${foregroundColor};">
          <div style="font-size: 24px; margin-bottom: 8px;">🎼</div>
          <div style="font-size: 14px;">Carregando pauta musical...</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">
            VexFlow será carregado em breve
          </div>
        </div>
      </div>
    `;
  }, [width, height, backgroundColor, foregroundColor]);

  // Renderizar a pauta com VexFlow
  const renderStaff = useCallback(() => {
    if (!containerRef.current || renderedRef.current) {
      return;
    }

    // Verificar se VexFlow está disponível (suporte para v4 e v5)
    const VF = window.VexFlow || window.Vex?.Flow;
    if (!VF) {
      console.log('🎼 VexFlow ainda não carregado, aguardando...');
      return;
    }

    try {
      console.log('🎼 Iniciando renderização da pauta com VexFlow');
      
      // Limpar container
      containerRef.current.innerHTML = '';
      
      // Criar renderer SVG
      const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
      renderer.resize(width, height);
      
      const context = renderer.getContext();
      context.setFillStyle(foregroundColor);
      context.setStrokeStyle(foregroundColor);

      // Calcular largura por acorde
      const chordsPerStave = Math.min(4, progression.length);
      const staveWidth = Math.floor((width - 100) / Math.ceil(progression.length / chordsPerStave));
      const staveHeight = 100;
      const currentX = 50;
      let currentY = 60;

      // Dividir progressão em compassos
      const measures = [];
      for (let i = 0; i < progression.length; i += chordsPerStave) {
        measures.push(progression.slice(i, i + chordsPerStave));
      }

      measures.forEach((measure, measureIndex) => {
        // Criar pauta
        const stave = new VF.Stave(currentX, currentY, staveWidth);
        
        if (measureIndex === 0) {
          stave.addClef('treble');
          stave.addTimeSignature(timeSignature);
        }
        
        stave.setContext(context).draw();

        // Criar notas para este compasso
        const notes: VexFlowStaveNote[] = [];
        const chordSymbols: string[] = [];
        const romanNumerals: string[] = [];

        measure.forEach((chord) => {
          // Converter voicing MIDI para notação VexFlow
          const sortedVoicing = [...chord.voicing]
            .filter(midi => midi >= 48 && midi <= 84) // Filtrar range do piano
            .sort((a, b) => a - b); // Ordenar do grave para agudo
          
          const keys = sortedVoicing
            .map(midi => midiToVexFlowNote(midi))
            .slice(0, 4); // Máximo 4 notas por acorde

          if (keys.length > 0) {
            // Usar duração baseada no número de acordes no compasso
            const duration = measure.length === 1 ? 'w' : measure.length === 2 ? 'h' : 'q';
            
            const note = new VF.StaveNote({
              clef: 'treble',
              keys: keys,
              duration: duration
            });

            // Adicionar acidentes se necessário (com verificação de API)
            keys.forEach((key, index) => {
              try {
                if (key.includes('#')) {
                  // Tentar diferentes APIs para acidentes
                  if (typeof note.addAccidental === 'function') {
                    note.addAccidental(index, new VF.Accidental('#'));
                  } else if (typeof note.addModifier === 'function') {
                    note.addModifier(new VF.Accidental('#'), index);
                  }
                } else if (key.includes('b')) {
                  if (typeof note.addAccidental === 'function') {
                    note.addAccidental(index, new VF.Accidental('b'));
                  } else if (typeof note.addModifier === 'function') {
                    note.addModifier(new VF.Accidental('b'), index);
                  }
                }
              } catch (accidentalError) {
                console.warn(`⚠️ Erro ao adicionar acidente em ${key}:`, accidentalError);
              }
            });

            notes.push(note);
            chordSymbols.push(chord.symbol);
            romanNumerals.push(chord.degree);
          }
        });

        if (notes.length > 0) {
          // Criar voice com beats baseados na duração das notas
          const totalBeats = notes.reduce((sum, note) => {
            const duration = note.getDuration();
            switch(duration) {
              case 'w': return sum + 4;
              case 'h': return sum + 2;
              case 'q': return sum + 1;
              default: return sum + 1;
            }
          }, 0);

          const voice = new VF.Voice({
            num_beats: Math.max(4, totalBeats),
            beat_value: 4
          });
          voice.addTickables(notes);

          // Formatar e desenhar
          new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 50);
          voice.draw(context, stave);

          // Adicionar cifras acima da pauta
          if (showChordSymbols) {
            chordSymbols.forEach((symbol, index) => {
              context.save();
              context.setFont('Arial', 14, 'bold');
              context.setFillStyle(foregroundColor);
              
              // Calcular posição X baseada na posição da nota
              const noteX = currentX + 70 + (index * (staveWidth - 120) / Math.max(1, notes.length - 1));
              const y = currentY - 25;
              
              // Centralizar texto
              const textWidth = context.measureText(symbol).width;
              context.fillText(symbol, noteX - textWidth / 2, y);
              context.restore();
            });
          }

          // Adicionar numerais romanos abaixo da pauta
          if (showRomanNumerals) {
            romanNumerals.forEach((numeral, index) => {
              context.save();
              context.setFont('Arial', 11, 'normal');
              context.setFillStyle('#666666');
              
              // Calcular posição X baseada na posição da nota
              const noteX = currentX + 70 + (index * (staveWidth - 120) / Math.max(1, notes.length - 1));
              const y = currentY + staveHeight + 30;
              
              // Centralizar texto
              const textWidth = context.measureText(numeral).width;
              context.fillText(numeral, noteX - textWidth / 2, y);
              context.restore();
            });
          }
        }

        // Próxima linha se necessário
        currentY += staveHeight + 60;
      });

      // Adicionar título se fornecido
      if (title) {
        context.save();
        context.setFont('Arial', 18, 'bold');
        context.setFillStyle(foregroundColor);
        context.fillText(title, width / 2 - (title.length * 5), 30);
        context.restore();
      }

      renderedRef.current = true;
      console.log('✅ Pauta renderizada com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao renderizar pauta com VexFlow:', error);
      renderFallback();
    }
  }, [
    progression,
    title,
    timeSignature,
    showChordSymbols,
    showRomanNumerals,
    foregroundColor,
    width,
    height,
    renderFallback
  ]);

  // Carregar VexFlow dinamicamente
  useEffect(() => {
    const loadVexFlow = async () => {
      // Verificar se VexFlow já está disponível (v4 ou v5)
      const VF = window.VexFlow || window.Vex?.Flow;
      if (VF) {
        console.log('✅ VexFlow já carregado, renderizando...');
        renderStaff();
        return;
      }

      // Mostrar fallback enquanto carrega
      renderFallback();

      try {
        console.log('🔄 Carregando VexFlow via CDN...');
        
        // Carregar VexFlow via CDN (versão estável)
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js';
        script.async = true;
        
        script.onload = () => {
          console.log('✅ VexFlow 4.2.2 carregado com sucesso');
          
          // Verificar se carregou corretamente
          const loadedVF = window.VexFlow || window.Vex?.Flow;
          if (loadedVF) {
            console.log('🎼 VexFlow está disponível, iniciando renderização...');
            renderedRef.current = false;
            setTimeout(renderStaff, 100);
          } else {
            console.error('❌ VexFlow carregou mas não está acessível');
            renderFallback();
          }
        };
        
        script.onerror = (error) => {
          console.error('❌ Erro ao carregar VexFlow:', error);
          
          // Tentar versão alternativa
          console.log('🔄 Tentando versão alternativa...');
          const altScript = document.createElement('script');
          altScript.src = 'https://unpkg.com/vexflow@4.2.2/build/cjs/vexflow.js';
          altScript.async = true;
          
          altScript.onload = () => {
            console.log('✅ VexFlow alternativo carregado');
            renderedRef.current = false;
            setTimeout(renderStaff, 100);
          };
          
          altScript.onerror = () => {
            console.error('❌ Falha total ao carregar VexFlow');
            renderFallback();
          };
          
          document.head.appendChild(altScript);
        };
        
        document.head.appendChild(script);

        // Cleanup
        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } catch (error) {
        console.error('❌ Erro ao configurar VexFlow:', error);
        renderFallback();
      }
    };

    loadVexFlow();
  }, [renderStaff, renderFallback]);

  // Re-renderizar quando progression mudar
  useEffect(() => {
    if (window.VexFlow && progression.length > 0) {
      renderedRef.current = false;
      renderStaff();
    }
  }, [progression, renderStaff]);

  return (
    <div className="vexflow-musical-staff bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header com controles */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {title || 'Análise Harmônica'}
            </h3>
            <div className="text-sm text-gray-600">
              VexFlow • {progression.length} acordes • {timeSignature}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            {showChordSymbols && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                🎵 Cifras
              </span>
            )}
            {showRomanNumerals && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                📊 Graus
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Container da pauta */}
      <div 
        ref={containerRef} 
        className="w-full p-4"
        style={{ 
          minHeight: `${height}px`,
          backgroundColor: backgroundColor 
        }}
      />

      {/* Legenda */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-600 text-center space-x-4">
          <span>
            <strong>Cifras:</strong> Símbolos dos acordes na tonalidade atual
          </span>
          <span>•</span>
          <span>
            <strong>Graus:</strong> Função harmônica universal (numerais romanos)
          </span>
          <span>•</span>
          <span>
            <strong>Voicing:</strong> Condução de vozes otimizada
          </span>
        </div>
      </div>
    </div>
  );
};

export default VexFlowMusicalStaff;