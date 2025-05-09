export type Workload = {
  workloads: Array<WorkspaceWorkload>;
};

export type WorkspaceWorkload = {
  workspace: string;
  isParallel: boolean;
  cwd: string;
  tasks: Task[];
};

export type Task = {
  name: string;
  cmd: string;
  argv: string[];
  passthroughs: string[];
};
