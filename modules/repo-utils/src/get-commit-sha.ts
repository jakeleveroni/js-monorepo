export async function getCommitSha() {
  const proc = Bun.spawn(['git', 'rev-parse', '--short', 'HEAD']);
  return await new Response(proc.stdout).text();
}
