import { Fragment, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const sprites = ['dirt-texture.png', 'grass-texture.png'];
const defaultHotkeys = [
  { key: 'd', sprite: 'dirt-texture.png' },
  { key: 'g', sprite: 'grass-texture.png' },
];

export function MapLegend() {
  const keyRef = useRef<HTMLInputElement>(null);
  const [selectedSprite, setSelectedSprite] = useState('');
  // TODO: move to provider
  const [associations, setAssociations] =
    useState<{ key: string; sprite: string }[]>(defaultHotkeys);

  const createNewAssociation = () => {
    const newKey = keyRef.current.value;
    setAssociations((prev) => [...prev, { key: newKey, sprite: selectedSprite }]);
    setSelectedSprite('');
  };

  return (
    <div className="size-full p-4 flex flex-col gap-y-8">
      <h2 className="font-bold text-2xl ">Hotkey Configuration</h2>
      <p>Custom hotkeys coming soon...</p>
      <div className="flex space-between gap-x-4">
        <Input ref={keyRef} className="max-w-[50%]" placeholder="Key to Bind i.e. 'F'" disabled />
        <Select onValueChange={setSelectedSprite} defaultValue="-" disabled>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="none" value="-">
              -
            </SelectItem>
            {sprites.map((sprite) => (
              <SelectItem key={sprite} value={sprite}>
                {sprite}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={createNewAssociation} disabled>
          Create
        </Button>
      </div>
      <div>
        <h3 className="font-bold text-xl mb-2">Current Hotkeys</h3>
        <div>
          {associations.length === 0 && <p className="text-neutral-500">No hotkeys configured</p>}
          {associations.length > 0 && (
            <dl className="">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="font-bold text-gray-900 sm:col-span-1">Key</dt>
                <dd className="font-bold text-gray-900 sm:col-span-2">Sprite</dd>
              </div>
              {associations.map((assoc) => (
                <div key={assoc.key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t p-2">
                  <dt className="text-gray-700 sm:col-span-1 border-r">{assoc.key}</dt>
                  <dd className="text-gray-700 sm:col-span-2">{assoc.sprite}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
