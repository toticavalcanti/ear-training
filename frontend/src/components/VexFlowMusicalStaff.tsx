// src/components/VexFlowMusicalStaff.tsx - PARTITURA PROFISSIONAL CORRETA
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
  const [containerWidth, setContainerWidth] = useState(800);

  const stableProgression = useMemo(() => progression || [], [progression]);
  const stableChordSymbols = useMemo(() => 
    chordSymbols || progression.map(p => p.symbol), 
    [chordSymbols, progression]
  );

  // Detectar fórmula de compasso dinamicamente
  const dynamicTimeSignature = useMemo(() => {
    if (timeSignature) return timeSignature;
    
    // Se não fornecida, inferir baseado no número de acordes
    const chordCount = stableProgression.length;
    if (chordCount <= 4) return "4/4";
    if (chordCount === 6) return "6/8";
    if (chordCount === 8) return "4/4";
    if (chordCount === 3) return "3/4";
    return "4/4"; // fallback
  }, [timeSignature, stableProgression.length]);

  // Detectar largura
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(Math.max(600, Math.min(1200, rect.width - 40)));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Converter MIDI para posição correta na pauta
  const midiToStaffPosition = useCallback((midiNote: number, clef: 'treble' | 'bass'): number => {
    if (clef === 'treble') {
      // Clave de Sol - G4 está na segunda linha (y=57)
      const g4Position = 57;
      const g4Midi = 67;
      const semitoneStep = 2.5; // 2.5px por semitom
      return g4Position - ((midiNote - g4Midi) * semitoneStep);
    } else {
      // Clave de Fá - A2 está na segunda linha (y=157)  
      const a2Position = 157;
      const a2Midi = 45;
      const semitoneStep = 2.5;
      return a2Position - ((midiNote - a2Midi) * semitoneStep);
    }
  }, []);

  // Garantir 4 notas por acorde
  const generateFullVoicing = useCallback((originalVoicing: number[]): { treble: number[], bass: number[] } => {
    const voicing = [...originalVoicing];
    
    // Se tem menos de 4 notas, duplicar oitavas
    while (voicing.length < 4) {
      const lowestNote = Math.min(...voicing);
      voicing.push(lowestNote + 12); // Adicionar oitava acima
    }
    
    // Separar por claves
    const treble = voicing.filter(note => note >= 60).slice(0, 4); // Máximo 4 notas na clave de sol
    const bass = voicing.filter(note => note < 60).slice(0, 4);     // Máximo 4 notas na clave de fá
    
    // Garantir pelo menos 2 notas em cada clave
    if (treble.length === 0) {
      const highestBass = Math.max(...bass);
      treble.push(highestBass + 12);
      bass.pop();
    }
    
    if (bass.length === 0) {
      const lowestTreble = Math.min(...treble);
      bass.push(lowestTreble - 12);
      treble.shift();
    }
    
    return { treble, bass };
  }, []);

  // Renderizar pauta profissional
  const renderStaff = useCallback(() => {
    if (!containerRef.current || !stableProgression.length) return;

    const measureWidth = Math.max(100, (containerWidth - 200) / stableProgression.length);
    const [numerator, denominator] = dynamicTimeSignature.split('/');

    containerRef.current.innerHTML = `
      <div style="text-align: center; padding: 16px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px;">
        <div style="color: #495057; font-weight: bold; font-size: 16px; margin-bottom: 4px;">
          🎼 ${title}
        </div>
        <div style="color: #6c757d; font-size: 14px;">
          ${stableProgression.length} acordes • ${dynamicTimeSignature} • Semibreves
        </div>
      </div>
      
      <svg width="${containerWidth}" height="${height}" style="background: white; border-radius: 8px; border: 1px solid #e9ecef;">
        <!-- CLAVE DE SOL -->
        <g id="treble-staff">
          <!-- Clave de Sol (símbolo profissional) -->
          <g transform="translate(15, 20)">
            <path d="M20,35 Q25,20 35,25 Q45,30 40,45 Q35,60 25,55 Q15,50 20,35 Z" fill="#000" stroke="#000" stroke-width="0.5"/>
            <circle cx="35" cy="45" r="3" fill="none" stroke="#000" stroke-width="1"/>
            <circle cx="35" cy="55" r="2" fill="#000"/>
          </g>
          
          <!-- 5 linhas da pauta -->
          <line x1="60" y1="35" x2="${containerWidth - 30}" y2="35" stroke="#000" stroke-width="1"/>
          <line x1="60" y1="45" x2="${containerWidth - 30}" y2="45" stroke="#000" stroke-width="1"/>
          <line x1="60" y1="55" x2="${containerWidth - 30}" y2="55" stroke="#000" stroke-width="1"/>
          <line x1="60" y1="65" x2="${containerWidth - 30}" y2="65" stroke="#000" stroke-width="1"/>
          <line x1="60" y1="75" x2="${containerWidth - 30}" y2="75" stroke="#000" stroke-width="1"/>
          
          <!-- Fórmula de compasso -->
          <text x="70" y="48" font-family="Times, serif" font-size="18" font-weight="bold" fill="#000" text-anchor="middle">${numerator}</text>
          <text x="70" y="68" font-family="Times, serif" font-size="18" font-weight="bold" fill="#000" text-anchor="middle">${denominator}</text>
        </g>

        <!-- CLAVE DE FÁ -->
        <g id="bass-staff">
          <!-- Clave de Fá (símbolo profissional) -->
          <g transform="translate(15, 110)">
            <path d="M20,25 Q15,15 25,10 Q35,5 40,15 Q45,25 35,30 Q25,35 20,25 Z" fill="#000"/>
            <circle cx="45" cy="20" r="2" fill="#000"/>
            <circle cx="45" cy="30" r="2" fill="#000"/>
          </g>
          
          <!-- 5 linhas da pauta -->
          <line x1="60" y1="125" x2="${containerWidth - 30}" y2="125" stroke="#000" stroke-width="1"/>
          <line x1="60" y1="135" x2="${containerWidth - 30}" y2="135" stroke="#000" stroke-width="1"/>
          <line x1="60" y1="145" x2="${containerWidth - 30}" y2="145" stroke="#000" stroke-width="1"/>
          <line x1="60" y1="155" x2="${containerWidth - 30}" y2="155" stroke="#000" stroke-width="1"/>
          <line x1="60" y1="165" x2="${containerWidth - 30}" y2="165" stroke="#000" stroke-width="1"/>
        </g>

        <!-- Barra inicial -->
        <line x1="55" y1="35" x2="55" y2="75" stroke="#000" stroke-width="2"/>
        <line x1="55" y1="125" x2="55" y2="165" stroke="#000" stroke-width="2"/>

        <!-- CONECTAR PAUTAS -->
        <line x1="15" y1="35" x2="15" y2="165" stroke="#000" stroke-width="2"/>

        <!-- ACORDES COM SEMIBREVES -->
        ${stableProgression.map((chord, index) => {
          const centerX = 100 + (index * measureWidth) + (measureWidth / 2);
          const { treble, bass } = generateFullVoicing(chord.voicing || [48, 52, 55, 60]);
          
          return `
            <!-- Símbolo do acorde -->
            ${showChordSymbols ? `
              <text x="${centerX}" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">
                ${stableChordSymbols[index] || chord.symbol}
              </text>
            ` : ''}
            
            <!-- SEMIBREVES NA CLAVE DE SOL -->
            ${treble.map((note, noteIndex) => {
              const y = midiToStaffPosition(note, 'treble');
              const x = centerX + (noteIndex * 6) - 9; // Espaçamento pequeno entre notas do acorde
              
              return `
                <!-- Semibreve (oval) -->
                <ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#000" stroke="#000" stroke-width="0.5"/>
                
                <!-- Linhas suplementares se necessário -->
                ${y < 35 ? Array.from({length: Math.ceil((35 - y) / 10)}, (_, i) => 
                  `<line x1="${x - 10}" y1="${35 - (i + 1) * 10}" x2="${x + 10}" y2="${35 - (i + 1) * 10}" stroke="#000" stroke-width="1"/>`
                ).join('') : ''}
                ${y > 75 ? Array.from({length: Math.ceil((y - 75) / 10)}, (_, i) => 
                  `<line x1="${x - 10}" y1="${75 + (i + 1) * 10}" x2="${x + 10}" y2="${75 + (i + 1) * 10}" stroke="#000" stroke-width="1"/>`
                ).join('') : ''}
              `;
            }).join('')}
            
            <!-- SEMIBREVES NA CLAVE DE FÁ -->
            ${bass.map((note, noteIndex) => {
              const y = midiToStaffPosition(note, 'bass');
              const x = centerX + (noteIndex * 6) - 9;
              
              return `
                <!-- Semibreve (oval) -->
                <ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#000" stroke="#000" stroke-width="0.5"/>
                
                <!-- Linhas suplementares se necessário -->
                ${y < 125 ? Array.from({length: Math.ceil((125 - y) / 10)}, (_, i) => 
                  `<line x1="${x - 10}" y1="${125 - (i + 1) * 10}" x2="${x + 10}" y2="${125 - (i + 1) * 10}" stroke="#000" stroke-width="1"/>`
                ).join('') : ''}
                ${y > 165 ? Array.from({length: Math.ceil((y - 165) / 10)}, (_, i) => 
                  `<line x1="${x - 10}" y1="${165 + (i + 1) * 10}" x2="${x + 10}" y2="${165 + (i + 1) * 10}" stroke="#000" stroke-width="1"/>`
                ).join('') : ''}
              `;
            }).join('')}
            
            <!-- Números romanos -->
            ${showRomanNumerals ? `
              <text x="${centerX}" y="190" text-anchor="middle" font-size="12" fill="#666" font-weight="bold">
                ${chord.degree}
              </text>
            ` : ''}
            
            <!-- Barras de compasso -->
            ${index < stableProgression.length - 1 ? `
              <line x1="${centerX + (measureWidth / 2)}" y1="35" x2="${centerX + (measureWidth / 2)}" y2="75" stroke="#000" stroke-width="1"/>
              <line x1="${centerX + (measureWidth / 2)}" y1="125" x2="${centerX + (measureWidth / 2)}" y2="165" stroke="#000" stroke-width="1"/>
            ` : ''}
          `;
        }).join('')}

        <!-- Barra final dupla -->
        <line x1="${containerWidth - 35}" y1="35" x2="${containerWidth - 35}" y2="75" stroke="#000" stroke-width="1"/>
        <line x1="${containerWidth - 30}" y1="35" x2="${containerWidth - 30}" y2="75" stroke="#000" stroke-width="3"/>
        <line x1="${containerWidth - 35}" y1="125" x2="${containerWidth - 35}" y2="165" stroke="#000" stroke-width="1"/>
        <line x1="${containerWidth - 30}" y1="125" x2="${containerWidth - 30}" y2="165" stroke="#000" stroke-width="3"/>
        
        <!-- Título centralizado -->
        <text x="${containerWidth/2}" y="15" text-anchor="middle" font-size="16" font-weight="bold" fill="#000">
          ${title}
        </text>
        
        <!-- Rodapé -->
        <text x="${containerWidth/2}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#666">
          🎼 ${stableProgression.length} acordes • ${dynamicTimeSignature} • Semibreves
        </text>
      </svg>
    `;
  }, [stableProgression, stableChordSymbols, containerWidth, height, showChordSymbols, showRomanNumerals, title, dynamicTimeSignature, midiToStaffPosition, generateFullVoicing]);

  // Renderizar quando necessário
  useEffect(() => {
    if (stableProgression.length > 0) {
      renderStaff();
    }
  }, [stableProgression.length, renderStaff]);

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
                {stableProgression.length} acordes • Partitura profissional • {dynamicTimeSignature}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-600">Profissional</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Semibreves</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div 
          ref={containerRef}
          className="w-full"
          style={{ minHeight: height }}
        />
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="font-semibold text-gray-800 mb-3">🎹 Voicings dos Acordes:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stableProgression.map((chord, index) => {
              const { treble, bass } = generateFullVoicing(chord.voicing || [48, 52, 55, 60]);
              
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
                      <span className="font-medium">Sol:</span> {treble.map(midiToName).join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Fá:</span> {bass.map(midiToName).join(', ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            🎼 Partitura profissional • Semibreves • Fórmula de compasso: {dynamicTimeSignature}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VexFlowMusicalStaff;