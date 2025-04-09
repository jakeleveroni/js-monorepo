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
