import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// git diff alone misses newly generated chunks and staged changes.
const changes = execFileSync('git', ['status', '--porcelain', '--untracked-files=all', '--', 'framework/dist'], {
  cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8',
});
if (changes.trim()) {
  console.error('Generated files differ from the committed release:\n' + changes);
  console.error('Run npm run verify, then include framework/dist in your commit.');
  process.exitCode = 1;
}
