function memoizedRootDir() {
  let cache: string | undefined = undefined;

  return () => {
    if (cache) {
      return cache;
    }

    // TODO pull this from package.json root
    const target = 'js-monorepo';

    const dirParts = __dirname.split('/').filter(Boolean);

    const rootIndex = dirParts.findIndex((v) => v === target);
    if (rootIndex < 0) {
      console.error('Cannot derive root directory');
      process.exit(-1);
    }

    const nestedDepth = dirParts.length - 1 - rootIndex;
    const rootDir = `/${dirParts.slice(0, -nestedDepth).join('/')}`;
    const root = process.env.CI ? `${rootDir}/${target}` : rootDir;
    cache = root;
    return root;
  };
}

export default memoizedRootDir();
