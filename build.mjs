import fs from 'fs';
const site = JSON.parse(fs.readFileSync('data/site.json','utf8'));
const products = JSON.parse(fs.readFileSync('data/products.json','utf8'));
const out = 'dist';
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
fs.cpSync('src/style.css',`${out}/style.css`);
fs.copyFileSync('brand/logo.svg',`${out}/logo.svg`);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const price = p => `${p} ر.س`;
const wa = p => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(p ? `السلام عليكم، أبي أطلب: ${p.name} (${price(p.price)})` : 'السلام عليكم، عندي استفسار')}`;
const layout = ({title, desc, path, body, ld, noindex}) => `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${site.domain}${path}">
<meta name="theme-color" content="${site.themeColor}">
${noindex?'<meta name="robots" content="noindex">':'<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:type" content="website"><meta property="og:locale" content="ar_SA">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site.domain}${path}"><meta property="og:image" content="${site.domain}/logo.svg">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&family=Tajawal:wght@800&display=swap">
<link rel="stylesheet" href="/style.css">
${(ld||[]).map(o=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head><body>
<header class="top"><a class="brand" href="/"><img src="/logo.svg" width="150" height="38" alt="${site.name}"></a>
<nav><a href="/#products">المنتجات</a><a href="/#faq">أسئلة شائعة</a><a class="btn sm" href="${wa()}">واتساب</a></nav></header>
<main>${body}</main>
<footer><p>${site.name} - ${site.tagline}</p><p>غير تابع لأي شركة أو علامة تجارية أخرى.</p></footer>
<a class="wa-float" href="${wa()}" aria-label="تواصل عبر واتساب">واتساب</a>
</body></html>`;
const write = (p, html) => { const f = `${out}${p}${p.endsWith('/')?'index.html':''}`; fs.mkdirSync(f.substring(0,f.lastIndexOf('/')),{recursive:true}); fs.writeFileSync(f, html); };
const card = p => `<article class="card"><span class="badge">${esc(p.badge)}</span><h3><a href="/products/${p.slug}/">${esc(p.name)}</a></h3><p>${esc(p.short)}</p><div class="price">${price(p.price)}</div><a class="btn" href="${wa(p)}" rel="nofollow noopener">اطلب الآن</a><a class="more" href="/products/${p.slug}/">التفاصيل</a></article>`;
const faqs = products.flatMap(p=>p.faq);
const org = {"@context":"https://schema.org","@type":"Organization",name:site.name,url:site.domain,logo:`${site.domain}/logo.svg`,contactPoint:{"@type":"ContactPoint",telephone:`+${site.whatsapp}`,contactType:"customer service",availableLanguage:"Arabic"}};
const faqLd = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
write('/', layout({title:`${site.name} | ${site.tagline}`,desc:site.description,path:'/',ld:[org,{"@context":"https://schema.org","@type":"WebSite",name:site.name,url:site.domain,inLanguage:"ar"},faqLd],
 body:`<section class="hero"><h1>${site.name}: ${site.tagline}</h1><p>${site.description}</p><a class="btn lg" href="#products">شاهد المنتجات</a></section>
<section id="products"><h2>منتجاتنا</h2><div class="grid">${products.map(card).join('')}</div></section>
<section class="steps"><h2>كيف تطلب؟</h2><ol><li>اختر المنتج واضغط اطلب الآن</li><li>تفتح لك محادثة واتساب برسالة جاهزة</li><li>نؤكد الطلب ويوصلك التفعيل فوراً</li></ol></section>
<section id="faq"><h2>أسئلة شائعة</h2>${faqs.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`}));
for (const p of products) {
  const path = `/products/${p.slug}/`;
  const ld = [{"@context":"https://schema.org","@type":"Product",name:p.name,description:p.description,brand:{"@type":"Brand",name:site.name},image:`${site.domain}/logo.svg`,url:site.domain+path,offers:{"@type":"Offer",price:String(p.price),priceCurrency:site.currency,availability:"https://schema.org/InStock",url:site.domain+path}},
   {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"الرئيسية",item:site.domain+'/'},{"@type":"ListItem",position:2,name:p.name,item:site.domain+path}]},
   {"@context":"https://schema.org","@type":"FAQPage",mainEntity:p.faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}];
  write(path, layout({title:`${p.name} بسعر ${price(p.price)} | ${site.name}`,desc:`${p.short} ${p.keywords.join('، ')}. اطلب عبر واتساب.`,path,ld,
   body:`<nav class="crumb"><a href="/">الرئيسية</a> › ${esc(p.name)}</nav><section class="product"><h1>${esc(p.name)}</h1><div class="price lg">${price(p.price)}</div><p>${esc(p.description)}</p><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><a class="btn lg" href="${wa(p)}" rel="nofollow noopener">اطلب الآن عبر واتساب</a></section><section><h2>أسئلة عن المنتج</h2>${p.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`}));
}
write('/404.html', layout({title:`الصفحة غير موجودة | ${site.name}`,desc:'الصفحة غير موجودة',path:'/404.html',noindex:true,body:'<section class="hero"><h1>الصفحة غير موجودة</h1><a class="btn" href="/">العودة للرئيسية</a></section>'}));
const urls = ['/',...products.map(p=>`/products/${p.slug}/`)];
const today = new Date().toISOString().slice(0,10);
fs.writeFileSync(`${out}/sitemap.xml`,`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${site.domain}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(`${out}/robots.txt`,`User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`);
console.log('built',urls.length,'pages');
