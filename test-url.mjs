import { URL } from 'url';
const u = new URL('file:///tmp/manifest.json');
console.log(u.href);
