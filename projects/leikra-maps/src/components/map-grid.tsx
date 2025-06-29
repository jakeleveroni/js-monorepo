type Props = {
  width: number;
  height: number;
};

export function MapGrid({ width, height }: Props) {
  const cells = new Array(width * height).fill(0);
  return (
    <div
      className="grid gap-2 border border-black rounded p-4"
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`,
      }}
    >
      {cells.map((_, idx) => {
        const row = Math.floor(idx / width);
        const col = idx % width;
        return <MapGridCell key={`${row}-${col}`} row={row} col={col} idx={idx} />;
      })}
    </div>
  );
}

function MapGridCell({ row, col, idx }: { row: number; col: number; idx: number }) {
  return (
    <div
      data-testid={`${row}-${col}`}
      className="size-full hover:bg-gray-200 text-center border border-gray-300 flex items-center justify-center text-sm aspect-square"
    >
      <span className="sr-only">{idx}</span>
    </div>
  );
}
