// src/services/llm/index.ts
import { LLMProvider, LLMGenerationOptions } from '../../types/llm';
import { DeepseekProvider } from './providers/deepseek';
import { LlamaProvider } from './providers/llamaProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { HuggingFaceProvider } from './providers/huggingfaceProvider';
import { GroqProvider } from './providers/groqProvider';  // ADICIONADO
import { MIDISequence } from '../../types/midi';

// Implementação do serviço LLM
export class LLMService {
  private static provider: LLMProvider;
  
  // Inicialização com provider configurável
  static initialize(providerType: string = 'groq'): void {
    switch(providerType.toLowerCase()) {
      case 'groq':  // ADICIONADO
        this.provider = new GroqProvider();
        console.log('🚀 LLM Service initialized with Groq (FREE & FAST)');
        break;
      case 'huggingface':
        this.provider = new HuggingFaceProvider();
        console.log('🤗 LLM Service initialized with Hugging Face (FREE)');
        break;
      case 'deepseek':
        this.provider = new DeepseekProvider();
        break;
      case 'llama':
        this.provider = new LlamaProvider();
        break;
      case 'gemini':
        this.provider = new GeminiProvider();
        break;
      default:
        this.provider = new GroqProvider();  // MUDADO: default agora é Groq
        console.log('🚀 LLM Service initialized with Groq (DEFAULT FREE & FAST)');
    }
  }
  
  // Gerar sequência MIDI para exercício
  static async generateMIDISequence(
    exerciseType: 'interval' | 'progression' | 'melodic' | 'rhythmic',
    difficulty: string,
    options: any = {}
  ): Promise<MIDISequence> {
    // Criar prompt específico para o tipo de exercício
    const systemPrompt = `
      You are an expert in music theory, composition, and MIDI.
      You will generate precise MIDI sequences for ear training musical exercises.
      Use JSON format and exact numbers. Piano will be the instrument.
      PPQ (ticks per quarter note): 480.
      
      Create a realistic, human-like piano performance by:
      1. Adding subtle timing variations to note positions (5-15ms variance)
      2. Varying velocities naturally (first note 78-85, second note 75-82)
      3. Adding slight duration variations (95-105% of intended duration)
      4. Including realistic sustain pedal control (CC64) usage
      5. Varying articulation slightly between legato and more detached playing
    `;
    
    const exercisePrompt = this.getMIDIGenerationPrompt(exerciseType, difficulty, options);
    
    try {
      // Fazer a chamada para o LLM
      const response = await this.provider.generateResponse(
        systemPrompt, 
        exercisePrompt, 
        { 
          outputFormat: 'json',
          temperature: 0.7,
          maxTokens: 1500
        }
      );
      
      // Converter resposta para objeto
      let midiSequence: MIDISequence;
      try {
        midiSequence = JSON.parse(response) as MIDISequence;
      } catch (parseError) {
        console.error('Error parsing LLM response as JSON:', parseError);
        // Tentar extrair apenas a parte JSON da resposta
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          midiSequence = JSON.parse(jsonMatch[0]) as MIDISequence;
        } else {
          throw new Error('Failed to parse LLM response as JSON');
        }
      }
      
      // Validar e completar a sequência MIDI se necessário
      return this.validateAndCompleteMIDISequence(midiSequence, exerciseType, difficulty);
    } catch (error) {
      console.error('Error generating MIDI sequence:', error);
      // Retornar uma sequência básica em caso de erro
      return this.generateFallbackMIDISequence(exerciseType, difficulty);
    }
  }
  
  // Prompts específicos para cada tipo de exercício
  private static getMIDIGenerationPrompt(
    exerciseType: 'interval' | 'progression' | 'melodic' | 'rhythmic',
    difficulty: string,
    options: any
  ): string {
    switch (exerciseType) {
      case 'interval':
        return `
          Generate a MIDI sequence for an interval identification exercise.
          Difficulty: ${difficulty}
          
          ${difficulty === 'beginner' ? 'Use simple intervals (M2, m3, M3, P5, P8)' : ''}
          ${difficulty === 'intermediate' ? 'Use intervals including P4, m6, M6, m7' : ''}
          ${difficulty === 'advanced' ? 'Use all intervals, including augmented and diminished' : ''}
          
          Create exactly two note events, separated in time.
          The interval to be identified should be: ${options.interval || 'choose appropriate for the difficulty'}
          
          REQUIRED response format:
          {
            "events": [
              {
                "type": "note" or "control",
                "channel": MIDI channel number (usually 1),
                "position": position in MIDI ticks (integer),
                "data1": value1 (for notes: pitch 0-127),
                "data2": value2 (for notes: velocity 1-127),
                "duration": duration in ticks (only for notes)
              },
              ... more events ...
            ],
            "ppq": 480,
            "tempo": BPM value (integer),
            "timeSignature": {
              "numerator": number,
              "denominator": number
            },
            "description": "textual description explaining the exercise",
            "correctAnswer": "expected answer from the user"
          }
        `;
      
      case 'progression':
        return `
          Generate a MIDI sequence for a chord progression identification exercise.
          Difficulty: ${difficulty}
          
          ${difficulty === 'beginner' ? 'Use simple progressions (I-IV-V-I, I-vi-IV-V)' : ''}
          ${difficulty === 'intermediate' ? 'Use medium progressions (ii-V-I, I-vi-ii-V)' : ''}
          ${difficulty === 'advanced' ? 'Use complex progressions with secondary dominants or modal mixture' : ''}
          
          Create a series of chord events, with proper voice leading.
          The progression to be identified should be noted using Roman numerals.
          
          REQUIRED response format:
          {
            "events": [...],
            "ppq": 480,
            "tempo": BPM value (integer),
            "timeSignature": {
              "numerator": number,
              "denominator": number
            },
            "description": "textual description explaining the exercise",
            "correctAnswer": ["I", "IV", "V", "I"] or similar array of chord numerals
          }
        `;
      
      case 'melodic':
        return `
          Generate a MIDI sequence for a melodic dictation exercise.
          Difficulty: ${difficulty}
          
          ${difficulty === 'beginner' ? 'Use simple 3-4 note melodies in C major/A minor, stepwise motion' : ''}
          ${difficulty === 'intermediate' ? 'Use 5-7 note melodies with some skips, in major and minor keys' : ''}
          ${difficulty === 'advanced' ? 'Use 8-12 note melodies with chromaticism and more complex rhythms' : ''}
          
          The melody should be musical and memorable, with a clear tonal center.
          REQUIRED response format with correctAnswer being the MIDI note numbers used:
          {
            "events": [...],
            "ppq": 480,
            "tempo": BPM value (integer),
            "timeSignature": {
              "numerator": number,
              "denominator": number
            },
            "description": "textual description explaining the exercise",
            "correctAnswer": [60, 62, 64, 65] or similar array of note pitches
          }
        `;
      
      case 'rhythmic':
        return `
          Generate a MIDI sequence for a rhythm identification exercise.
          Difficulty: ${difficulty}
          
          ${difficulty === 'beginner' ? 'Use simple quarter and eighth note patterns in 4/4' : ''}
          ${difficulty === 'intermediate' ? 'Use eighth and sixteenth notes, dotted rhythms in 3/4 or 4/4' : ''}
          ${difficulty === 'advanced' ? 'Use complex patterns with triplets, syncopation in mixed meters' : ''}
          
          The rhythm should be played on a single pitch (MIDI note 60).
          REQUIRED response format with correctAnswer being the durations in milliseconds:
          {
            "events": [...],
            "ppq": 480,
            "tempo": BPM value (integer),
            "timeSignature": {
              "numerator": number,
              "denominator": number
            },
            "description": "textual description explaining the exercise",
            "correctAnswer": [500, 250, 250, 500] or similar array of durations in milliseconds
          }
        `;
      
      default:
        return `
          Generate a MIDI sequence for a ${exerciseType} ear training exercise.
          Difficulty: ${difficulty}
          
          Please create a simple and clear exercise that's suitable for the given difficulty level.
          
          REQUIRED response format:
          {
            "events": [...],
            "ppq": 480,
            "tempo": BPM value (integer),
            "timeSignature": {
              "numerator": number,
              "denominator": number
            },
            "description": "textual description explaining the exercise",
            "correctAnswer": "expected answer from the user"
          }
        `;
    }
  }
  
  // Método para validar e completar a sequência MIDI se necessário
  private static validateAndCompleteMIDISequence(
    sequence: MIDISequence, 
    exerciseType: 'interval' | 'progression' | 'melodic' | 'rhythmic',
    difficulty: string
  ): MIDISequence {
    // Verificar campos obrigatórios
    if (!sequence.events || !Array.isArray(sequence.events) || sequence.events.length === 0) {
      console.warn('Missing or invalid events in MIDI sequence, using defaults');
      sequence.events = this.getDefaultEvents(exerciseType);
    }
    
    // Garantir PPQ
    if (!sequence.ppq) {
      sequence.ppq = 480;
    }
    
    // Garantir tempo
    if (!sequence.tempo) {
      sequence.tempo = 90;
    }
    
    // Garantir fórmula de compasso
    if (!sequence.timeSignature) {
      sequence.timeSignature = { numerator: 4, denominator: 4 };
    }
    
    // Garantir descrição
    if (!sequence.description) {
      sequence.description = `${exerciseType} exercise (${difficulty})`;
    }
    
    // Garantir resposta correta
    if (!sequence.correctAnswer) {
      // Extract expected answer based on exercise type
      if (exerciseType === 'interval') {
        sequence.correctAnswer = 'Perfect Fifth'; // exemplo padrão
      } else if (exerciseType === 'progression') {
        sequence.correctAnswer = ['I', 'IV', 'V', 'I']; // exemplo padrão
      } else if (exerciseType === 'melodic') {
        sequence.correctAnswer = sequence.events
          .filter(e => e.type === 'note')
          .map(e => e.data1.toString());
      } else if (exerciseType === 'rhythmic') {
        sequence.correctAnswer = this.calculateRhythmValues(sequence);
      }
    }
    
    return sequence;
  }
  
  // Método para calcular valores rítmicos a partir da sequência MIDI
  private static calculateRhythmValues(sequence: MIDISequence): string[] {
    const ticksPerBeat = sequence.ppq || 480;
    const msPerBeat = 60000 / (sequence.tempo || 90);
    const msPerTick = msPerBeat / ticksPerBeat;
    
    // Calcular durações baseadas em posições
    const noteEvents = sequence.events
      .filter(e => e.type === 'note')
      .sort((a, b) => a.position - b.position);
    
    if (noteEvents.length <= 1) {
      return ['500']; // Valor padrão se não houver notas suficientes
    }
    
    const durations: number[] = [];
    
    // Calcular intervalo entre as notas
    for (let i = 0; i < noteEvents.length - 1; i++) {
      const interval = noteEvents[i + 1].position - noteEvents[i].position;
      durations.push(Math.round(interval * msPerTick));
    }
    
    // Adicionar a duração da última nota
    const lastNote = noteEvents[noteEvents.length - 1];
    durations.push(Math.round((lastNote.duration || 480) * msPerTick));
    
    return durations.map(d => d.toString());
  }
  
  // Método para gerar eventos MIDI padrão para fallback
  private static getDefaultEvents(exerciseType: 'interval' | 'progression' | 'melodic' | 'rhythmic'): any[] {
    switch (exerciseType) {
      case 'interval':
        return [
          { type: 'note', channel: 1, position: 0, data1: 60, data2: 80, duration: 480 },
          { type: 'note', channel: 1, position: 960, data1: 67, data2: 80, duration: 480 }
        ];
      
      case 'progression':
        return [
          // I chord (C major)
          { type: 'note', channel: 1, position: 0, data1: 60, data2: 80, duration: 1440 },
          { type: 'note', channel: 1, position: 0, data1: 64, data2: 80, duration: 1440 },
          { type: 'note', channel: 1, position: 0, data1: 67, data2: 80, duration: 1440 },
          
          // IV chord (F major)
          { type: 'note', channel: 1, position: 1920, data1: 65, data2: 80, duration: 1440 },
          { type: 'note', channel: 1, position: 1920, data1: 69, data2: 80, duration: 1440 },
          { type: 'note', channel: 1, position: 1920, data1: 72, data2: 80, duration: 1440 },
          
          // V chord (G major)
          { type: 'note', channel: 1, position: 3840, data1: 67, data2: 80, duration: 1440 },
          { type: 'note', channel: 1, position: 3840, data1: 71, data2: 80, duration: 1440 },
          { type: 'note', channel: 1, position: 3840, data1: 74, data2: 80, duration: 1440 },
          
          // I chord (C major)
          { type: 'note', channel: 1, position: 5760, data1: 60, data2: 80, duration: 1440 },
          { type: 'note', channel: 1, position: 5760, data1: 64, data2: 80, duration: 1440 },
          { type: 'note', channel: 1, position: 5760, data1: 67, data2: 80, duration: 1440 }
        ];
      
      case 'melodic':
        return [
          { type: 'note', channel: 1, position: 0, data1: 60, data2: 80, duration: 480 },
          { type: 'note', channel: 1, position: 480, data1: 62, data2: 80, duration: 480 },
          { type: 'note', channel: 1, position: 960, data1: 64, data2: 80, duration: 480 },
          { type: 'note', channel: 1, position: 1440, data1: 65, data2: 80, duration: 480 },
          { type: 'note', channel: 1, position: 1920, data1: 67, data2: 80, duration: 960 }
        ];
      
      case 'rhythmic':
        return [
          { type: 'note', channel: 9, position: 0, data1: 60, data2: 100, duration: 120 },
          { type: 'note', channel: 9, position: 480, data1: 60, data2: 100, duration: 120 },
          { type: 'note', channel: 9, position: 960, data1: 60, data2: 100, duration: 120 },
          { type: 'note', channel: 9, position: 1200, data1: 60, data2: 100, duration: 120 },
          { type: 'note', channel: 9, position: 1440, data1: 60, data2: 100, duration: 120 },
          { type: 'note', channel: 9, position: 1920, data1: 60, data2: 100, duration: 120 }
        ];
      
      default:
        return [
          { type: 'note', channel: 1, position: 0, data1: 60, data2: 80, duration: 480 },
          { type: 'note', channel: 1, position: 480, data1: 64, data2: 80, duration: 480 },
          { type: 'note', channel: 1, position: 960, data1: 67, data2: 80, duration: 480 }
        ];
    }
  }
  
  // Método para gerar sequência MIDI de fallback
  private static generateFallbackMIDISequence(
    exerciseType: 'interval' | 'progression' | 'melodic' | 'rhythmic',
    difficulty: string
  ): MIDISequence {
    return {
      events: this.getDefaultEvents(exerciseType),
      ppq: 480,
      tempo: 90,
      timeSignature: { numerator: 4, denominator: 4 },
      description: `Fallback ${exerciseType} exercise (${difficulty})`,
      correctAnswer: exerciseType === 'interval' ? 'Perfect Fifth' : 
                    exerciseType === 'progression' ? ['I', 'IV', 'V', 'I'] :
                    exerciseType === 'melodic' ? ['60', '62', '64', '65', '67'] :
                    ['500', '500', '500', '250', '250', '500']
    };
  }
}