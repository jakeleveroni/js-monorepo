import { file } from "bun";
import { parseArgs } from "util";
import getPackageJson from "../infra/get-package-json";
import parsePassthroughs from "../infra/parse-passthroughs";

const { values, tokens } = parseArgs({
  args: Bun.argv,
  options: {
    workspace: {
      type: "string",
      short: "w",
      multiple: true,
    },
    script: {
      type: "string",
      short: "s",
      multiple: false,
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
  },
  strict: true,
  allowPositionals: true,
  tokens: true,
});

await run();

async function run() {
  const rootPkgJson = await getPackageJson();
  if (values.help) {
    console.log(`
      A cli command that enables running project level scripts from the root of the repository
      NOTE: Be sure that the "script-name" you specify exists in the workspaces scripts/ directory.
      SETUP: Add the following to your package.json scripts object
        
        "scripts": {
          "ws": "bun run scripts/workspace.ts"
        }

      USAGE: 

        // runs a script defined in the specified apps package.json
        bun run ws -w app-name -s script-name

        // run a workspace level script, this is useful when the workspace level script requires more or more complex inputs
        bun run ws -w app-name -s script-name -- --additional-flags
      
    `);
    process.exit(0);
  }

  if (!values.script) {
    console.error("No script detected");
    return;
  }

  const passthroughs = parsePassthroughs(tokens ?? []);

  if (!values.workspace) {
    console.error(
      "No workspaces provided. Specify any number of workspaces with: --workspace | -w"
    );
    process.exit(-1);
  }

  for (const ws of values.workspace ?? []) {
    const cwd = rootPkgJson.indexedWorkspaces?.find(
      (x) => x.aliases.includes(ws) || x.name.endsWith(ws)
    )?.cwd;
    if (!cwd) {
      console.warn(
        "Unable to run command, workspace not found in root package.json workspaces",
        ws
      );
      continue;
    }

    await runWorkspaceScript(cwd, passthroughs);
  }
}

async function runWorkspaceScript(cwd: string, passthrough: string[]) {
  new Promise<number>(async (resolve, reject) => {
    const stats = await file(cwd).stat();
    if (!stats.isDirectory) {
      const err = `Unable to find workspace: "${cwd}}"`;
      reject(err);
      return;
    }

    let isPkgJsonScript = true;
    try {
      await file(`${cwd}/scripts/${values.script}.ts`).stat();
      isPkgJsonScript = false;
    } catch {
      console.log("No script file found, running as package.json script");
    }

    Bun.spawn({
      cmd: [
        "bun",
        "run",
        isPkgJsonScript ? values.script! : `scripts/${values.script!}.ts`,
        ...passthrough,
      ],
      cwd,
      stdio: ["inherit", "inherit", "inherit"],
      onExit(info) {
        if (info.exitCode !== 0) {
          console.log("The script failed", info.exitCode);
          reject(info.exitCode);
        } else {
          console.log("The script ran successfully");
          resolve(info.exitCode);
        }
      },
    });
  });
}
