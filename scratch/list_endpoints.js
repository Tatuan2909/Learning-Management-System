const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'BE', 'Lms.Api', 'Controllers');
const files = fs.readdirSync(dir);
files.forEach(f => {
  if (!f.endsWith('.cs')) return;
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const routeMatch = content.match(/\[Route\("([^"]+)"\)\]/);
  const baseRoute = routeMatch ? routeMatch[1] : '';
  const lines = content.split('\n');
  console.log(`\n### ${f} (Base: ${baseRoute})`);
  lines.forEach(l => {
    const m = l.match(/\[Http(Get|Post|Put|Delete)\(?\"?([^\"]*)\"?\)?\]/);
    if (m) {
      console.log(`- **${m[1].toUpperCase()}** \`${baseRoute}${m[2] ? '/' + m[2] : ''}\``);
    }
  });
});
