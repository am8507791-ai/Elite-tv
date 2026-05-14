const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.url === '/manifest.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const manifest = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf8'));
    manifest.start_url = "/";
    res.end(JSON.stringify(manifest));
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(8089, () => {
  console.log('Local server started on port 8089 for manifest delivery.');
  const env = { ...process.env };
  try {
    execSync('echo "n" | npx -y @bubblewrap/cli init --manifest http://localhost:8089/manifest.json --nonInteractive', { stdio: 'inherit', env });
    
    // just sanity check
    const twa = JSON.parse(fs.readFileSync('twa-manifest.json', 'utf8'));
    console.log(twa.iconUrl);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
