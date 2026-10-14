// Serves the upload page. MAX_UPLOAD_MB is the requirement under test (REQ-7): 25 MB at first,
// 10 MB after the team changes it.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const MAX = Number(process.env.MAX_UPLOAD_MB || 25);
const page = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8').replaceAll('{{MAX_UPLOAD_MB}}', String(MAX));

http
  .createServer((req, res) => {
    res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
    res.end(page);
  })
  .listen(Number(process.env.PORT || 3000), () => console.log(`checkout-app on :${process.env.PORT || 3000}, limit ${MAX} MB`));
