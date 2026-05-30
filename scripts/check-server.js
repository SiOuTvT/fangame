const http = require('http');
http.get('http://localhost:3000', r => {
  console.log('Status:', r.statusCode);
  process.exit(r.statusCode >= 200 && r.statusCode < 500 ? 0 : 1);
}).on('error', e => {
  console.log('Error:', e.message);
  process.exit(1);
});