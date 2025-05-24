// src/services/llm/providers/groqProvider.ts
import { LLMProvider } from '../../../types/llm';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️  GROQ_API_KEY não encontrada no .env');
    }
  }
  
  async generateResponse(
    systemPrompt: string,
    userPrompt: string, 
    options: any = {}
  ): Promise<string> {
    try {
      const model = 'llama-3.3-70b-versatile'; // Modelo gratuito e poderoso
      
      console.log(`🚀 Calling Groq with model: ${model}`);
      
      // DETECTAR TIPO DE EXERCÍCIO DO PROMPT
      const exerciseType = this.detectExerciseType(userPrompt);
      console.log(`🎯 Detected exercise type: ${exerciseType}`);
      
      // USAR PROMPT ESPECÍFICO MELHORADO
      const enhancedSystemPrompt = this.getEnhancedSystemPrompt(exerciseType, systemPrompt);
      
      const messages: GroqMessage[] = [
        { 
          role: 'system', 
          content: enhancedSystemPrompt + '\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, just the JSON object. Use ONLY literal numbers - no mathematical expressions like "480 + 10". Use actual calculated values like "490".' 
        },
        { role: 'user', content: userPrompt }
      ];
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1500,
          top_p: 1,
          stream: false,
          stop: null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorData}`);
      }
      
      const data: GroqResponse = await response.json();
      
      let generatedText = data.choices[0]?.message?.content || '';
      
      console.log(`✅ Groq response: ${generatedText.length} chars`);
      console.log(`🔍 Raw response preview: ${generatedText.substring(0, 200)}...`);
      
      // Limpar markdown e extrair apenas o JSON
      generatedText = this.cleanJsonResponse(generatedText);
      console.log(`🧹 Cleaned JSON preview: ${generatedText.substring(0, 200)}...`);
      console.log(`🔍 FULL JSON to debug:`, generatedText);  // DEBUG COMPLETO
      console.log(`🎵 ANALYZING MIDI FORMAT...`);
      
      // Analisar qual formato o LLM está gerando
      if (generatedText.includes('"noteOn"')) {
        console.log('🎼 LLM generated FORMAT 1 (noteOn/noteOff)');
      }
      if (generatedText.includes('"note"') && generatedText.includes('"duration"')) {
        console.log('🎼 LLM generated FORMAT 2 (note+duration)');
      }
      if (generatedText.includes('"controlChange"')) {
        console.log('🎛️ LLM generated controlChange format');
      }
      if (generatedText.includes('"control"')) {
        console.log('🎛️ LLM generated control format');
      }
      
      // Testar se o JSON é válido antes de retornar
      try {
        const parsed = JSON.parse(generatedText);
        console.log('✅ JSON is valid!');
        
        // Padronizar formato MIDI mesmo quando JSON já é válido
        if (parsed.events) {
          parsed.events = this.standardizeMidiFormat(parsed.events);
          console.log('🎵 MIDI format standardized!');
        }
        
        // CORRIGIR ANÁLISE MUSICAL DO LLM
        if (parsed.correctAnswer) {
          parsed.correctAnswer = this.fixMusicalAnalysis(exerciseType, parsed);
          console.log('🎼 Musical analysis corrected!');
        }
        
        generatedText = JSON.stringify(parsed);
        
      } catch (testError) {
        console.log('❌ JSON is still invalid, trying to fix...');
        console.log('🔍 Parse error:', (testError as Error).message);
        generatedText = this.tryFixJson(generatedText);
        
        // Testar novamente após correção
        try {
          const parsed = JSON.parse(generatedText);
          console.log('✅ JSON fixed successfully!');
          
          // Padronizar formato MIDI
          if (parsed.events) {
            parsed.events = this.standardizeMidiFormat(parsed.events);
            console.log('🎵 MIDI format standardized!');
          }
          
          // CORRIGIR ANÁLISE MUSICAL DO LLM
          if (parsed.correctAnswer) {
            parsed.correctAnswer = this.fixMusicalAnalysis(exerciseType, parsed);
            console.log('🎼 Musical analysis corrected!');
          }
          
          generatedText = JSON.stringify(parsed);
          
        } catch (finalError) {
          console.log('❌ Final fix failed:', (finalError as Error).message);
        }
      }
      
      if (generatedText.length < 50 || !generatedText.includes('{')) {
        console.log('🔄 Creating basic MIDI...');
        return this.createBasicMIDI(userPrompt, exerciseType);
      }
      
      return generatedText;
      
    } catch (error: any) {
      console.error('❌ Erro no Groq:', error.message);
      return this.createBasicMIDI(userPrompt, 'interval');
    }
  }
  
  private detectExerciseType(userPrompt: string): string {
    const prompt = userPrompt.toLowerCase();
    
    if (prompt.includes('interval') || prompt.includes('intervalo')) {
      return 'interval';
    } else if (prompt.includes('progression') || prompt.includes('progressão') || prompt.includes('chord')) {
      return 'progression';
    } else if (prompt.includes('melodic') || prompt.includes('melody') || prompt.includes('melódic')) {
      return 'melodic';
    } else if (prompt.includes('rhythmic') || prompt.includes('rhythm') || prompt.includes('rítmic')) {
      return 'rhythmic';
    }
    
    return 'interval'; // Default
  }
  
  private getEnhancedSystemPrompt(exerciseType: string, originalPrompt: string): string {
    const specificPrompts: { [key: string]: string } = {
      interval: `Generate an interval identification exercise. 

CRITICAL INTERVAL CALCULATION:
- 1 semitone = m2 (minor second)
- 2 semitones = M2 (major second)  
- 3 semitones = m3 (minor third)
- 4 semitones = M3 (major third)
- 5 semitones = P4 (perfect fourth)
- 7 semitones = P5 (perfect fifth)
- 9 semitones = M6 (major sixth)
- 12 semitones = P8 (perfect octave)

EXAMPLE: Note 60 (C4) to Note 67 (G4) = 67-60 = 7 semitones = P5

Generate exactly 2 notes and calculate the interval CORRECTLY based on semitones difference.`,

      progression: `Generate a chord progression exercise.

Use these EXACT chord voicings in C major:
- I (C major): [60, 64, 67] (C4-E4-G4)
- ii (D minor): [62, 65, 69] (D4-F4-A4) 
- iii (E minor): [64, 67, 71] (E4-G4-B4)
- IV (F major): [65, 69, 72] (F4-A4-C5)
- V (G major): [67, 71, 74] (G4-B4-D5)
- vi (A minor): [69, 72, 76] (A4-C5-E5)

Generate a 4-chord progression and ensure the correctAnswer matches the ACTUAL chords you generate.`,

      melodic: `Generate a melodic dictation exercise.

Create a simple 4-8 note melody using C major scale notes:
C=60, D=62, E=64, F=65, G=67, A=69, B=71, C=72

Play notes sequentially (not simultaneously). Space them about 480 ticks apart.
The correctAnswer should be an array of the exact MIDI note numbers you generate.`,

      rhythmic: `Generate a rhythmic exercise.

IMPORTANT: Use the SAME note (C4 = 60) repeated with different rhythmic patterns.
DO NOT generate intervals or melodies.

Common rhythm durations:
- Quarter note = 480 ticks
- Eighth note = 240 ticks  
- Sixteenth note = 120 ticks
- Dotted quarter = 720 ticks

Generate 3-6 repetitions of the same note with varied durations to create a rhythmic pattern.
The correctAnswer should describe the pattern like "quarter-eighth-eighth-quarter".`
    };
    
    const specificPrompt = specificPrompts[exerciseType] || specificPrompts['interval'];
    
    return originalPrompt + '\n\n' + specificPrompt;
  }
  
  private fixMusicalAnalysis(exerciseType: string, parsed: any): any {
    console.log(`🔧 Fixing ${exerciseType} analysis...`);
    
    switch (exerciseType) {
      case 'interval':
        return this.fixIntervalAnalysis(parsed);
      case 'progression':
        return this.fixProgressionAnalysis(parsed);
      case 'rhythmic':
        return this.fixRhythmicAnalysis(parsed);
      default:
        return parsed.correctAnswer;
    }
  }
  
  private fixIntervalAnalysis(parsed: any): string {
    const notes = parsed.events?.filter((e: any) => e.type === 'note')?.map((e: any) => e.data1) || [];
    if (notes.length < 2) return parsed.correctAnswer;
    
    const semitones = Math.abs(notes[1] - notes[0]);
    const intervalMap: { [key: number]: string } = {
      0: 'P1',  // Perfect Unison
      1: 'm2',  // Minor Second
      2: 'M2',  // Major Second
      3: 'm3',  // Minor Third
      4: 'M3',  // Major Third
      5: 'P4',  // Perfect Fourth
      6: 'TT',  // Tritone
      7: 'P5',  // Perfect Fifth
      8: 'm6',  // Minor Sixth
      9: 'M6',  // Major Sixth
      10: 'm7', // Minor Seventh
      11: 'M7', // Major Seventh
      12: 'P8'  // Perfect Octave
    };
    
    const correctInterval = intervalMap[semitones] || parsed.correctAnswer;
    console.log(`🎵 Interval correction: ${notes[0]}→${notes[1]} = ${semitones} semitones = ${correctInterval}`);
    return correctInterval;
  }
  
  private fixProgressionAnalysis(parsed: any): string[] {
    // Para progressões, seria mais complexo analisar acordes
    // Por agora, manter a resposta original mas logar o problema
    console.log(`🎼 Progression analysis needs manual review`);
    return parsed.correctAnswer;
  }
  
  private fixRhythmicAnalysis(parsed: any): string {
    const notes = parsed.events?.filter((e: any) => e.type === 'note') || [];
    if (notes.length === 0) return parsed.correctAnswer;
    
    // Se tem apenas 2 notas, provavelmente está gerando intervalos em vez de ritmos
    if (notes.length === 2) {
      console.log(`🥁 Rhythmic exercise incorrectly generated as interval - fixing...`);
      return "quarter-quarter"; // Padrão simples para beginner
    }
    
    // Analisar durações para determinar padrão rítmico
    const durations = notes.map((n: any) => n.duration || 480);
    const pattern = durations.map((d: number) => {
      if (d >= 720) return 'dotted-quarter';
      if (d >= 480) return 'quarter';
      if (d >= 240) return 'eighth';
      return 'sixteenth';
    }).join('-');
    
    console.log(`🥁 Rhythmic pattern: ${pattern}`);
    return pattern;
  }
  
  private standardizeMidiFormat(events: any[]): any[] {
    console.log('🔧 Standardizing MIDI format...');
    const standardizedEvents: any[] = [];
    const noteOnEvents: Map<string, any> = new Map();
    
    for (const event of events) {
      // Converter noteOn/noteOff para note+duration
      if (event.type === 'noteOn') {
        const key = `${event.note || event.data1}_${event.channel || 0}`;
        noteOnEvents.set(key, {
          type: 'note',
          channel: event.channel || 1,
          position: event.time || event.position || 0,
          data1: event.note || event.data1,
          data2: event.velocity || event.data2 || 80,
          duration: 480  // Default duration
        });
      } 
      else if (event.type === 'noteOff') {
        const key = `${event.note || event.data1}_${event.channel || 0}`;
        const noteOn = noteOnEvents.get(key);
        if (noteOn) {
          noteOn.duration = (event.time || event.position || 0) - noteOn.position;
          standardizedEvents.push(noteOn);
          noteOnEvents.delete(key);
        }
      }
      // Converter controlChange para control
      else if (event.type === 'controlChange') {
        standardizedEvents.push({
          type: 'control',
          channel: event.channel || 1,
          position: event.time || event.position || 0,
          data1: event.controller || event.data1,
          data2: event.value || event.data2
        });
      }
      // Manter eventos já no formato correto
      else if (event.type === 'note' || event.type === 'control') {
        standardizedEvents.push({
          ...event,
          channel: event.channel || 1,
          position: event.position || event.time || 0,
          data1: event.data1 || event.note,
          data2: event.data2 || event.velocity || event.value || 80
        });
      }
    }
    
    // Adicionar noteOn events que não tiveram noteOff
    for (const noteOn of noteOnEvents.values()) {
      standardizedEvents.push(noteOn);
    }
    
    // Ordenar por posição
    standardizedEvents.sort((a, b) => (a.position || 0) - (b.position || 0));
    
    console.log(`🎵 Converted ${events.length} events to ${standardizedEvents.length} standardized events`);
    return standardizedEvents;
  }
  
  private tryFixJson(json: string): string {
    console.log('🔧 Attempting to fix JSON...');
    
    try {
      // Tentativa 1: Corrigir expressões matemáticas básicas
      let fixed = json
        // Somar: 480 + 10 -> 490
        .replace(/(\d+)\s*\+\s*(\d+)/g, (match, a, b) => (parseInt(a) + parseInt(b)).toString())
        // Subtrair: 480 - 10 -> 470
        .replace(/(\d+)\s*-\s*(\d+)/g, (match, a, b) => (parseInt(a) - parseInt(b)).toString())
        // Multiplicar: 480 * 2 -> 960
        .replace(/(\d+)\s*\*\s*(\d+)/g, (match, a, b) => (parseInt(a) * parseInt(b)).toString());
      
      console.log('🔍 After math fix:', fixed.substring(0, 200) + '...');
      
      // Testar se funcionou
      if (this.isValidJson(fixed)) {
        console.log('✅ Math fix worked!');
        return fixed;
      }
      
      // Tentativa 2: Extrair estrutura básica
      console.log('🔧 Trying structure extraction...');
      fixed = this.extractBasicStructure(json);
      
      if (this.isValidJson(fixed)) {
        console.log('✅ Structure extraction worked!');
        return fixed;
      }
      
      // Tentativa 3: Fallback JSON
      console.log('🆘 Using fallback JSON...');
      return JSON.stringify({
        events: [
          { type: "note", channel: 1, position: 0, data1: 60, data2: 80, duration: 480 },
          { type: "note", channel: 1, position: 960, data1: 67, data2: 80, duration: 480 }
        ],
        ppq: 480,
        tempo: 90,
        timeSignature: { numerator: 4, denominator: 4 },
        description: "Generated by Groq (corrected)",
        correctAnswer: "Perfect Fifth"
      });
      
    } catch (error) {
      console.log('🆘 All fixes failed:', (error as Error).message);
      return '{"events":[],"ppq":480,"tempo":90}';
    }
  }
  
  private isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  
  private extractBasicStructure(json: string): string {
    // Extrair apenas as partes essenciais e reconstruir
    const events = this.extractEvents(json);
    const ppq = json.match(/"ppq":\s*(\d+)/)?.[1] || "480";
    const tempo = json.match(/"tempo":\s*(\d+)/)?.[1] || "90";
    
    return JSON.stringify({
      events: events,
      ppq: parseInt(ppq),
      tempo: parseInt(tempo),
      timeSignature: { numerator: 4, denominator: 4 },
      description: "Exercise generated by Groq",
      correctAnswer: "Perfect Fifth"
    });
  }
  
  private extractEvents(json: string): any[] {
    // Tentar extrair eventos mesmo de JSON malformado
    const eventPattern = /"type":\s*"note"[\s\S]*?"duration":\s*\d+/g;
    const matches = json.match(eventPattern);
    
    if (!matches) {
      return [
        { type: "note", channel: 1, position: 0, data1: 60, data2: 80, duration: 480 },
        { type: "note", channel: 1, position: 960, data1: 67, data2: 80, duration: 480 }
      ];
    }
    
    return matches.map((match, index) => {
      const channel = match.match(/"channel":\s*(\d+)/)?.[1] || "1";
      const position = match.match(/"position":\s*(\d+)/)?.[1] || (index * 960).toString();
      const data1 = match.match(/"data1":\s*(\d+)/)?.[1] || "60";
      const data2 = match.match(/"data2":\s*(\d+)/)?.[1] || "80";
      const duration = match.match(/"duration":\s*(\d+)/)?.[1] || "480";
      
      return {
        type: "note",
        channel: parseInt(channel),
        position: parseInt(position),
        data1: parseInt(data1),
        data2: parseInt(data2),
        duration: parseInt(duration)
      };
    });
  }
  
  private cleanJsonResponse(response: string): string {
    // Remove blocos de código markdown
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove texto antes e depois do JSON
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    // CORRIGIR EXPRESSÕES MATEMÁTICAS NO JSON
    // "position": 480 + 10 -> "position": 490
    cleaned = cleaned.replace(/:\s*(\d+)\s*\+\s*(\d+)/g, (match, a, b) => {
      return `: ${parseInt(a) + parseInt(b)}`;
    });
    
    // "position": 960 - 10 -> "position": 950
    cleaned = cleaned.replace(/:\s*(\d+)\s*-\s*(\d+)/g, (match, a, b) => {
      return `: ${parseInt(a) - parseInt(b)}`;
    });
    
    // Corrigir outros problemas comuns de JSON malformado
    cleaned = cleaned
      // Propriedades sem aspas: type: -> "type":
      .replace(/(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      // Aspas simples para duplas: 'note' -> "note"
      .replace(/'/g, '"')
      // Remover vírgulas extras: ,} -> }  e ,] -> ]
      .replace(/,(\s*[}\]])/g, '$1')
      // Corrigir números malformados
      .replace(/(\d+)\.(\s*[,}\]])/g, '$1$2')  // 123. -> 123
      // Remover quebras de linha desnecessárias dentro de strings
      .replace(/"\s*\n\s*"/g, '" "')
      // Adicionar vírgulas ausentes entre objetos
      .replace(/}\s*{/g, '},{')
      // Remover comentários
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remover espaços extras
      .trim();
    
    return cleaned;
  }
  
  private createBasicMIDI(userPrompt: string, exerciseType: string = 'interval'): string {
    const basicMIDI = {
      events: [
        { type: "note", channel: 1, position: 0, data1: 60, data2: 80, duration: 480 },
        { type: "note", channel: 1, position: 960, data1: 67, data2: 80, duration: 480 }
      ],
      ppq: 480,
      tempo: 90,
      timeSignature: { numerator: 4, denominator: 4 },
      description: `Exercise generated by Groq`,
      correctAnswer: exerciseType === 'interval' ? 'P5' : 'Perfect Fifth'
    };
    
    return JSON.stringify(basicMIDI, null, 2);
  }
}