import { HomeContent } from '../components/home-content';
import { InstrumentProvider } from '../provider/instrument-provider';

export default function Component() {
  return (
    <InstrumentProvider>
      <HomeContent />
    </InstrumentProvider>
  );
}
