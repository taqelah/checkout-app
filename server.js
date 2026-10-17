// Serves Checkout, the demo product Spec Keeper watches. MAX_UPLOAD_MB is the requirement under test
// (REQ-7): 25 MB at first, changed later by the team in Slack.
//
// The login is a demo: any email and password, or "Continue as Maya", signs you in. A cookie holds the
// name to show; there is no real account behind it.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const MAX = Number(process.env.MAX_UPLOAD_MB || 25);
const PORT = Number(process.env.PORT || 3000);
const DEMO_USER = 'Maya Lim';

const read = (name) => fs.readFileSync(path.join(__dirname, name), 'utf8');
const app = read('index.html').replaceAll('{{MAX_UPLOAD_MB}}', String(MAX));
const login = read('login.html');

const escape = (s) => s.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';

function user(req) {
  const m = /(?:^|;\s*)user=([^;]+)/.exec(req.headers.cookie || '');
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]).slice(0, 60);
  } catch {
    return null;
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...headers});
  res.end(body);
}

function redirect(res, to, headers = {}) {
  res.writeHead(303, {location: to, ...headers});
  res.end();
}

// A name from the sign-in form: "maya.lim@acme.test" -> "Maya Lim".
function nameFrom(form) {
  if (form.get('demo')) return DEMO_USER;
  const local = (form.get('email') || '').split('@')[0].replace(/[._-]+/g, ' ').trim();
  return local ? local.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 60) : DEMO_USER;
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/login' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 10_000) req.destroy();
      });
      req.on('end', () => {
        const name = nameFrom(new URLSearchParams(body));
        redirect(res, '/', {'set-cookie': `user=${encodeURIComponent(name)}; Path=/; HttpOnly; SameSite=Lax`});
      });
      return;
    }
    if (url.pathname === '/login') return send(res, 200, login);
    if (url.pathname === '/logout') return redirect(res, '/login', {'set-cookie': 'user=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'});
    if (url.pathname !== '/') return send(res, 404, '<p>Not found. <a href="/">Back to Checkout</a></p>');
    const name = user(req);
    if (!name) return redirect(res, '/login');
    send(res, 200, app.replaceAll('{{USER_NAME}}', escape(name)).replaceAll('{{USER_INITIALS}}', escape(initials(name))));
  })
  .listen(PORT, () => console.log(`checkout-app on :${PORT}, limit ${MAX} MB`));
