import { file, Glob } from "bun";
import { cacheRecord, CacheRecord, PackageJSON } from "./cache";
import getRootDir from "./get-root-dir";

/**
 * HOC method that reads in package.json & caches it, on subsequent calls the cached version is returne
 */
export function getPackageJson() {
  let cache: Record<string, CacheRecord<PackageJSON>> = {};

  /**
   * returns a cached version of the package json if available
   * otherwise it will read from the cwd relative to the root directory
   *
   * @throws throws Error if file fails to open or does not exist
   */
  return async function packageJson(
    cwd: string = ""
  ): Promise<CacheRecord<PackageJSON>> {
    if (cache[cwd]) {
      return cache[cwd];
    }

    const rootPkgJson: PackageJSON = await file(
      `${getRootDir()}${cwd}/package.json`
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

    cache[cwd] = modifiedPkgJson;
    cacheRecord(modifiedPkgJson).catch(() =>
      console.error("Unable to cache package.json")
    );
    return modifiedPkgJson;
  };
}
