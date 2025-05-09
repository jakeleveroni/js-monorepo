#! /usr/bin/env bun
import { parseArgs } from 'util';
import { type BunfigLifecycleHook, parsePassthroughs } from '@ldlabs/utils';
import yargs, { type MiddlewareFunction } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getAffectedWorkspaces } from './commands/get-affected-workspace';
import { runWorkload } from './commands/run';
import { getTasks } from './commands/tasks';
import { workspaces } from './commands/workspaces';

type WorkspaceCmdType = {
  workspaces: string[];
  script: string;
  passthroughs: string[];
};

type TaskCmdType = {
  workspaces: string[];
  trigger: string;
  all: boolean;
  passthroughs: string[];
};

type AffectedCmdType = {
  format: 'verbose' | 'name-array';
};

type RunWorkspaceWorkloadCmdType = {
  workload: string;
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
  .command<TaskCmdType>(
    ['tasks'],
    'Derives tasks based on the specified workspaces and trigger',
    (yargs) =>
      yargs
        .option('all', {
          description: 'Flag indicating all workspaces, default false',
          type: 'boolean',
          alias: 'a',
          default: false,
        })
        .option('log', {
          description: 'Flag indicating whether or not to log, default false.',
          type: 'boolean',
          alias: 'l',
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
    async (argv) => {
      await getTasks({
        workspaces: argv.workspaces,
        all: argv.all,
        trigger: argv.trigger as BunfigLifecycleHook,
      });
    },
  )
  .command<RunWorkspaceWorkloadCmdType>(
    ['run', 'exec'],
    'Executes a given workspace workload object',
    (yargs) =>
      yargs.option('workload', {
        description: 'The workload as a JSON string',
        type: 'string',
        alias: 'w',
        demandOption: true,
      }),
    // TODO: add a list command to list all commands
    async (argv) => {
      runWorkload(argv.workload, true);
    },
  )
  .command<AffectedCmdType>(
    ['affected', 'diff'],
    'Derives which workspaces were affected from githubs perspective. Currently does not take into account a dependency graph.',
    (yargs) => {
      yargs.option('format', {
        description: 'The format you want the output in: verbose | name-array',
        type: 'string',
        alias: 'f',
        default: 'verbose',
        choices: ['verbose', 'name-array'],
      });
    },
    async (argv) => {
      console.log('Affected workspaces:');
      console.log(JSON.stringify(await getAffectedWorkspaces(argv.format), null, 2));
    },
  )
  // TODO: add a list command to list all commands
  .parse();
