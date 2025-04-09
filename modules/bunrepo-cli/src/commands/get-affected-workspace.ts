import { getPackageJson, getRootDir } from '@ldlabs/utils';

type OutputFormat = {
  cwd: string;
  workspace: string;
  files: {
    absolutePath: string;
    relativePath: string;
  }[];
};

export async function getAffectedWorkspaces(format: 'verbose' | 'name-array') {
  const rootPkgJson = await getPackageJson();

  const workspaces = rootPkgJson.indexedWorkspaces ?? [];

  const promises = workspaces.map((ws) => {
    return new Promise<OutputFormat | undefined>((resolve) => {
      Bun.spawn({
        cmd: ['git', 'diff', '--quiet', '.'],
        cwd: ws.cwd,
        stdio: ['inherit', 'inherit', 'inherit'],
        onExit: async (info) => {
          if (info.exitCode === 1) {
            const allAffectedFiles = await getModifiedFiles(ws.cwd);

            resolve({
              cwd: ws.cwd,
              workspace: ws.name,
              files: allAffectedFiles ?? [],
            });
          }

          resolve(undefined);
        },
      });
    });
  });

  const results = await Promise.allSettled(promises);
  const affected = results.filter((x) => x.status === 'fulfilled' && x.value);

  if (format === 'name-array') {
    return (affected as PromiseFulfilledResult<OutputFormat>[]).reduce((acc, curr) => {
      return acc.concat(curr.value.files.map((x) => x.absolutePath));
    }, [] as string[]);
  }

  return (affected as PromiseFulfilledResult<OutputFormat>[]).map((x) => x.value);
}

type Args = {
  staged: boolean;
  unstaged: boolean;
  all: boolean;
};

async function getModifiedFiles(
  cwd: string,
  args: Args = { staged: true, unstaged: true, all: false },
) {
  const rootDir = getRootDir();
  const cmd = ['git', '--no-pager', 'diff', '--name-only'];
  if (!args.all) {
    if (args.staged && args.unstaged) {
      cmd.push('HEAD');
    } else if (args.staged && !args.unstaged) {
      cmd.push('--cached');
    }
  }

  // cmd: git --no-pager diff --name-only (HEAD | --cached | '') path/to/dir
  const proc = Bun.spawn([...cmd, cwd], {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  if (stderr) {
    console.error('Failed to get diffed files', stderr);
  }

  const files = stdout?.split('\n').filter(Boolean) ?? [];

  return files.map((file) => ({
    relativePath: file,
    absolutePath: `${rootDir}/${file}`,
  }));
}
