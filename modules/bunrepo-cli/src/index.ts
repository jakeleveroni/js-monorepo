#! /usr/bin/env bun
import { parseArgs } from 'util';
import { parsePassthroughs } from '@ldlabs/utils';
import yargs, { type MiddlewareFunction } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { workspaces } from './commands/workspaces';
import { getAffectedWorkspaces } from './commands/get-affected-workspace';

type WorkspaceCmdType = {
  workspaces: string[];
  script: string;
  passthroughs: string[];
};

const passthroughMiddleware: MiddlewareFunction = (argv) => {
  const { tokens } = parseArgs({ argv: Bun.argv, tokens: true, strict: false });
  const passthroughs = parsePassthroughs(tokens);
  argv.passthroughs = passthroughs;
};

yargs(hideBin(process.argv))
  .middleware(passthroughMiddleware)
  .command<WorkspaceCmdType>(
    ['workspace', 'ws'],
    'Run commands across specified workspaces',
    (yargs) =>
      yargs
        .option('workspaces', {
          description: 'The workspaces to run the specified script on',
          type: 'string',
          alias: 'w',
          array: true,
          demandOption: true,
        })
        .option('script', {
          description: 'The script to run on the workspaces',
          type: 'string',
          alias: 's',
          demandOption: true,
        }),
    (argv) => {
      workspaces(argv.workspaces, argv.script, argv.passthroughs);
    },
  )
  .command<WorkspaceCmdType>(
    ['tasks'],
    'Derives tasks based on the specified workspaces and trigger',
    (yargs) =>
      yargs
        .option('all', {
          description: 'Flag indicating all workspaces',
          type: 'boolean',
          alias: 'a',
          default: false,
        })
        .option('workspaces', {
          description: 'The workspaces to run the specified script on',
          type: 'string',
          alias: 'w',
          array: true,
        })
        .option('trigger', {
          description: 'The bunrepo lifecycle trigger to run',
          type: 'string',
          alias: 't',
          demandOption: true,
        }),
    (argv) => {
      getAffectedWorkspaces();
    },
  )
  .command<WorkspaceCmdType>(
    ['affected', 'diff'],
    'Derives which workspaces were affected from githubs perspective. Currently does not take into account a dependency graph.',
    (yargs) => {},
    async (argv) => console.log(JSON.stringify(await getAffectedWorkspaces(), null, 2)),
  )
  .parse();
