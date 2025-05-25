"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLLMExercise = exports.generateRhythmicExercise = exports.generateMelodicExercise = exports.generateProgressionExercise = exports.generateIntervalExercise = void 0;
const llm_1 = require("./llm");
const midiHumanizer_1 = require("./midiHumanizer");
// Constantes para geração de exercícios (manter as já existentes no seu código)
const INTERVALS = [
    { name: 'Uníssono', semitones: 0, premium: false },
    { name: 'Segunda Menor', semitones: 1, premium: false },
    { name: 'Segunda Maior', semitones: 2, premium: false },
    { name: 'Terça Menor', semitones: 3, premium: false },
    { name: 'Terça Maior', semitones: 4, premium: false },
    { name: 'Quarta Justa', semitones: 5, premium: false },
    { name: 'Trítono', semitones: 6, premium: true },
    { name: 'Quinta Justa', semitones: 7, premium: false },
    { name: 'Sexta Menor', semitones: 8, premium: true },
    { name: 'Sexta Maior', semitones: 9, premium: true },
    { name: 'Sétima Menor', semitones: 10, premium: true },
    { name: 'Sétima Maior', semitones: 11, premium: true },
    { name: 'Oitava', semitones: 12, premium: false }
];
const CHORD_PROGRESSIONS = {
    beginner: [
        { numerals: ['I', 'IV', 'V', 'I'], premium: false },
        { numerals: ['I', 'vi', 'IV', 'V'], premium: false },
        { numerals: ['I', 'V', 'vi', 'IV'], premium: false },
    ],
    intermediate: [
        { numerals: ['ii', 'V', 'I'], premium: true },
        { numerals: ['I', 'vi', 'ii', 'V'], premium: true },
        { numerals: ['I', 'IV', 'ii', 'V7'], premium: true },
    ],
    advanced: [
        { numerals: ['iii', 'vi', 'ii', 'V', 'I'], premium: true },
        { numerals: ['I', 'V/vi', 'vi', 'V/V', 'V', 'I'], premium: true }, // Com dominantes secundários
        { numerals: ['I', 'bVII', 'bVI', 'V'], premium: true }, // Empréstimo modal
    ]
};
// Função aprimorada para gerar exercício de intervalos (adicionando MIDI humanizado)
const generateIntervalExercise = (difficulty = 'beginner', isPremium = false) => {
    // Filtrar intervalos com base no nível de dificuldade e status premium
    let availableIntervals = INTERVALS.filter(interval => {
        if (interval.premium && !isPremium)
            return false;
        if (difficulty === 'beginner') {
            return interval.semitones <= 7 && !interval.premium;
        }
        else if (difficulty === 'intermediate') {
            return interval.semitones <= 12;
        }
        else { // advanced
            return true; // Todos os intervalos
        }
    });
    // Se não houver intervalos disponíveis, use os básicos
    if (availableIntervals.length === 0) {
        availableIntervals = INTERVALS.filter(i => !i.premium);
    }
    // Selecionar um intervalo aleatório
    const selectedInterval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
    // Nota base (C4 = 60 em MIDI)
    const baseNote = 60 + Math.floor(Math.random() * 12); // Notas de C4 a B4
    // Determinar se o intervalo é ascendente ou descendente
    const isAscending = Math.random() > 0.5;
    // Calcular a segunda nota
    const secondNote = isAscending
        ? baseNote + selectedInterval.semitones
        : baseNote - selectedInterval.semitones;
    // Criar a sequência MIDI básica
    const midiSequence = {
        events: [
            {
                type: 'note',
                channel: 1,
                position: 0,
                data1: baseNote,
                data2: 80,
                duration: 480
            },
            {
                type: 'note',
                channel: 1,
                position: 960,
                data1: secondNote,
                data2: 80,
                duration: 480
            }
        ],
        ppq: 480,
        tempo: 90,
        timeSignature: { numerator: 4, denominator: 4 },
        description: `${selectedInterval.name} ${isAscending ? 'ascendente' : 'descendente'}`,
        correctAnswer: selectedInterval.name
    };
    // Aplicar humanização à sequência MIDI
    const humanizedSequence = midiHumanizer_1.MidiHumanizer.humanizeByType(midiSequence, 'interval');
    return {
        type: 'interval',
        difficulty: difficulty,
        content: {
            notes: [baseNote, secondNote],
            intervals: [selectedInterval.name],
            midiSequence: humanizedSequence
        },
        answer: selectedInterval.name,
        requiresPremium: selectedInterval.premium
    };
};
exports.generateIntervalExercise = generateIntervalExercise;
// Função aprimorada para gerar exercício de progressão de acordes (adicionando MIDI humanizado)
const generateProgressionExercise = (difficulty = 'beginner', isPremium = false) => {
    // Filtrar progressões com base no nível de dificuldade e status premium
    let availableProgressions = CHORD_PROGRESSIONS[difficulty] || CHORD_PROGRESSIONS.beginner;
    if (!isPremium) {
        availableProgressions = availableProgressions.filter(prog => !prog.premium);
    }
    // Se não houver progressões disponíveis, use as básicas
    if (availableProgressions.length === 0) {
        availableProgressions = CHORD_PROGRESSIONS.beginner.filter(p => !p.premium);
    }
    // Selecionar uma progressão aleatória
    const selectedProgression = availableProgressions[Math.floor(Math.random() * availableProgressions.length)];
    // Tonalidade base (C = 0, C# = 1, etc.)
    const keyOffset = Math.floor(Math.random() * 12);
    const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyName = keyNames[keyOffset];
    // Criar lista de acordes em notação
    const chords = selectedProgression.numerals.map(numeral => `${numeral} (${keyName})`);
    // Criar a sequência MIDI básica para a progressão
    // (simplificada para demonstração - em um caso real, construiríamos acordes completos)
    const midiSequence = {
        events: [],
        ppq: 480,
        tempo: 90,
        timeSignature: { numerator: 4, denominator: 4 },
        description: `Progressão: ${selectedProgression.numerals.join(' - ')} em ${keyName}`,
        correctAnswer: selectedProgression.numerals.join(' - ')
    };
    // Adicionar eventos para cada acorde (simplificado)
    selectedProgression.numerals.forEach((numeral, index) => {
        // Base do acorde (C = 60, etc.) - simplificado
        const rootNote = 60 + keyOffset;
        // Adicionar acorde (simplificado: apenas tríades básicas)
        midiSequence.events.push({
            type: 'note',
            channel: 1,
            position: index * 1920,
            data1: rootNote,
            data2: 80,
            duration: 1440
        });
        // Terceira
        midiSequence.events.push({
            type: 'note',
            channel: 1,
            position: index * 1920,
            data1: rootNote + (numeral.includes('m') ? 3 : 4), // menor ou maior
            data2: 75,
            duration: 1440
        });
        // Quinta
        midiSequence.events.push({
            type: 'note',
            channel: 1,
            position: index * 1920,
            data1: rootNote + 7,
            data2: 70,
            duration: 1440
        });
    });
    // Aplicar humanização à sequência MIDI
    const humanizedSequence = midiHumanizer_1.MidiHumanizer.humanizeByType(midiSequence, 'progression');
    return {
        type: 'progression',
        difficulty: difficulty,
        content: {
            chords: chords,
            midiSequence: humanizedSequence
        },
        answer: selectedProgression.numerals,
        requiresPremium: selectedProgression.premium
    };
};
exports.generateProgressionExercise = generateProgressionExercise;
// Função aprimorada para gerar exercício de ditado melódico (adicionando MIDI humanizado)
const generateMelodicExercise = (difficulty = 'beginner', isPremium = false) => {
    // Definir número de notas com base na dificuldade
    let noteCount = 3; // Padrão para iniciante
    if (difficulty === 'intermediate')
        noteCount = 4;
    if (difficulty === 'advanced')
        noteCount = 5;
    // Determinar se é premium com base na dificuldade
    const requiresPremium = difficulty !== 'beginner';
    // Se o usuário não é premium e o exercício requer premium, reduza a dificuldade
    if (requiresPremium && !isPremium) {
        noteCount = 3;
    }
    // Gerar notas aleatórias em uma escala pentatônica de C (MIDI: 60, 62, 64, 67, 69)
    const pentatonic = [60, 62, 64, 67, 69, 72, 74];
    const notes = [];
    for (let i = 0; i < noteCount; i++) {
        notes.push(pentatonic[Math.floor(Math.random() * pentatonic.length)]);
    }
    // Criar a sequência MIDI para a melodia
    const midiSequence = {
        events: [],
        ppq: 480,
        tempo: 90,
        timeSignature: { numerator: 4, denominator: 4 },
        description: `Melodia de ${noteCount} notas na escala pentatônica`,
        correctAnswer: notes.map(note => note.toString())
    };
    // Adicionar eventos para cada nota da melodia
    notes.forEach((note, index) => {
        midiSequence.events.push({
            type: 'note',
            channel: 1,
            position: index * 960,
            data1: note,
            data2: 80,
            duration: 480
        });
    });
    // Aplicar humanização à sequência MIDI
    const humanizedSequence = midiHumanizer_1.MidiHumanizer.humanizeByType(midiSequence, 'melodic');
    // Convertendo array de números para array de strings para compatibilidade
    const notesAsStrings = notes.map(note => note.toString());
    return {
        type: 'melodic',
        difficulty: difficulty,
        content: {
            notes: notes,
            midiSequence: humanizedSequence
        },
        answer: notesAsStrings,
        requiresPremium: requiresPremium && !isPremium ? false : requiresPremium
    };
};
exports.generateMelodicExercise = generateMelodicExercise;
// Função aprimorada para gerar exercício de ditado rítmico (adicionando MIDI humanizado)
const generateRhythmicExercise = (difficulty = 'beginner', isPremium = false) => {
    // Definir número de batidas com base na dificuldade
    let beatCount = 4; // Compasso 4/4 padrão
    let subdivisions = 2; // Divisão em colcheias para iniciante
    if (difficulty === 'intermediate') {
        subdivisions = 3; // Tercinas para intermediário
    }
    if (difficulty === 'advanced') {
        subdivisions = 4; // Semicolcheias para avançado
    }
    // Determinar se é premium com base na dificuldade e subdivisões
    const requiresPremium = difficulty !== 'beginner' || subdivisions > 2;
    // Se o usuário não é premium e o exercício requer premium, reduza a dificuldade
    let actualSubdivisions = subdivisions;
    if (requiresPremium && !isPremium) {
        actualSubdivisions = 2;
    }
    // Gerar padrão rítmico (array de durações em milissegundos)
    const rhythms = [];
    const baseValue = 500; // Valor base para semínima (ms)
    // Gerar o padrão rítmico básico
    for (let i = 0; i < beatCount; i++) {
        if (difficulty === 'beginner' || (requiresPremium && !isPremium)) {
            // Padrão simples: semínimas ou colcheias
            if (Math.random() > 0.5) {
                rhythms.push(baseValue); // Semínima
            }
            else {
                rhythms.push(baseValue / 2); // Colcheia
                rhythms.push(baseValue / 2); // Colcheia
            }
        }
        else if (difficulty === 'intermediate' && isPremium) {
            // Padrão intermediário: adiciona tercinas
            const pattern = Math.floor(Math.random() * 3);
            if (pattern === 0) {
                rhythms.push(baseValue); // Semínima
            }
            else if (pattern === 1) {
                rhythms.push(baseValue / 2); // Colcheia
                rhythms.push(baseValue / 2); // Colcheia
            }
            else {
                // Tercina
                rhythms.push(baseValue / 3);
                rhythms.push(baseValue / 3);
                rhythms.push(baseValue / 3);
            }
        }
        else if (difficulty === 'advanced' && isPremium) {
            // Padrão avançado: adiciona semicolcheias
            const pattern = Math.floor(Math.random() * 4);
            if (pattern === 0) {
                rhythms.push(baseValue); // Semínima
            }
            else if (pattern === 1) {
                rhythms.push(baseValue / 2); // Colcheia
                rhythms.push(baseValue / 2); // Colcheia
            }
            else if (pattern === 2) {
                // Tercina
                rhythms.push(baseValue / 3);
                rhythms.push(baseValue / 3);
                rhythms.push(baseValue / 3);
            }
            else {
                // Semicolcheias
                rhythms.push(baseValue / 4);
                rhythms.push(baseValue / 4);
                rhythms.push(baseValue / 4);
                rhythms.push(baseValue / 4);
            }
        }
    }
    // Criar a sequência MIDI para o ritmo
    const midiSequence = {
        events: [],
        ppq: 480,
        tempo: 90,
        timeSignature: { numerator: 4, denominator: 4 },
        description: `Padrão rítmico de ${beatCount} tempos`,
        correctAnswer: rhythms.map(rhythm => rhythm.toString())
    };
    // Adicionar eventos para cada batida do ritmo
    let currentPosition = 0;
    rhythms.forEach(duration => {
        // Converter duração de ms para ticks
        const durationInTicks = Math.round((duration / 1000) * midiSequence.ppq * 4);
        midiSequence.events.push({
            type: 'note',
            channel: 9, // Canal de percussão
            position: currentPosition,
            data1: 60, // Middle C ou highhat fechado
            data2: 100, // Volume alto para percussão
            duration: Math.min(durationInTicks, 120) // Duração curta para percussão
        });
        currentPosition += durationInTicks;
    });
    // Aplicar humanização à sequência MIDI
    const humanizedSequence = midiHumanizer_1.MidiHumanizer.humanizeByType(midiSequence, 'rhythmic');
    // Convertendo array de números para array de strings para compatibilidade
    const rhythmsAsStrings = rhythms.map(rhythm => rhythm.toString());
    return {
        type: 'rhythmic',
        difficulty: difficulty,
        content: {
            rhythms: rhythms,
            midiSequence: humanizedSequence
        },
        answer: rhythmsAsStrings,
        requiresPremium: requiresPremium && !isPremium ? false : requiresPremium
    };
};
exports.generateRhythmicExercise = generateRhythmicExercise;
// Função para gerar exercício usando LLM para MIDI (mantendo sua implementação atual)
const generateLLMExercise = async (type, difficulty = 'beginner', options = {}, isPremium = false) => {
    // Check if user is premium for advanced exercises
    if (difficulty !== 'beginner' && !isPremium) {
        // Use existing algorithmic generators for non-premium users
        switch (type) {
            case 'interval':
                return (0, exports.generateIntervalExercise)('beginner', false);
            case 'progression':
                return (0, exports.generateProgressionExercise)('beginner', false);
            case 'melodic':
                return (0, exports.generateMelodicExercise)('beginner', false);
            case 'rhythmic':
                return (0, exports.generateRhythmicExercise)('beginner', false);
        }
    }
    try {
        // Use LLM to generate complete MIDI sequence
        let midiSequence = await llm_1.LLMService.generateMIDISequence(type, difficulty, options);
        // Aplicar humanização adicional à sequência
        midiSequence = midiHumanizer_1.MidiHumanizer.humanizeByType(midiSequence, type);
        // Convert to the exercise format
        return {
            type,
            difficulty: difficulty,
            content: {
                // The complete MIDI sequence generated by the LLM
                midiSequence: midiSequence,
                // Keep existing fields for compatibility
                notes: extractNotes(midiSequence),
                intervals: type === 'interval' ? [midiSequence.description] : [],
                chords: type === 'progression' ? extractChordNames(midiSequence) : [],
                rhythms: type === 'rhythmic' ? extractRhythmValues(midiSequence) : []
            },
            answer: typeof midiSequence.correctAnswer === 'string'
                ? midiSequence.correctAnswer
                : Array.isArray(midiSequence.correctAnswer)
                    ? midiSequence.correctAnswer
                    : midiSequence.description,
            requiresPremium: difficulty !== 'beginner'
        };
    }
    catch (error) {
        console.error(`Error generating ${type} exercise via LLM:`, error);
        // Fallback to algorithmic generators in case of error
        switch (type) {
            case 'interval':
                return (0, exports.generateIntervalExercise)(difficulty, isPremium);
            case 'progression':
                return (0, exports.generateProgressionExercise)(difficulty, isPremium);
            case 'melodic':
                return (0, exports.generateMelodicExercise)(difficulty, isPremium);
            case 'rhythmic':
                return (0, exports.generateRhythmicExercise)(difficulty, isPremium);
            default:
                return (0, exports.generateIntervalExercise)(difficulty, isPremium);
        }
    }
};
exports.generateLLMExercise = generateLLMExercise;
// Helper functions to extract specific information from the MIDI sequence
function extractNotes(midiSequence) {
    return midiSequence.events
        .filter(e => e.type === 'note')
        .map(e => e.data1 || 60);
}
function extractChordNames(midiSequence) {
    // Extract chord names from description or metadata
    const description = midiSequence.description || '';
    const chordMatch = description.match(/chords?: (.*?)(?:\.|$)/i);
    if (chordMatch && chordMatch[1]) {
        return chordMatch[1].split(',').map(chord => chord.trim());
    }
    return [];
}
function extractRhythmValues(midiSequence) {
    // Extract rhythmic values (durations) from note events
    const ticksPerBeat = midiSequence.ppq || 480;
    return midiSequence.events
        .filter(e => e.type === 'note')
        .map(e => (e.duration || 0) / ticksPerBeat * 1000); // Convert to milliseconds
}
