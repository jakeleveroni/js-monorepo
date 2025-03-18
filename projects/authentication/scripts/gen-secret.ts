const hasher = new Bun.CryptoHasher('sha512');
import { parseArgs } from 'util';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    input: {
      type: 'string',
    },
    help: {
      type: 'boolean',
    },
  },
  strict: true,
  allowPositionals: true,
});

if (values.help) {
  console.log(`
    Example usage:

      bun run gen-secrets.ts --input "your secret phrase here"
  `);
  process.exit(0);
}

if (!values.input) {
  console.error('--input is required for this command. The secret is generated from your input.');
  process.exit(-1);
}

hasher.update(values.input);
const secret = hasher.digest('hex');

console.log(`Secret generated:

  ${secret}

dont lose your input value or you wont be able to re-generate it.
`);
