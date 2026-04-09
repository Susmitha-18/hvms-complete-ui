const http = require('http');

const data = JSON.stringify({
  date: '2025-10-30',
  month: '2025-10',
  records: [
    { driverId: '68f4b2b5ed2a49d87498ade4', status: 'P' }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/attendance/mark',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log('BODY:', body); });
});

req.on('error', (e) => { console.error('problem with request:', e && e.stack ? e.stack : e); });
req.write(data);
req.end();
