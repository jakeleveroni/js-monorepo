import { file } from 'bun';

async function build() {
  await Bun.build({
    entrypoints: ['./src/main.tsx'],
    target: 'browser', // Or your desired browser target
    outdir: './dist',
    packages: 'bundle',
  });

  const indexHtml = await file('./index.html').text();
  const transpiledIndexHtml = indexHtml
    .replaceAll('/src/main.tsx', './main.js')
    .replaceAll('/src/styles.css', './main.css');
  await file('./dist/index.html').write(transpiledIndexHtml);
}

build();
