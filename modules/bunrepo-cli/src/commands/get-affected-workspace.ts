import getPackageJson from '../infra/get-package-json';
import getRootDir from '../infra/get-root-dir';

const rootDir = getRootDir();
const rootPkgJson = await getPackageJson();

const workspaces = rootPkgJson.indexedWorkspaces ?? [];
const affected: Array<{
  cwd: string;
  workspace: string;
  files: Array<{ relativePath: string; absolutePath: string }>;
}> = [];

export async function getAffectedWorkspaces() {
  const promises = workspaces.map((ws) => {
    return new Promise(async (resolve) => {
      Bun.spawn({
        cmd: ['git', 'diff', '--quiet', '.'],
        cwd: ws.cwd,
        stdio: ['inherit', 'inherit', 'inherit'],
        onExit: async (info) => {
          if (info.exitCode === 1) {
            const allAffectedFiles = await getModifiedFiles(ws.cwd);
            affected.push({
              cwd: ws.cwd,
              workspace: ws.name,
              files: allAffectedFiles ?? [],
            });
          }
          resolve(true);
        },
      });
    });
  });

  await Promise.allSettled(promises);
  return affected;
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
