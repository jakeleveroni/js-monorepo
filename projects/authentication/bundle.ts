await Bun.build({
  entrypoints: ['./server.ts'],
  target: 'bun',
  outdir: './dist',
});
