// Componente de Pauta Musical para mostrar progressões
// src/components/MusicalStaff.tsx

import React from 'react';

interface Note {
  midi: number;
  name: string;
}

interface ChordOnStaff {
  degree: string;
  symbol: string;
  notes: Note[];
  measure: number;
}

interface MusicalStaffProps {
  progression: {
    degree: string;
    symbol: string;
    voicing: number[];
  }[];
  title?: string;
  timeSignature?: string;
  showChordSymbols?: boolean;
}

const MusicalStaff: React.FC<MusicalStaffProps> = ({
  progression,
  title,
//   timeSignature = "4/4",
  showChordSymbols = true
}) => {
  // Converter MIDI para posição na pauta
  const midiToStaffPosition = (midi: number): { y: number; ledger: boolean; sharp: boolean } => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const whiteKeys = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
    
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    const noteName = noteNames[noteIndex];
    const isSharp = noteName.includes('#');
    
    // Posição base para C4 (midi 60) = linha central da pauta de sol
    const c4Position = 200; // Y position for middle C
    
    // Calcular posição Y (maior Y = mais baixo na tela)
    const whiteKeyIndex = whiteKeys.indexOf(noteIndex);
    const whiteKeyPosition = whiteKeyIndex !== -1 ? whiteKeyIndex : whiteKeys.indexOf(noteIndex - 1);
    
    const octaveOffset = (octave - 4) * -35; // 7 * 5px spacing between lines
    const noteOffset = whiteKeyPosition * -5; // 5px between each line/space
    
    const y = c4Position + octaveOffset + noteOffset;
    const needsLedgerLine = y < 120 || y > 280; // Outside staff
    
    return { y, ledger: needsLedgerLine, sharp: isSharp };
  };

  // Converter notas MIDI para nomes
  const midiToNoteName = (midi: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const note = noteNames[midi % 12];
    return `${note}${octave}`;
  };

  // Preparar acordes para renderização
  const chordsForStaff: ChordOnStaff[] = progression.map((chord, index) => ({
    degree: chord.degree,
    symbol: chord.symbol,
    notes: chord.voicing.map(midi => ({
      midi,
      name: midiToNoteName(midi)
    })),
    measure: Math.floor(index / 2) + 1 // 2 acordes por compasso
  }));

  const staffWidth = Math.max(600, progression.length * 120);
  const staffHeight = 400;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      {title && (
        <h3 className="text-xl font-bold text-center mb-4 text-gray-900">
          {title}
        </h3>
      )}
      
      <div className="overflow-x-auto">
        <svg width={staffWidth} height={staffHeight} viewBox={`0 0 ${staffWidth} ${staffHeight}`}>
          {/* Título da peça */}
          {title && (
            <text x={staffWidth / 2} y={30} textAnchor="middle" className="fill-gray-900 text-lg font-bold">
              {title}
            </text>
          )}
          
          {/* Clave de Sol */}
          <g transform="translate(20, 120)">
            <path
              d="M10 40 Q15 20, 25 30 Q35 40, 30 60 Q25 80, 15 70 Q10 60, 15 50 Q20 40, 25 50 Q30 60, 25 70"
              fill="currentColor"
              className="text-gray-900"
            />
          </g>
          
          {/* Fórmula de compasso */}
          <g transform="translate(60, 120)">
            <text x="0" y="25" textAnchor="middle" className="fill-gray-900 text-lg font-bold">4</text>
            <text x="0" y="55" textAnchor="middle" className="fill-gray-900 text-lg font-bold">4</text>
          </g>
          
          {/* Linhas da pauta */}
          {[0, 1, 2, 3, 4].map(line => (
            <line
              key={line}
              x1={80}
              y1={120 + line * 20}
              x2={staffWidth - 20}
              y2={120 + line * 20}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-700"
            />
          ))}
          
          {/* Barras de compasso */}
          {Array.from({ length: Math.ceil(progression.length / 2) + 1 }, (_, i) => (
            <line
              key={i}
              x1={100 + i * 240}
              y1={120}
              x2={100 + i * 240}
              y2={200}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-700"
            />
          ))}
          
          {/* Acordes */}
          {chordsForStaff.map((chord, chordIndex) => {
            const xPosition = 120 + (chordIndex * 120);
            
            return (
              <g key={chordIndex}>
                {/* Cifra acima da pauta */}
                {showChordSymbols && (
                  <text
                    x={xPosition}
                    y={100}
                    textAnchor="middle"
                    className="fill-gray-900 text-lg font-bold font-mono"
                  >
                    {chord.symbol}
                  </text>
                )}
                
                {/* Grau romano abaixo da pauta (pequeno) */}
                <text
                  x={xPosition}
                  y={230}
                  textAnchor="middle"
                  className="fill-gray-600 text-sm"
                >
                  {chord.degree}
                </text>
                
                {/* Notas do acorde */}
                {chord.notes.map((note, noteIndex) => {
                  const position = midiToStaffPosition(note.midi);
                  const noteX = xPosition + (noteIndex * 8); // Offset para acordes
                  
                  return (
                    <g key={noteIndex}>
                      {/* Linhas suplementares se necessário */}
                      {position.ledger && (
                        <line
                          x1={noteX - 8}
                          y1={position.y}
                          x2={noteX + 8}
                          y2={position.y}
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-gray-700"
                        />
                      )}
                      
                      {/* Nota (círculo preenchido) */}
                      <ellipse
                        cx={noteX}
                        cy={position.y}
                        rx="4"
                        ry="3"
                        fill="currentColor"
                        className="text-gray-900"
                      />
                      
                      {/* Sustenido se necessário */}
                      {position.sharp && (
                        <text
                          x={noteX - 12}
                          y={position.y + 2}
                          textAnchor="middle"
                          className="fill-gray-900 text-sm"
                        >
                          ♯
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
          
          {/* Barra final */}
          <g transform={`translate(${staffWidth - 20}, 120)`}>
            <line x1="0" y1="0" x2="0" y2="80" stroke="currentColor" strokeWidth="3" className="text-gray-900" />
            <line x1="5" y1="0" x2="5" y2="80" stroke="currentColor" strokeWidth="1" className="text-gray-900" />
          </g>
        </svg>
      </div>
      
      {/* Legenda */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Cifras em cima • Graus romanos embaixo • Voice leading otimizado</p>
      </div>
    </div>
  );
};

export default MusicalStaff;