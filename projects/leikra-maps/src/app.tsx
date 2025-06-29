import { Card, CardContent } from '@/components/ui/card';
import './index.css';

import { MapLegend } from './components/legend';
import { MapGrid } from './components/map-grid';
import { Button } from './components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from './components/ui/drawer';

export function App() {
  return (
    <div className="text-center p-32">
      <Card
        className="bg-neutral-100 border border-teal-500 rounded-md p-6 animate-pulse/10"
        style={{
          boxShadow: `
         0 0 20px rgba(20, 184, 166, 0.6),
         0 0 30px rgba(20, 184, 166, 0.4),
         0 0 40px rgba(20, 184, 166, 0.3)
       `,
        }}
      >
        <CardContent className="pt-6">
          <Drawer direction="right">
            <div className="w-full flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold my-4 leading-tight">Map Editor</h1>
              </div>
              <div>
                <DrawerTrigger>
                  <Button>Edit Hotkeys</Button>
                </DrawerTrigger>
              </div>
            </div>
            <MapGrid width={10} height={5} />
            <DrawerContent className="lg:min-w-[640px]">
              <MapLegend />
            </DrawerContent>
          </Drawer>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
