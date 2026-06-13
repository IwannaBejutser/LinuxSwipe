import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, writeSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
const versionPath = join(rootDir, 'public', 'version.json');

function readGitSha() {
  const env = globalThis.process?.env ?? {};
  const ciSha = env.EAS_BUILD_GIT_COMMIT_HASH ?? env.GITHUB_SHA;

  if (ciSha) {
    return ciSha.slice(0, 7);
  }

  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'local';
  }
}

const buildTime = new Date().toISOString();
const gitSha = readGitSha();
const manifest = {
  version: `${packageJson.version}-${gitSha}-${buildTime}`,
  packageVersion: packageJson.version,
  gitSha,
  buildTime,
};

mkdirSync(dirname(versionPath), { recursive: true });
writeFileSync(`${versionPath}`, `${JSON.stringify(manifest, null, 2)}\n`);

writeSync(1, `Wrote ${versionPath}\n`);
