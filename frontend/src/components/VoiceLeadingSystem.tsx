// src/components/VoiceLeadingSystem.tsx - VERSÃO COM VOICE LEADING MELHORADO

// (As interfaces e o CHORD_SYMBOLS permanecem os mesmos da versão anterior)
export interface ChordSymbol {
  root: string;
  quality: string;
  extensions: string[];
  display: string;
}
export interface ChordAnalysis {
  degree: string;
  symbol: string;
  voicing: number[];
  analysis: string;
}
const CHORD_SYMBOLS: Record<string, ChordSymbol> = {
  'I':{root:'C',quality:'major',extensions:[],display:'C'},'i':{root:'C',quality:'minor',extensions:[],display:'Cm'},'I^maj7':{root:'C',quality:'major7',extensions:[],display:'Cmaj7'},'IV':{root:'F',quality:'major',extensions:[],display:'F'},'iv':{root:'F',quality:'minor',extensions:[],display:'Fm'},'V':{root:'G',quality:'major',extensions:[],display:'G'},'V7':{root:'G',quality:'dominant',extensions:[],display:'G7'},'vi':{root:'A',quality:'minor',extensions:[],display:'Am'},'vi7':{root:'A',quality:'minor7',extensions:[],display:'Am7'},'ii7':{root:'D',quality:'minor7',extensions:[],display:'Dm7'},'iii7':{root:'E',quality:'minor7',extensions:[],display:'Em7'},'I7':{root:'C',quality:'dominant',extensions:[],display:'C7'},'IV7':{root:'F',quality:'dominant',extensions:[],display:'F7'},'IV^maj7':{root:'F',quality:'major7',extensions:[],display:'Fmaj7'},'VI7':{root:'A',quality:'dominant',extensions:[],display:'A7'},'i^add9':{root:'C',quality:'minor',extensions:['9'],display:'Cm(add9)'},'iv^add9':{root:'F',quality:'minor',extensions:['9'],display:'Fm(add9)'},'V7sus4':{root:'G',quality:'dominant',extensions:['sus4'],display:'G7sus4'},'bII^maj7':{root:'Db',quality:'major7',extensions:[],display:'Dbmaj7'},'bVII':{root:'Bb',quality:'major',extensions:[],display:'Bb'},'ii7b5':{root:'D',quality:'half-diminished',extensions:[],display:'Dm7(b5)'},'i^maj7':{root:'C',quality:'minor-major7',extensions:[],display:'Cm(maj7)'},'vii°7':{root:'B',quality:'diminished7',extensions:[],display:'Bdim7'},'bIII^maj7':{root:'Eb',quality:'major7',extensions:[],display:'Ebmaj7'},'bVI^maj7':{root:'Ab',quality:'major7',extensions:[],display:'Abmaj7'},'bVII^maj7':{root:'Bb',quality:'major7',extensions:[],display:'Bbmaj7'},'bIII°7':{root:'Eb',quality:'diminished7',extensions:[],display:'Ebdim7'},'III7':{root:'E',quality:'dominant',extensions:[],display:'E7'},'bII7':{root:'Db',quality:'dominant',extensions:[],display:'Db7'},'V7alt':{root:'G',quality:'dominant',extensions:['alt'],display:'G7alt'},'I^maj7#11':{root:'C',quality:'major7',extensions:['#11'],display:'Cmaj7(#11)'},'V7#9':{root:'G',quality:'dominant',extensions:['#9'],display:'G7(#9)'},'V7#11':{root:'G',quality:'dominant',extensions:['#11'],display:'G7(#11)'},
};

function getNotesForChord(symbol: ChordSymbol, octave: number = 4): number[] {
  const rootMap: Record<string,number>={'C':0,'Db':1,'D':2,'Eb':3,'E':4,'F':5,'F#':6,'G':7,'Ab':8,'A':9,'Bb':10,'B':11};
  const baseMidi = 12 * octave + rootMap[symbol.root];
  const qualityIntervals: Record<string,number[]>={'major':[0,4,7],'minor':[0,3,7],'dominant':[0,4,7,10],'major7':[0,4,7,11],'minor7':[0,3,7,10],'minor-major7':[0,3,7,11],'diminished':[0,3,6],'diminished7':[0,3,6,9],'half-diminished':[0,3,6,10]};
  const extensionIntervals: Record<string,number>={'9':14,'b9':13,'#9':15,'11':17,'#11':18,'13':21,'b13':20,'b5':6,'#5':8,'sus4':5};
  const notes=new Set(qualityIntervals[symbol.quality]||qualityIntervals.major);
  for(const ext of symbol.extensions){if(ext==='sus4'){notes.delete(3);notes.delete(4);notes.add(extensionIntervals.sus4)}else if(ext==='alt'){notes.add(extensionIntervals.b9);notes.add(extensionIntervals['#9']);notes.add(extensionIntervals['#5'])}else if(extensionIntervals[ext]){notes.add(extensionIntervals[ext])}}
  return Array.from(notes).map(i=>baseMidi+i).sort((a,b)=>a-b)
}

class VoiceLeader {
  private previousVoicing: number[] | null = null;
  private readonly idealCenter = 60; // Dó central (Middle C)

  public findBestVoicing(currentNotes: number[]): number[] {
    if (!this.previousVoicing) {
      this.previousVoicing = currentNotes;
      return currentNotes;
    }
    let bestVoicing = currentNotes;
    let minScore = Infinity;

    // Gera e testa inversões em diferentes oitavas para encontrar a mais adequada
    for (let oct = -1; oct <= 1; oct++) {
      for (let i = 0; i < currentNotes.length; i++) {
        const inversion = this.invert(currentNotes, i).map(n => n + (12 * oct));
        
        // CORREÇÃO: O score agora considera a distância e a proximidade do centro do piano
        const distance = this.calculateDistance(this.previousVoicing, inversion);
        const centering = Math.abs(this.getAverageMidi(inversion) - this.idealCenter);
        const score = distance + centering * 0.5; // Pondera a distância e a centralização

        if (score < minScore) {
          minScore = score;
          bestVoicing = inversion;
        }
      }
    }
    this.previousVoicing = bestVoicing;
    return bestVoicing;
  }
  private getAverageMidi(notes: number[]): number {
    return notes.reduce((a, b) => a + b, 0) / notes.length;
  }
  private invert(notes: number[], inversionCount: number): number[] {
    const newNotes=[...notes];for(let i=0;i<inversionCount;i++){if(newNotes.length>0)newNotes.push(newNotes.shift()!+12)}return newNotes
  }
  private calculateDistance(prev:number[],current:number[]):number{let d=0;for(let i=0;i<Math.min(prev.length,current.length);i++){d+=Math.abs(prev[i]-current[i])}return d}
  public reset(){this.previousVoicing=null}
}

const voiceLeader = new VoiceLeader();
export function resetVoiceLeading() { voiceLeader.reset(); }

export function analyzeProgression(degrees: string[]): ChordAnalysis[] {
  resetVoiceLeading();
  return degrees.map((degree: string): ChordAnalysis => {
    const symbolInfo = CHORD_SYMBOLS[degree] || { root: 'C', quality: 'major', extensions: [], display: '?' };
    const notes = getNotesForChord(symbolInfo);
    const voicing = voiceLeader.findBestVoicing(notes);
    let analysis='Tônica';if(degree.includes('V'))analysis='Dominante';if(degree.includes('IV')||degree.includes('ii'))analysis='Subdominante';if(degree.includes('vi'))analysis='Relativo Menor';
    return { degree, symbol: symbolInfo.display, voicing, analysis };
  });
}

export function formatChordSymbol(degree: string): string {
  const symbol = CHORD_SYMBOLS[degree];
  return symbol ? symbol.display : degree;
}