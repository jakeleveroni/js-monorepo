import { file } from "bun";
import { join } from "path";
import getRootDir from "../../infra/get-root-dir";

// USAGE: Runs a script for a given workspace, worpsaces (comma separated), all workspaces or all minus a subset of workspaces
// EXAMPLE: bun run workspace (ws-name|ws-name,ws-name2...|-ws-name) (package.json-script-name)
//          bun run workspace foo
//          bun run workspace foo,bar
//          bun run workspace all
//          bun run workspace -bar
//          ^^ THIS RUNS ON EVERYTHING EXCEPT WORKSPEC "bar"
// NOTE: -ws-name syntax runs the script on everything except that workspace
const [, , workspace, script, ...passthroughs] = process.argv;

if (!script) {
  console.log("No script provided");
  process.exit(-1);
}

const runScriptForWorkspace = (w: string) =>
  new Promise<number>(async (resolve, reject) => {
    const rootDir = getRootDir();
    const wsPath = `${rootDir}/js-monorepo/${w}`;

    const stats = await file(wsPath).stat();
    if (!stats.isDirectory) {
      const err = `Unable to find workspace at "${rootDir}/js-monorepo/${w}"`;
      reject(err);
      return;
    }

    Bun.spawn({
      cmd: ["bun", "run", script, ...passthroughs],
      cwd: wsPath,
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

if (workspace.includes(",")) {
  const workspaces = workspace.split(",");
  for (const w of workspaces) {
    runScriptForWorkspace(w);
  }
} else if (workspace !== "all" && !workspace.startsWith("-")) {
  runScriptForWorkspace(workspace);
} else {
  const excluded = workspace.startsWith("-") && workspace.slice(1);

  const packageJson = JSON.parse(
    await file(join(import.meta.dir, "../package.json")).text()
  );

  const workspaces = packageJson.workspaces as string[];
  for (const w of workspaces) {
    if (w === excluded) continue;
    await runScriptForWorkspace(w);
  }
}
