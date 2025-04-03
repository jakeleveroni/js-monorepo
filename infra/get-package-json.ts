import { file, Glob } from "bun";
import getRootDir from "./get-root-dir";

export type IndexedWorkspaces = Array<{
  name: string;
  cwd: string;
  aliases: string[];
}>;

export type PackageJSON = {
  name: string;
  aliases: string[];
  version: string;
  description?: string;
  main?: string;
  scripts?: Record<string, string>;
  workspaces?: string[];
  indexedWorkspaces?: IndexedWorkspaces;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

/**
 * HOC method that reads in package.json & caches it, on subsequent calls the cached version is returne
 */
function getPackageJson() {
  let cache: Record<string, PackageJSON> = {};

  /**
   * returns a cached version of the package json if available
   * otherwise it will read from the cwd relative to the root directory
   *
   * @throws throws Error if file fails to open or does not exist
   */
  return async function packageJson(
    cwd: string = getRootDir()
  ): Promise<PackageJSON> {
    if (cache[cwd]) {
      return cache[cwd];
    }
    const pkgJson: PackageJSON = await file(`${cwd}/package.json`).json();
    const originalWorkspaces = pkgJson.workspaces ?? [];
    const explodedWorkspaces: PackageJSON["indexedWorkspaces"] = [];

    for (const ws of originalWorkspaces) {
      const glob = new Glob(ws);

      for await (const pathMatch of glob.scan({
        cwd: getRootDir(),
        onlyFiles: false,
      })) {
        const wsPkgJson = await packageJson(`${getRootDir()}/${pathMatch}`);

        explodedWorkspaces.push({
          name: pathMatch.split("/")[1],
          cwd: `${getRootDir()}/${pathMatch}`,
          aliases: wsPkgJson.aliases ?? [],
        });
      }
    }

    const modifiedPkgJson: PackageJSON = {
      ...pkgJson,
      indexedWorkspaces: explodedWorkspaces,
    };

    cache[cwd] = modifiedPkgJson;
    return modifiedPkgJson;
  };
}

export default getPackageJson();
