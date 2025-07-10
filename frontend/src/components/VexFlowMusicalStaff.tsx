// src/components/VexFlowMusicalStaff.tsx - VERSÃO REAL E RESPONSIVA
'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

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
  width?: number;
  height?: number;
  chordSymbols?: string[];
}

const VexFlowMusicalStaff: React.FC<VexFlowMusicalStaffProps> = ({
  progression,
  title = "Progressão Harmônica",
  timeSignature = "4/4",

  showRomanNumerals = false,

  height = 400,
  chordSymbols
}) => {
  const svgRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Props estáveis
  const stableTitle = useMemo(() => title || "Progressão Harmônica", [title]);
  const stableTimeSignature = useMemo(() => timeSignature || "4/4", [timeSignature]);
  const stableHeight = useMemo(() => height || 400, [height]);
  const stableChordSymbols = useMemo(() => chordSymbols || progression.map(p => p.symbol), [chordSymbols, progression]);
  const stableProgression = useMemo(() => progression || [], [progression]);

  // Detectar largura do container - RESPONSIVO
  useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const parentWidth = rect.width || svgRef.current.offsetWidth;
        const minWidth = Math.max(600, parentWidth - 20); // Mínimo 600px
        const maxWidth = Math.min(1200, parentWidth); // Máximo 1200px
        setContainerWidth(maxWidth || minWidth);
      }
    };

    // Delay para garantir que o elemento existe
    setTimeout(updateWidth, 100);
    setIsLoaded(true);
    
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Converter MIDI para nome de nota
  const midiToNoteName = useCallback((midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
  }, []);

  // Calcular posição Y correta baseada na nota MIDI real
  const getCorrectStaffPosition = useCallback((midiNote: number, clef: 'treble' | 'bass', staffY: number): { y: number; ledgerLines: number[] } => {
    const lineSpacing = 8;
    let position: number;
    const ledgerLines: number[] = [];
    
    if (clef === 'treble') {
      // Clave de Sol: B4 (71) = linha superior, D5 (74) = acima da pauta
      // Linha superior = staffY, linha inferior = staffY + 32
      // Cada semitom = lineSpacing / 2 = 4px
      const referenceMidi = 71; // B4 na linha superior
      const referenceY = staffY;
      position = referenceY + ((referenceMidi - midiNote) * 2); // 2px por semitom
      
    } else {
      // Clave de Fá: D3 (50) = linha superior, F2 (41) = linha inferior  
      const referenceMidi = 50; // D3 na linha superior
      const referenceY = staffY;
      position = referenceY + ((referenceMidi - midiNote) * 2); // 2px por semitom
    }
    
    // Calcular linhas suplementares
    const staffTop = staffY;
    const staffBottom = staffY + 32;
    
    if (position < staffTop - 4) {
      // Linhas acima da pauta
      for (let y = staffTop - lineSpacing; y >= position - 4; y -= lineSpacing) {
        ledgerLines.push(y);
      }
    } else if (position > staffBottom + 4) {
      // Linhas abaixo da pauta
      for (let y = staffBottom + lineSpacing; y <= position + 4; y += lineSpacing) {
        ledgerLines.push(y);
      }
    }
    
    return { y: position, ledgerLines };
  }, []);

  // Usar voicing EXATO sem modificações
  const prepareVoicing = useCallback((voicing: number[]) => {
    if (!voicing || voicing.length === 0) {
      // Fallback apenas se não houver voicing
      return { trebleNotes: [], bassNotes: [], allNotes: [] };
    }
    
    console.log('🎵 Voicing original recebido:', voicing.map(midiToNoteName));
    
    // Usar as notas EXATAS do voicing original
    const allNotes = [...voicing].sort((a, b) => a - b);
    
    // Separar por clave de forma natural
    const trebleNotes = allNotes.filter(note => note >= 60); // C4 e acima → clave de sol
    const bassNotes = allNotes.filter(note => note < 60);    // Abaixo de C4 → clave de fá
    
    console.log('🎼 Clave Sol:', trebleNotes.map(midiToNoteName));
    console.log('🎼 Clave Fá:', bassNotes.map(midiToNoteName));
    
    return { trebleNotes, bassNotes, allNotes };
  }, [midiToNoteName]);

  // Renderizar pauta
  const renderStaff = useCallback(() => {
    if (!svgRef.current || !stableProgression.length) return;

    const actualWidth = containerWidth;
    const staffLines = 5;
    const lineSpacing = 8;
    const trebleY = 50;
    const bassY = 140;
    const numChords = stableProgression.length;
    
    // Responsivo: ajustar com base na largura
    const minMeasureWidth = actualWidth < 800 ? 80 : 100;
    const staffWidth = Math.max(actualWidth - 200, numChords * minMeasureWidth);
    const measureWidth = staffWidth / numChords;

    svgRef.current.innerHTML = `
      <svg width="${actualWidth}" height="${stableHeight}" style="background: white; font-family: Arial, sans-serif;">
        <!-- Título -->
        <text x="${actualWidth/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">
          ${stableTitle}
        </text>

        <!-- PAUTA SUPERIOR (Clave de Sol) -->
        <text x="20" y="${trebleY + 25}" font-family="serif" font-size="32" fill="#000">𝄞</text>
        
        ${Array.from({length: staffLines}, (_, i) => {
          const y = trebleY + (i * lineSpacing);
          return `<line x1="60" y1="${y}" x2="${60 + staffWidth}" y2="${y}" stroke="#000" stroke-width="1"/>`;
        }).join('')}

        <!-- PAUTA INFERIOR (Clave de Fá) -->
        <text x="20" y="${bassY + 25}" font-family="serif" font-size="32" fill="#000">𝄢</text>
        
        ${Array.from({length: staffLines}, (_, i) => {
          const y = bassY + (i * lineSpacing);
          return `<line x1="60" y1="${y}" x2="${60 + staffWidth}" y2="${y}" stroke="#000" stroke-width="1"/>`;
        }).join('')}

        <!-- Conectar pautas -->
        <line x1="55" y1="${trebleY}" x2="55" y2="${bassY + 32}" stroke="#000" stroke-width="2"/>

        <!-- Fórmula de compasso -->
        <text x="70" y="${trebleY + 12}" font-size="12" font-weight="bold" fill="#000">${stableTimeSignature.split('/')[0]}</text>
        <text x="70" y="${trebleY + 24}" font-size="12" font-weight="bold" fill="#000">${stableTimeSignature.split('/')[1]}</text>
        <text x="70" y="${bassY + 12}" font-size="12" font-weight="bold" fill="#000">${stableTimeSignature.split('/')[0]}</text>
        <text x="70" y="${bassY + 24}" font-size="12" font-weight="bold" fill="#000">${stableTimeSignature.split('/')[1]}</text>

        <!-- Acordes com notas reais -->
        ${stableProgression.map((chord, chordIndex) => {
          const measureStart = 85 + (chordIndex * measureWidth);
          const centerX = measureStart + (measureWidth / 2);
          const voicing = prepareVoicing(chord.voicing);
          
          let svgContent = '';
          
          // Cifra do acorde
          svgContent += `
            <text x="${centerX}" y="${trebleY - 10}" text-anchor="middle" font-size="13" font-weight="bold" fill="#000">
              ${stableChordSymbols[chordIndex] || chord.symbol}
            </text>
          `;
          
          // Notas da clave de sol (EXATAS do voicing)
          voicing.trebleNotes.forEach((midiNote, noteIndex) => {
            const noteX = centerX + (noteIndex - (voicing.trebleNotes.length - 1) / 2) * 14;
            const position = getCorrectStaffPosition(midiNote, 'treble', trebleY);
            
            // Linhas suplementares se necessário
            position.ledgerLines.forEach(ledgerY => {
              svgContent += `<line x1="${noteX - 12}" y1="${ledgerY}" x2="${noteX + 12}" y2="${ledgerY}" stroke="#000" stroke-width="1"/>`;
            });
            
            // Semibreve BONITA (formato oval correto)
            svgContent += `
              <ellipse cx="${noteX}" cy="${position.y}" rx="5" ry="3.5" 
                       fill="none" stroke="#000" stroke-width="1.2" 
                       transform="rotate(-15 ${noteX} ${position.y})"/>
            `;
          });
          
          // Notas da clave de fá (EXATAS do voicing)
          voicing.bassNotes.forEach((midiNote, noteIndex) => {
            const noteX = centerX + (noteIndex - (voicing.bassNotes.length - 1) / 2) * 14;
            const position = getCorrectStaffPosition(midiNote, 'bass', bassY);
            
            // Linhas suplementares se necessário
            position.ledgerLines.forEach(ledgerY => {
              svgContent += `<line x1="${noteX - 12}" y1="${ledgerY}" x2="${noteX + 12}" y2="${ledgerY}" stroke="#000" stroke-width="1"/>`;
            });
            
            // Semibreve BONITA (formato oval correto)
            svgContent += `
              <ellipse cx="${noteX}" cy="${position.y}" rx="5" ry="3.5" 
                       fill="none" stroke="#000" stroke-width="1.2" 
                       transform="rotate(-15 ${noteX} ${position.y})"/>
            `;
          });
          
          // Grau romano
          if (showRomanNumerals) {
            svgContent += `
              <text x="${centerX}" y="${bassY + 55}" text-anchor="middle" font-size="11" fill="#666">
                ${chord.degree || ''}
              </text>
            `;
          }
          
          return svgContent;
        }).join('')}

        <!-- Barras de compasso -->
        ${Array.from({length: numChords - 1}, (_, i) => {
          const x = 85 + ((i + 1) * measureWidth);
          return `
            <line x1="${x}" y1="${trebleY}" x2="${x}" y2="${trebleY + 32}" stroke="#000" stroke-width="1"/>
            <line x1="${x}" y1="${bassY}" x2="${x}" y2="${bassY + 32}" stroke="#000" stroke-width="1"/>
          `;
        }).join('')}

        <!-- Barra final dupla -->
        <line x1="${60 + staffWidth - 10}" y1="${trebleY}" x2="${60 + staffWidth - 10}" y2="${trebleY + 32}" stroke="#000" stroke-width="1"/>
        <line x1="${60 + staffWidth}" y1="${trebleY}" x2="${60 + staffWidth}" y2="${trebleY + 32}" stroke="#000" stroke-width="3"/>
        <line x1="${60 + staffWidth - 10}" y1="${bassY}" x2="${60 + staffWidth - 10}" y2="${bassY + 32}" stroke="#000" stroke-width="1"/>
        <line x1="${60 + staffWidth}" y1="${bassY}" x2="${60 + staffWidth}" y2="${bassY + 32}" stroke="#000" stroke-width="3"/>
      </svg>
    `;
  }, [stableProgression, stableChordSymbols, showRomanNumerals, stableTitle, stableTimeSignature, stableHeight, containerWidth, prepareVoicing, getCorrectStaffPosition]);

  // Renderizar quando carregado
  useEffect(() => {
    if (isLoaded && stableProgression.length > 0) {
      renderStaff();
    }
  }, [isLoaded, renderStaff, stableProgression]);

  if (!isLoaded) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="animate-spin text-2xl mb-2">🎼</div>
          <div className="text-gray-600 text-sm">Carregando pauta musical...</div>
        </div>
      </div>
    );
  }

  if (!stableProgression.length) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🎵</div>
          <div className="text-sm">Nenhuma progressão para exibir</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-xl">🎹</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{stableTitle}</h4>
              <div className="text-sm text-gray-600">
                {stableProgression.length} acordes • Notas reais • {stableTimeSignature}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-black rounded"></div>
              <span className="text-gray-600">Semibreves</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Posições reais</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pauta Musical */}
      <div className="p-4 sm:p-6">
        <div 
          ref={svgRef} 
          className="w-full overflow-x-auto"
          style={{ minHeight: stableHeight }}
        />
        
        {/* Informações das notas */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="font-semibold text-gray-800 mb-3">🎹 Voicings Reais:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stableProgression.map((chord, index) => {
              const voicing = prepareVoicing(chord.voicing);
              
              return (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                  <div className="font-bold text-sm mb-1">{stableChordSymbols[index] || chord.symbol}</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {voicing.trebleNotes.length > 0 && (
                      <div>
                        <span className="font-medium">Sol:</span> {voicing.trebleNotes.map(midiToNoteName).join(', ')}
                      </div>
                    )}
                    {voicing.bassNotes.length > 0 && (
                      <div>
                        <span className="font-medium">Fá:</span> {voicing.bassNotes.map(midiToNoteName).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Rodapé */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            🎼 Pauta com notas reais do voicing • Linhas suplementares • Responsivo
          </div>
        </div>
      </div>
    </div>
  );
};

export default VexFlowMusicalStaff;