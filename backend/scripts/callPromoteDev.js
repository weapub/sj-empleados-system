const http = require('http');

function postJson(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          resolve({ status: res.statusCode, json });
        } catch (_) {
          resolve({ status: res.statusCode, text: raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: node backend/scripts/callPromoteDev.js <email>');
    process.exit(1);
  }
  const res = await postJson('http://localhost:5000/api/admin/promote-admin-dev', {
    email,
    name: 'San Jorge Admin',
  }, { 'x-admin-promote-token': 'DEV_PROMOTE' });
  console.log('Status:', res.status);
  console.log('Response:', res.json || res.text);
}

main();