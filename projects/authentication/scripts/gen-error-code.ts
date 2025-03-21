import { parseArgs } from 'util';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    prefix: {
      type: 'string',
    },
    amt: {
      type: 'string',
      default: '5',
    },
    help: {
      type: 'boolean',
      default: false,
    },
  },
  allowPositionals: true,
});

// lol sounds smart
const lexicon = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let prefix = values.prefix ?? '';

if (!prefix) {
  for (let i = 0; i < 4; ++i) {
    const idx = Math.floor(Math.random() * 26);
    prefix += lexicon[idx];
  }
}

const codes = [];
for (let i = 0; i < Number(values.amt); ++i) {
  codes.push(`${prefix}-${i.toString().padStart(4, '0')}`);
}

console.log(`Codes:

${codes.join('\n')}
`);
