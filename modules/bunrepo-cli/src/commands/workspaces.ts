import { getPackageJson } from '@ldlabs/utils';
import { file } from 'bun';

export async function workspaces(
  workspaces: string[],
  script: string,
  passthroughs: (string | number)[] = [],
) {
  const rootPkgJson = await getPackageJson();

  if (!script) {
    console.error('No script detected');
    return;
  }

  if (!workspaces || workspaces.length === 0) {
    console.error(
      'No workspaces provided. Specify any number of workspaces with: --workspace | -w',
    );
    process.exit(-1);
  }

  for (const ws of workspaces ?? []) {
    const cwd = rootPkgJson.indexedWorkspaces?.find(
      (x) => x.aliases.includes(ws) || x.name.endsWith(ws),
    )?.cwd;
    if (!cwd) {
      console.warn(
        'Unable to run command, workspace not found in root package.json workspaces',
        ws,
      );
      continue;
    }

    await runWorkspaceScript(cwd, script, passthroughs);
  }
}

async function runWorkspaceScript(cwd: string, script: string, passthrough: (string | number)[]) {
  new Promise<number>((resolve, reject) => {
    async function isPkgJsonScript() {
      const stats = await file(cwd).stat();
      if (!stats.isDirectory) {
        const err = `Unable to find workspace: "${cwd}}"`;
        reject(err);
        return false;
      }

      try {
        await file(`${cwd}/scripts/${script}.ts`).stat();
        return false;
      } catch {
        console.log('No script file found, running as package.json script');
        return true;
      }
    }

    isPkgJsonScript().then((isPkgScript) => {
      // console.debug('running', [
      //   'bun',
      //   'run',
      //   // biome-ignore lint/style/noNonNullAssertion: this is handled earlier in the script
      //   isPkgScript ? script! : `scripts/${script!}.ts`,
      //   ...(passthrough.length > 0 ? ['--', ...passthrough] : []),
      // ]);
      Bun.spawn({
        cmd: [
          'bun',
          'run',
          // biome-ignore lint/style/noNonNullAssertion: this is handled earlier in the script
          isPkgScript ? script! : `scripts/${script!}.ts`,
          ...passthrough.map(toString),
        ],
        cwd,
        stdio: ['inherit', 'inherit', 'inherit'],
        onExit(info) {
          if (info.exitCode !== 0) {
            console.log('The script failed', info.exitCode);
            reject(info.exitCode);
          } else {
            console.log('The script ran successfully');
            resolve(info.exitCode);
          }
        },
      });
    });
  }).catch((err) => {
    console.error('Failed to invoke workspace script', err);
  });
}
