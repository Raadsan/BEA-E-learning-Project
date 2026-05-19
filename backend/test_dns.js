import dns from 'dns';

dns.resolveMx('gmail.com', (err, addresses) => {
  if (err) {
    console.error('Error resolving MX for gmail.com:', err);
  } else {
    console.log('MX records for gmail.com:', addresses);
  }
});
