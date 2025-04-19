import { useInstrumentContext } from '../provider/instrument-provider';
import { Note } from './note';

export function HomeContent() {
  const notes = useInstrumentContext();

  return (
    <div className="rounded-xl p-4 bg-white py-5 flex flex-wrap justify-center gap-4">
      {notes.map((note) => {
        return <Note key={note.index} note={note} />;
      })}
    </div>
  );
}
