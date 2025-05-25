"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidiHumanizer = void 0;
class MidiHumanizer {
    // VERSÃO ULTRA-CONSERVADORA - TIMING 100% PRESERVADO
    static humanize(midiSequence) {
        console.log("🛡️ ULTRA-SAFE HUMANIZER: Preservação TOTAL do timing");
        // Clonar PROFUNDAMENTE para não modificar o original
        const humanized = JSON.parse(JSON.stringify(midiSequence));
        // 🔒 BACKUP DAS POSIÇÕES ORIGINAIS - PROTEÇÃO ABSOLUTA
        const originalPositions = humanized.events.map(event => event.position);
        console.log("🔒 Posições originais protegidas:", originalPositions);
        // Humanizar APENAS velocidades e durações - ZERO alteração de timing
        humanized.events = humanized.events.map((event, index) => {
            if (event.type === 'note') {
                // Variação MÍNIMA de velocidade (±3)
                const velocityVariance = Math.floor(Math.random() * 6) - 3;
                // Variação MÍNIMA de duração (±2%)
                const durationFactor = 0.99 + (Math.random() * 0.02);
                return {
                    ...event,
                    // 🛡️ POSIÇÃO NUNCA ALTERADA - TIMING ABSOLUTO
                    position: originalPositions[index], // SEMPRE A ORIGINAL!
                    data2: Math.max(60, Math.min(100, (event.data2 || 80) + velocityVariance)),
                    duration: Math.floor((event.duration || 480) * durationFactor)
                };
            }
            // Para eventos de controle - também preservar posições
            return {
                ...event,
                position: originalPositions[index] // SEMPRE A ORIGINAL!
            };
        });
        // 🔍 VERIFICAÇÃO FINAL - GARANTIR QUE NENHUMA POSIÇÃO FOI ALTERADA
        const finalPositions = humanized.events.map(event => event.position);
        const positionsChanged = originalPositions.some((pos, i) => pos !== finalPositions[i]);
        if (positionsChanged) {
            console.error("🚨 ERRO: Posições foram alteradas!");
            console.error("Original:", originalPositions);
            console.error("Final:", finalPositions);
            // RESTAURAR posições originais em caso de erro
            humanized.events.forEach((event, i) => {
                event.position = originalPositions[i];
            });
        }
        else {
            console.log("✅ TIMING PRESERVADO - Nenhuma posição alterada");
        }
        // NÃO adicionar controles extras que possam afetar timing
        // Apenas humanizar o que já existe
        console.log("🛡️ Humanização ultra-segura completa");
        return humanized;
    }
    // Versão simplificada que APENAS preserva timing
    static humanizeByType(midiSequence, exerciseType) {
        console.log(`🛡️ ULTRA-SAFE humanização para: ${exerciseType}`);
        // Usar apenas a humanização base ultra-segura
        const humanized = this.humanize(midiSequence);
        // Aplicar humanizações específicas SEM AFETAR TIMING
        switch (exerciseType) {
            case 'interval':
                return this.humanizeIntervalsUltraSafe(humanized);
            case 'rhythmic':
                return this.humanizeRhythmsUltraSafe(humanized);
            case 'melodic':
                return this.humanizeMelodiesUltraSafe(humanized);
            case 'progression':
                return this.humanizeProgressionsUltraSafe(humanized);
            default:
                return humanized;
        }
    }
    // Humanizações específicas ULTRA-SEGURAS (sem afetar timing)
    static humanizeIntervalsUltraSafe(midiSequence) {
        const noteEvents = midiSequence.events.filter(e => e.type === 'note');
        if (noteEvents.length >= 2) {
            // Encontrar a segunda nota e torná-la ligeiramente mais suave
            const secondNoteIndex = midiSequence.events.findIndex(e => e.type === 'note' && e === noteEvents[1]);
            if (secondNoteIndex !== -1) {
                const currentVelocity = midiSequence.events[secondNoteIndex].data2 || 80;
                midiSequence.events[secondNoteIndex] = {
                    ...midiSequence.events[secondNoteIndex],
                    data2: Math.max(65, Math.floor(currentVelocity * 0.93)) // -7%
                };
            }
        }
        return midiSequence;
    }
    static humanizeRhythmsUltraSafe(midiSequence) {
        const noteEvents = midiSequence.events.filter(e => e.type === 'note');
        noteEvents.forEach((note, i) => {
            const eventIndex = midiSequence.events.findIndex(e => e === note);
            if (eventIndex !== -1) {
                // Acentos rítmicos baseados em posição musical
                const position = note.position || 0;
                const isDownbeat = position === 0; // Primeiro tempo
                const isStrongBeat = position % 960 === 0; // Tempos fortes
                let velocityMultiplier = 1.0;
                if (isDownbeat)
                    velocityMultiplier = 1.06;
                else if (isStrongBeat)
                    velocityMultiplier = 1.03;
                else
                    velocityMultiplier = 0.97;
                const currentVelocity = note.data2 || 80;
                midiSequence.events[eventIndex] = {
                    ...midiSequence.events[eventIndex],
                    data2: Math.max(70, Math.min(110, Math.floor(currentVelocity * velocityMultiplier)))
                };
            }
        });
        return midiSequence;
    }
    static humanizeMelodiesUltraSafe(midiSequence) {
        const noteEvents = midiSequence.events.filter(e => e.type === 'note');
        noteEvents.forEach((note, i) => {
            const eventIndex = midiSequence.events.findIndex(e => e === note);
            if (eventIndex !== -1) {
                // Criar frase musical simples
                const phrasePosition = i / Math.max(1, noteEvents.length - 1);
                const dynamicCurve = Math.sin(phrasePosition * Math.PI);
                const velocityMultiplier = 0.94 + (dynamicCurve * 0.12); // 94-106%
                const currentVelocity = note.data2 || 80;
                midiSequence.events[eventIndex] = {
                    ...midiSequence.events[eventIndex],
                    data2: Math.max(65, Math.min(105, Math.floor(currentVelocity * velocityMultiplier)))
                };
            }
        });
        return midiSequence;
    }
    static humanizeProgressionsUltraSafe(midiSequence) {
        // Para progressões, manter velocidades mais consistentes
        const noteEvents = midiSequence.events.filter(e => e.type === 'note');
        noteEvents.forEach(note => {
            const eventIndex = midiSequence.events.findIndex(e => e === note);
            if (eventIndex !== -1) {
                // Variação mínima para acordes (±2%)
                const velocityMultiplier = 0.98 + (Math.random() * 0.04);
                const currentVelocity = note.data2 || 80;
                midiSequence.events[eventIndex] = {
                    ...midiSequence.events[eventIndex],
                    data2: Math.max(70, Math.min(100, Math.floor(currentVelocity * velocityMultiplier)))
                };
            }
        });
        return midiSequence;
    }
}
exports.MidiHumanizer = MidiHumanizer;
