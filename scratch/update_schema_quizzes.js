const fs = require('fs');
let content = fs.readFileSync('schema.sql', 'utf8');
content = content.replace(/'123456',\s*(?:7\.00|6\.50),\s*10\.00,/g, "'123456', 5.00, 10.00,");
fs.writeFileSync('schema.sql', content, 'utf8');
console.log('Updated schema.sql quiz inserts to 5.00');
