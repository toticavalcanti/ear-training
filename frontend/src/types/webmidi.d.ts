declare namespace WebMidi {
    interface MIDIOptions {
      sysex?: boolean;
      software?: boolean;
    }
  
    interface MIDIMessageEvent extends Event {
      data: Uint8Array;
    }
  
    interface MIDIPort extends EventTarget {
      id: string;
      manufacturer?: string;
      name?: string;
      type: 'input' | 'output';
      version?: string;
      state: 'connected' | 'disconnected' | 'opened' | 'closed';
      connection: 'open' | 'closed' | 'pending';
      onstatechange: ((event: Event) => void) | null;
      open(): Promise<MIDIPort>;
      close(): Promise<MIDIPort>;
    }
  
    interface MIDIInput extends MIDIPort {
      type: 'input';
      onmidimessage: ((event: MIDIMessageEvent) => void) | null;
    }
  
    interface MIDIOutput extends MIDIPort {
      type: 'output';
      send(data: number[] | Uint8Array, timestamp?: number): void;
      clear(): void;
    }
  
    interface MIDIAccess extends EventTarget {
      inputs: Map<string, MIDIInput>;
      outputs: Map<string, MIDIOutput>;
      onstatechange: ((event: Event) => void) | null;
      sysexEnabled: boolean;
    }
  }
  
  interface Navigator {
    requestMIDIAccess(options?: WebMidi.MIDIOptions): Promise<WebMidi.MIDIAccess>;
  }

  interface Window {
  simplePiano: {
    noteOn: (midiNote: number, velocity?: number, when?: number) => void;
    noteOff: (midiNote: number, when?: number) => void;
    stopAllNotes: () => void;
    getContext: () => AudioContext | null;
  };
}