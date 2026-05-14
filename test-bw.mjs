import { execSync } from 'child_process';
try {
  execSync('printf "n\\n" | npx -y @bubblewrap/cli update --nonInteractive', { stdio: 'inherit', env: { ...process.env, PATH: process.env.PATH + ':/usr/lib/android-sdk/cmdline-tools/latest/bin:/usr/lib/android-sdk/platform-tools' }});
} catch(e) {}
