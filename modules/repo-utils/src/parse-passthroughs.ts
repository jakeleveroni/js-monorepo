import type { parseArgs } from 'util';

export default function parsePassthroughs(
  tokens: Exclude<ReturnType<typeof parseArgs>['tokens'], undefined>,
) {
  const ptIndex = tokens.findIndex((x) => x.kind === 'option-terminator') ?? -1;
  const passthroughs =
    ptIndex > -1
      ? tokens
          .slice(ptIndex ?? tokens.length)
          .filter((x) => x.kind === 'option' || x.kind === 'positional')
          .map((x) => x.value)
          .filter((x) => x !== undefined)
      : [];

  return passthroughs;
}
