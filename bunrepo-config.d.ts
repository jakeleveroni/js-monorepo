export type BunfigLifecycleHook =
  | "pullrequest"
  | "prebuild"
  | "build"
  | "postbuild"
  | "finalize";

export type BunrepoConfig = {
  meta: Record<string, unknown>;
  tasks: Record<BunfigLifecycleHook, string[][] | false>;
};
