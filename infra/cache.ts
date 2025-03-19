import { file, write } from "bun";
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

// HOC method to cache the cache in memory on resource first aquisition
export function getCacheRecord<T extends CacheRecord<unknown>>(): (
  key: string
) => Promise<T | undefined> {
  let cache = undefined;

  return async (key: string) => {
    if (cache) {
      return cache;
    }

    const rootDir = getRootDir();
    const cachePath = `${rootDir}/.bunrepo/.cache`;

    const fd = file(cachePath);
    const stats = await fd.stat();

    if (!stats.isFile()) {
      console.error("Unable to cache record");
      return;
    }

    const contents = await fd.json();
    cache = contents;

    if (!contents || !contents[key]) {
      return undefined;
    }

    return contents[key] as T satisfies T;
  };
}

export async function cacheRecord<T extends CacheRecord<unknown>>(record: T) {
  const rootDir = getRootDir();
  const cachePath = `${rootDir}/.bunrepo/.cache`;

  const fd = file(cachePath);
  const stats = await fd.stat();

  if (!stats.isFile()) {
    console.error("Unable to cache record");
    return;
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
