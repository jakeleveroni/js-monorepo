import { useCallback, useState } from 'react';
import { type IntrumentKey, useInstrumentContext } from '../provider/instrument-provider';

type Props = {
  key: number;
  note: IntrumentKey;
};

const context = new window.AudioContext();
export function Note({ note }: Props) {
  const [osc, setOsc] = useState(context.createOscillator());
  const notes = useInstrumentContext();

  const handleButtonPress = useCallback(
    (index: number) => {
      const note = notes?.find((x) => x.index === index);
      note?.getOscillator(index, osc, context).start();
    },
    [notes, osc],
  );

  const handleButtonRelease = useCallback(
    (index: number) => {
      const note = notes?.find((x) => x.index === index);
      note?.getOscillator(index, osc, context).stop();
      setOsc(context.createOscillator());
    },
    [notes, osc],
  );

  return (
    <>
      <button
        className="bg-black text-white rounded-xl p-4"
        key={note.index}
        type="button"
        onMouseDown={() => {
          handleButtonPress(note.index);
        }}
        onMouseUp={() => {
          handleButtonRelease(note.index);
        }}
      >
        Note {note.index}
      </button>
    </>
  );
}
