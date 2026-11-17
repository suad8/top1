import fs from 'fs';import path from 'path';
let bad=0;const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const f of walk('dist').filter(f=>f.endsWith('.html'))){const h=fs.readFileSync(f,'utf8');
 for(const [,l] of h.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){const t=path.join('dist',l);if(!(fs.existsSync(t)&&(fs.statSync(t).isFile()||fs.existsSync(path.join(t,'index.html')))) ){console.log('BROKEN',f,l);bad++}}
 for(const [,j] of h.matchAll(/ld\+json">(.*?)<\/script>/g))try{JSON.parse(j)}catch{console.log('BAD JSON-LD',f);bad++}
 if(!/<title>.+<\/title>/.test(h)||!/name="description"/.test(h)||!/canonical/.test(h)){console.log('SEO missing',f);bad++}}
console.log(bad?'FAIL':'OK');process.exit(bad?1:0)
