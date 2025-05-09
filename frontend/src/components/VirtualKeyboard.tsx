// src/components/VirtualKeyboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMIDIHandler } from '@/lib/midiHandler';

interface VirtualKeyboardProps {
  startNote?: number;
  endNote?: number;
  onNoteOn?: (note: number) => void;
  onNoteOff?: (note: number) => void;
  activeNotes?: number[];
  className?: string;
}

export default function VirtualKeyboard({
  startNote = 60, // C4
  endNote = 84,   // C6
  onNoteOn,
  onNoteOff,
  activeNotes = [],
  className = '',
}: VirtualKeyboardProps) {
  const [midiHandler] = useState(getMIDIHandler());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Notas naturais (teclas brancas) e acidentes (teclas pretas)
  const isBlackKey = (note: number) => {
    const noteInOctave = note % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  const getNoteLabel = (note: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(note / 12) - 1;
    const noteName = noteNames[note % 12];
    return `${noteName}${octave}`;
  };

  // Verificar se estamos no navegador e inicializar MIDI
  useEffect(() => {
    setIsMounted(true);
    
    const initializeMidi = async () => {
      try {
        // Certifique-se de que o contexto de áudio está inicializado
        const initialized = await midiHandler.initialize();
        console.log('MIDI initialized:', initialized);
        setIsInitialized(initialized);
        
        // Para testar, tocar uma nota quando inicializar
        if (initialized) {
          setTimeout(() => {
            midiHandler.playNote(60, 100, 500);
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to initialize MIDI:', error);
      }
    };

    // Só inicializar no cliente
    if (typeof window !== 'undefined') {
      initializeMidi();
    }
  }, [midiHandler]);

  // Manipuladores de eventos
  const handleNoteDown = (note: number) => {
    console.log('Note down:', note);
    midiHandler.playNote(note, 100, 0);
    if (onNoteOn) onNoteOn(note);
  };

  const handleNoteUp = (note: number) => {
    console.log('Note up:', note);
    midiHandler.stopNote(note);
    if (onNoteOff) onNoteOff(note);
  };

  // Não renderizar nada enquanto não estiver montado no cliente
  if (!isMounted) {
    return null;
  }

  return (
    <div className={`virtual-keyboard ${className}`}>
      {!isInitialized && (
        <div className="midi-warning p-3 bg-yellow-100 text-yellow-800 rounded mb-4">
          Inicializando gerador de som...
        </div>
      )}
      
      <div className="piano-container">
        {/* Layout melhorado para o teclado */}
        <div className="piano relative h-48 flex">
          {Array.from({ length: endNote - startNote + 1 }).map((_, i) => {
            const note = startNote + i;
            const isBlack = isBlackKey(note);
            
            return (
              <button
                key={note}
                className={`piano-key ${isBlack ? 'black' : 'white'} ${
                  activeNotes.includes(note) ? 'active' : ''
                }`}
                onMouseDown={() => handleNoteDown(note)}
                onMouseUp={() => handleNoteUp(note)}
                onMouseLeave={() => handleNoteUp(note)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleNoteDown(note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleNoteUp(note);
                }}
              >
                <span className="note-label">{getNoteLabel(note)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .piano-container {
          position: relative;
          overflow-x: auto;
          margin-bottom: 20px;
        }
        
        .piano {
          display: flex;
          position: relative;
          min-width: 100%;
        }
        
        .piano-key {
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 5px;
          user-select: none;
        }
        
        .white {
          background-color: white;
          border: 1px solid #ccc;
          flex: 1;
          z-index: 1;
          width: 40px;
        }
        
        .black {
          background-color: #333;
          position: absolute;
          width: 24px;
          height: 60%;
          right: -12px;
          top: 0;
          z-index: 2;
          color: white;
        }
        
        .white.active {
          background-color: #e6f7ff;
        }
        
        .black.active {
          background-color: #666;
        }
        
        .note-label {
          font-size: 10px;
          color: #888;
        }
        
        .black .note-label {
          color: #fff;
        }
      `}</style>
    </div>
  );
}