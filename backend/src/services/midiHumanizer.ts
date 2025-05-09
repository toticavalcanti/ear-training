// src/services/midiHumanizer.ts
import { MIDISequence } from '../types/midi';

export class MidiHumanizer {
  // Humaniza qualquer sequência MIDI
  static humanize(midiSequence: MIDISequence): MIDISequence {
    // Clonar para não modificar o original
    const humanized = JSON.parse(JSON.stringify(midiSequence)) as MIDISequence;
    
    // 1. Adicionar variações sutis de timing
    humanized.events = humanized.events.map(event => {
      if (event.type === 'note') {
        // Variação de timing (até 10ms)
        const timingVariance = Math.floor(Math.random() * 10) - 5;
        
        // Variação de velocidade (intensidade)
        const velocityVariance = Math.floor(Math.random() * 15) - 7;
        
        // Variação de duração
        const durationFactor = 0.97 + (Math.random() * 0.06);
        
        return {
          ...event,
          position: event.position + timingVariance,
          data2: Math.max(60, Math.min(100, (event.data2 || 80) + velocityVariance)),
          duration: Math.floor((event.duration || 480) * durationFactor)
        };
      }
      return event;
    });
    
    // 2. Adicionar controles de expressão (se ainda não existirem)
    const hasExpression = humanized.events.some(e => e.type === 'control' && e.data1 === 11);
    if (!hasExpression) {
      // Adicionar controle de expressão
      humanized.events.push({
        type: 'control',
        channel: 1,
        position: 0,
        data1: 11, // Expression controller
        data2: 100 // Starting value
      });
    }
    
    // 3. Adicionar ou ajustar pedal (sustain)
    const hasPedal = humanized.events.some(e => e.type === 'control' && e.data1 === 64);
    if (!hasPedal && humanized.events.filter(e => e.type === 'note').length > 1) {
      // Identificar notas para colocar pedal entre elas
      const notes = humanized.events
        .filter(e => e.type === 'note')
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      
      if (notes.length >= 2) {
        // Pedal down logo após a primeira nota
        humanized.events.push({
          type: 'control',
          channel: 1,
          position: (notes[0].position || 0) + 10,
          data1: 64, // Sustain controller
          data2: 127 // On
        });
        
        // Pedal up antes da última nota
        humanized.events.push({
          type: 'control',
          channel: 1,
          position: (notes[notes.length - 1].position || 0) - 5,
          data1: 64, // Sustain controller
          data2: 0 // Off
        });
      }
    }
    
    // 4. Ordenar eventos por posição
    humanized.events.sort((a, b) => (a.position || 0) - (b.position || 0));
    
    return humanized;
  }
  
  // Aplicar humanização adequada ao tipo específico de exercício
  static humanizeByType(
    midiSequence: MIDISequence, 
    exerciseType: 'interval' | 'progression' | 'melodic' | 'rhythmic'
  ): MIDISequence {
    // Humanização base
    let humanized = this.humanize(midiSequence);
    
    // Humanização específica por tipo
    switch (exerciseType) {
      case 'interval':
        humanized = this.humanizeIntervals(humanized);
        break;
      case 'progression':
        humanized = this.humanizeProgressions(humanized);
        break;
      case 'melodic':
        humanized = this.humanizeMelodies(humanized);
        break;
      case 'rhythmic':
        humanized = this.humanizeRhythms(humanized);
        break;
    }
    
    return humanized;
  }
  
  // Humanização específica para intervalos
  private static humanizeIntervals(midiSequence: MIDISequence): MIDISequence {
    const notes = midiSequence.events.filter(e => e.type === 'note');
    
    if (notes.length >= 2) {
      // Ajustar a segunda nota para ser ligeiramente mais suave
      const secondNoteIndex = midiSequence.events.findIndex(
        e => e.type === 'note' && e.position === notes[1].position
      );
      
      if (secondNoteIndex !== -1) {
        // Reduzir velocidade da segunda nota em 5-10%
        const secondNote = midiSequence.events[secondNoteIndex];
        const newVelocity = Math.max(65, Math.floor((secondNote.data2 || 80) * 0.92));
        midiSequence.events[secondNoteIndex] = {
          ...secondNote,
          data2: newVelocity
        };
      }
    }
    
    return midiSequence;
  }
  
  // Implementações simples para outros tipos
  private static humanizeProgressions(midiSequence: MIDISequence): MIDISequence {
    // Implementação simplificada para demonstrar o conceito
    return midiSequence;
  }
  
  private static humanizeMelodies(midiSequence: MIDISequence): MIDISequence {
    // Implementação simplificada para demonstrar o conceito
    return midiSequence;
  }
  
  private static humanizeRhythms(midiSequence: MIDISequence): MIDISequence {
    // Implementação simplificada para demonstrar o conceito
    return midiSequence;
  }
}