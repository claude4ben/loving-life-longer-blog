// A pretend GitHub for tests: serves files from this repository and records what the crop editor saves,
// so tests never touch the real GitHub. Started by playwright.config.ts on port 4399.
import http from 'node:http';
import fs from 'node:fs';

const TOKEN = 'Bearer test-github-token';
const saved = new Map(); // path -> latest content
let last = null;

http
  .createServer((req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/__last') return send(200, last);
    if (req.headers.authorization !== TOKEN) return send(401, { message: 'Bad credentials' });
    const m = url.pathname.match(/^\/repos\/[^/]+\/[^/]+\/contents\/(.+)$/);
    if (!m) return send(404, { message: 'Not Found' });
    const path = decodeURIComponent(m[1]);
    if (req.method === 'GET') {
      if (!saved.has(path) && !fs.existsSync(path)) return send(404, { message: 'Not Found' });
      const text = saved.get(path) ?? fs.readFileSync(path, 'utf8');
      return send(200, { content: Buffer.from(text).toString('base64'), sha: `sha-${text.length}` });
    }
    if (req.method === 'PUT') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        const { message, content, sha, branch } = JSON.parse(body);
        const text = Buffer.from(content, 'base64').toString('utf8');
        last = { path, message, branch, sha, text };
        saved.set(path, text);
        send(200, { content: { sha: `sha-${text.length}` } });
      });
      return;
    }
    send(405, { message: 'Method not allowed' });
  })
  .listen(4399);
