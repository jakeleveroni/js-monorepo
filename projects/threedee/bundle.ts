await Bun.build({
  entrypoints: ['./src/main.tsx'],
  target: 'bun',
  outdir: './dist',
});

export {};
