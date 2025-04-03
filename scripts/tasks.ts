import { file } from "bun";
import { parseArgs } from "util";
import type { BunfigLifecycleHook, BunrepoConfig } from "../bunrepo-config";
import getPackageJson, { IndexedWorkspaces } from "../infra/get-package-json";
import parsePassthroughs from "../infra/parse-passthroughs";

type Task = {
  cmd: string[];
  workspace: string;
  cwd: string;
  passthroughs: string[];
};

const VALID_TRIGGERS: Record<BunfigLifecycleHook, true> = {
  pullrequest: true,
  build: true,
  finalize: true,
  postbuild: true,
  prebuild: true,
};

const { values, tokens } = parseArgs({
  args: Bun.argv,
  options: {
    workspaces: {
      type: "string",
      short: "w",
      multiple: true,
    },
    all: {
      type: "boolean",
      short: "a",
      multiple: false,
      default: false,
    },
    trigger: {
      type: "string",
      short: "t",
      multiple: false,
    },
    help: {
      type: "boolean",
      short: "h",
      multiple: false,
      default: false,
    },
  },
  strict: true,
  allowPositionals: true,
  tokens: true,
});

const { trigger, help, all, workspaces } = values;

if (!trigger || !VALID_TRIGGERS[trigger]) {
  console.error(
    `No valid trigger provided. Valid options: ${Object.keys(
      VALID_TRIGGERS
    ).join(", ")}. Received: ${trigger ?? "undefined"}`
  );
  process.exit(-1);
}

if (help) {
  console.log(`
A cli command that parses the specified workspaces bunrepo.config.ts to derive a matrix of tasks that can be consumed in a github action runner.
    
"scripts": {
    "tasks": "bun run scripts/tasks.ts"
}

USAGE: 

// buils a matrix of tasks for the given workspaces based on their bunrepo.config.ts. Valid triggers ${Object.keys(
    VALID_TRIGGERS
  ).join(", ")}
bun run tasks -w app-name -t trigger-name

// passthrough parameters to the underlying command being run in the task
bun run tasks -w app-name -s script-name -- --additional-flags     
    `);
  process.exit(0);
}

const rootPkgJson = await getPackageJson();

let includedWorkspaces: IndexedWorkspaces;

if (all) {
  includedWorkspaces = rootPkgJson.indexedWorkspaces ?? [];
} else {
  includedWorkspaces =
    rootPkgJson.indexedWorkspaces?.filter((ws) =>
      workspaces?.some((w) => ws.aliases.includes(w))
    ) ?? [];
}

if (workspaces?.length === 0) {
  console.warn("No workspaces provided, terminating early.");
  process.exit(-2);
}

const passthroughs = parsePassthroughs(tokens ?? []);
const tasks: Array<Array<Task>> = [];

for (const ws of includedWorkspaces) {
  try {
    await file(`${ws.cwd}/bunrepo.config.ts`).stat();
  } catch {
    console.warn(`No bunrepo config file found for workspace: ${ws.name}`);
    continue;
  }

  const wsConfigModule = (await import(`${ws.cwd}/bunrepo.config.ts`)).default;
  try {
    const resolvedConfig = wsConfigModule() as BunrepoConfig;

    if (!resolvedConfig || !resolvedConfig.tasks) {
      throw new Error("Invalid bunrepo config format.");
    }

    const wsTasks =
      resolvedConfig.tasks[trigger as keyof BunrepoConfig["tasks"]];

    if (wsTasks) {
      tasks.push(
        wsTasks.map((cmd) => {
          return {
            cmd,
            workspace: ws.name,
            cwd: ws.cwd,
            passthroughs,
          } satisfies Task;
        })
      );
    }
  } catch (err) {
    console.log(`Unable to resolve ${ws.name} config`, err);
    continue;
  }
}

console.log("Task generation complete.");
console.log(JSON.stringify(tasks, null, 2));
