import { type PropsWithChildren, createContext, useContext } from 'react';

export type IntrumentKey = {
  pressed: boolean;
  sound: string;
  index: number;
  getOscillator: (index: number, osc: OscillatorNode, context: AudioContext) => OscillatorNode;
};

const MAX_NOTES = 64;

const notes: IntrumentKey[] = [];

function getOscillator(index: number, osc: OscillatorNode, context: AudioContext) {
  osc.type = 'sine';
  osc.frequency.value = 440 + index * 10;
  osc.connect(context.destination);
  return osc;
}

for (let i = 0; i < MAX_NOTES; ++i) {
  notes.push({ pressed: false, sound: 'NA', getOscillator, index: i });
}

const InstrumentContext = createContext(notes);

export function InstrumentProvider({ children }: PropsWithChildren) {
  return <InstrumentContext.Provider value={notes}>{children}</InstrumentContext.Provider>;
}

export function useInstrumentContext() {
  const ctx = useContext(InstrumentContext);

  if (!ctx) {
    throw new Error('later');
  }

  return ctx;
}
