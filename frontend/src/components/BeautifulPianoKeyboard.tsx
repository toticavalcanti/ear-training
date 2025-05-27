// frontend/src/components/BeautifulPianoKeyboard.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { realisticPiano } from '@/lib/pianoSynthesizer';

// Declaração de tipos para QwertyHancock
declare global {
  interface Window {
    QwertyHancock: new (settings: QwertyHancockSettings) => QwertyHancockInstance;
  }
}

interface QwertyHancockSettings {
  id: string;
  width: number;
  height: number;
  octaves: number;
  startNote?: string;
  whiteKeyColour?: string;
  blackKeyColour?: string;
  activeColour?: string;
  borderColour?: string;
}

interface QwertyHancockInstance {
  keyDown: (note: string, frequency: number) => void;
  keyUp: (note: string, frequency: number) => void;
}

interface BeautifulPianoKeyboardProps {
  width?: number;
  height?: number;
  octaves?: number;
  startNote?: string;
  onNotePlay?: (note: string, frequency: number) => void;
  onNoteStop?: (note: string, frequency: number) => void;
}

export default function BeautifulPianoKeyboard({
  width = 800,
  height = 200,
  octaves = 3,
  startNote = 'C3',
  onNotePlay,
  onNoteStop
}: BeautifulPianoKeyboardProps) {
  const keyboardRef = useRef<HTMLDivElement>(null);
  const qwertyHancockRef = useRef<QwertyHancockInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [keyboardId] = useState(`piano-keyboard-${Math.random().toString(36).substr(2, 9)}`);

  // Converter nome da nota para número MIDI
  const noteNameToMidi = (noteName: string): number => {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = noteName.match(/([A-G]#?)(\d+)/);
    if (!match) return 60; // Default C4
    
    const [, note, octaveStr] = match;
    const octave = parseInt(octaveStr);
    const noteValue = noteMap[note];
    
    return (octave + 1) * 12 + noteValue;
  };

  // Carregar script do QwertyHancock
  useEffect(() => {
    if (window.QwertyHancock) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qwerty-hancock@0.11.0/dist/qwerty-hancock.min.js';
    script.async = true;
    
    script.onload = () => {
      setScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load QwertyHancock');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup script se componente for desmontado
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Inicializar piano quando script carregado
  useEffect(() => {
    if (!scriptLoaded || !keyboardRef.current || isLoaded) return;

    const initializePiano = async () => {
      try {
        console.log('🎹 Inicializando piano visual...');

        // Limpar container
        keyboardRef.current!.innerHTML = '';

        // Criar keyboard com QwertyHancock
        const keyboard = new window.QwertyHancock({
          id: keyboardId,
          width: width,
          height: height,
          octaves: octaves,
          startNote: startNote,
          whiteKeyColour: '#fff',
          blackKeyColour: '#333',
          activeColour: '#4F46E5', // Indigo
          borderColour: '#E5E7EB'
        });

        // Configurar eventos do teclado
        keyboard.keyDown = async (note: string, frequency: number) => {
          console.log(`🎵 Tecla pressionada: ${note} (${frequency.toFixed(2)}Hz)`);
          
          const midiNote = noteNameToMidi(note);
          
          // Tocar com piano realista
          await realisticPiano.playNote(midiNote, 100);
          
          // Callback customizado
          if (onNotePlay) {
            onNotePlay(note, frequency);
          }
        };

        keyboard.keyUp = (note: string, frequency: number) => {
          console.log(`🎵 Tecla solta: ${note}`);
          
          const midiNote = noteNameToMidi(note);
          
          // Parar nota
          realisticPiano.stopNote(midiNote);
          
          // Callback customizado
          if (onNoteStop) {
            onNoteStop(note, frequency);
          }
        };

        qwertyHancockRef.current = keyboard;
        setIsLoaded(true);
        console.log('✅ Piano visual inicializado!');

      } catch (error) {
        console.error('❌ Erro ao inicializar piano:', error);
      }
    };

    initializePiano();
  }, [isLoaded, onNotePlay, onNoteStop, scriptLoaded, width, height, octaves, startNote, keyboardId]);

  // Reset quando props mudarem
  useEffect(() => {
    if (isLoaded) {
      setIsLoaded(false);
    }
  }, [width, height, octaves, startNote, isLoaded]);

  return (
    <div className="beautiful-piano-container">
      {/* Status */}
      <div className="mb-4">
        <div className={`text-sm p-2 rounded flex items-center gap-2 ${
          isLoaded 
            ? 'bg-green-100 text-green-800' 
            : scriptLoaded 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-gray-100 text-gray-600'
        }`}>
          {isLoaded ? (
            <>
              <span className="text-green-600">✅</span>
              Piano visual carregado! Use mouse ou teclado (ASDF...)
            </>
          ) : scriptLoaded ? (
            <>
              <span className="text-yellow-600">⏳</span>
              Inicializando piano visual...
            </>
          ) : (
            <>
              <span className="text-gray-600">📥</span>
              Carregando QwertyHancock...
            </>
          )}
        </div>
      </div>

      {/* Container do Piano */}
      <div className="piano-wrapper bg-white rounded-lg shadow-lg p-6">
        <div 
          ref={keyboardRef}
          id={keyboardId}
          className="piano-keyboard"
          style={{ 
            width: `${width}px`, 
            height: `${height}px`,
            margin: '0 auto'
          }}
        />
      </div>

      {/* Instruções */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p className="mb-2">
          <strong>🖱️ Mouse:</strong> Clique nas teclas para tocar
        </p>
        <p>
          <strong>⌨️ Teclado:</strong> Use as teclas ASDFG... para tocar piano
        </p>
      </div>

      {/* Controles */}
      <div className="mt-4 flex justify-center gap-4">
        <div className="text-sm">
          <strong>Oitavas:</strong> {octaves}
        </div>
        <div className="text-sm">
          <strong>Nota inicial:</strong> {startNote}
        </div>
        <div className="text-sm">
          <strong>Largura:</strong> {width}px
        </div>
      </div>
    </div>
  );
}