import { file, write, Glob } from "bun";
import getRootDir from "./get-root-dir";

export type CacheRecord<T> = T & {
  key: string;
  updated: number;
};

export type PackageJSON = {
  name: string;
  version: string;
  description?: string;
  main?: string;
  scripts?: Record<string, string>;
  workspaces?: string[];
  indexedWorkspaces?: Array<{ name: string; cwd: string }>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

/**
 * @throws - throws error if file fails to open or does not exist
 */
async function cachePackageJsons() {
  const rootPkgJson: PackageJSON = await file(
    `${getRootDir()}/package.json`
  ).json();
  const originalWorkspaces = rootPkgJson.workspaces ?? [];
  const explodedWorkspaces: PackageJSON["indexedWorkspaces"] = [];

  originalWorkspaces.forEach(async (ws) => {
    const glob = new Glob(ws);

    for (const file of glob.scanSync({
      cwd: getRootDir(),
      onlyFiles: false,
    })) {
      explodedWorkspaces.push({
        name: file.split("/")[1],
        cwd: `${getRootDir()}/${file}`,
      });
    }
  });

  const modifiedPkgJson: CacheRecord<PackageJSON> = {
    ...rootPkgJson,
    indexedWorkspaces: explodedWorkspaces,
    key: "root-pkg-json",
    updated: Date.now(),
  };

  await cacheRecord(modifiedPkgJson);
}

async function cacheRecord<T extends CacheRecord<unknown>>(record: T) {
  const rootDir = getRootDir();
  const cachePath = `${rootDir}/.bunrepo/.cache`;

  const fd = file(cachePath);
  const stats = await fd.stat();

  if (!stats.isFile()) {
    console.error("Unable to cache record");
  }

  const contents = await fd.json();
  const updatedContents = {
    ...contents,
    [record.key]: {
      ...record,
    },
  };

  await fd.delete();
  await write(cachePath, JSON.stringify(updatedContents), { createPath: true });
  return true;
}
