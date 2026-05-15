const fs = require('fs');
const os = require('os');
const path = require('path');
const configDir = path.join(os.homedir(), '.bubblewrap');
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({
  jdkPath: process.env.JAVA_HOME || '/tmp',
  androidSdkPath: process.env.ANDROID_HOME || '/tmp'
}));
