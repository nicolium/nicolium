import { execSync } from 'node:child_process';

import pkg from '../../package.json';

const code = compileTime(() => {
  const { GITHUB_REF_NAME, GITHUB_SHA, GITHUB_REF_TYPE } = process.env;

  const shortRepoName = (url: string): string => new URL(url).pathname.slice(1);
  const trimHash = (hash: string): string => hash.slice(0, 7);

  const tryGit = (cmd: string): string | undefined => {
    try {
      return String(execSync(cmd));
    } catch (e) {
      return undefined;
    }
  };

  const version = (pkg: { version: string }): string => {
    const ciTag = GITHUB_REF_TYPE === 'tag' ? GITHUB_REF_NAME : undefined;
    const branch = GITHUB_REF_TYPE === 'branch' ? GITHUB_REF_NAME : undefined;

    // Try to discern from GitHub CI first
    if (ciTag === `v${pkg.version}` || branch === 'stable') {
      return pkg.version;
    }

    if (typeof GITHUB_SHA === 'string') {
      return `${pkg.version}-${trimHash(GITHUB_SHA)}`;
    }

    // Fall back to git directly
    const head = tryGit('git rev-parse HEAD');
    const tag = tryGit(`git rev-parse v${pkg.version}`);

    if (head && head !== tag) return `${pkg.version}-${trimHash(head)}`;

    // Fall back to version in package.json
    return pkg.version;
  };

  const code = {
    name: pkg.name,
    displayName: pkg.displayName,
    url: pkg.repository.url,
    repository: shortRepoName(pkg.repository.url),
    version: version(pkg),
    homepage: pkg.homepage,
    ref: (GITHUB_REF_TYPE === 'tag' ? GITHUB_REF_NAME : GITHUB_SHA) ?? tryGit('git rev-parse HEAD'),
  };

  return code;
});

export default code;
