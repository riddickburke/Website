const $=id=>document.getElementById(id);
const h=(t,a={},...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a))if(v)x==='class'?e.className=v:e.setAttribute(x,v);k.flat().forEach(c=>e.append(c));return e};
// block javascript:/data: links coming from the JSON
const safe=u=>{u=(u||'').trim();return/^[a-z][a-z0-9+.-]*:/i.test(u)&&!/^(https?|mailto|tel):/i.test(u)?'':u};
const link=(href,text)=>h('a',{href:safe(href),target:/^https?:/i.test(href)?'_blank':'',rel:'noopener'},text);

const PAGES=[['index.html','about'],['experience.html','experience'],['certifications.html','certifications']];
const page=document.body.dataset.page;
$('nav').append(h('span',{class:'ps1',id:'ps1'},'user@site:~$'),
  h('ul',{},PAGES.map(([f,n])=>h('li',{},h('a',{class:'btn',href:f,'aria-current':n===page?'page':null},n)))));

const hd=(file,tag='h1')=>h(tag,{class:'prompt'},'$ cat '+file);
const empty=()=>h('p',{class:'empty'},'(nothing here yet)');

function hero(p){
  const kv=(k,v)=>h('div',{class:'kv'},h('span',{},k),v);
  const rows=[];
  if(p.location)rows.push(kv('location',p.location));
  if(p.email)rows.push(kv('email',link('mailto:'+p.email,p.email)));
  if(p.phone)rows.push(kv('phone',link('tel:'+p.phone.replace(/[^\d+]/g,''),p.phone)));
  (p.links||[]).forEach(l=>l.url&&rows.push(kv((l.label||'link').toLowerCase(),link(l.url,l.url.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')))));
  const img=h('img',{class:'photo',alt:'Portrait of '+(p.name||'me'),hidden:'hidden'});
  if(p.photo){img.onload=()=>img.hidden=false;img.src=safe(p.photo)}
  return h('div',{class:'hero'},img,h('div',{},h('h1',{class:'name'},p.name||''),h('p',{class:'tagline'},p.tagline||p.headline||''),rows));
}

fetch('data.json?t='+Date.now()).then(r=>{if(!r.ok)throw 0;return r.json()}).then(D=>{
  const p=D.profile||{},V=$('view');V.replaceChildren();
  $('ps1').textContent=((p.name||'user').split(' ')[0].toLowerCase())+'@site:~$';
  document.title=(p.name||'Portfolio')+' · '+(page==='about'?(p.headline||'about'):page);
  $('foot').textContent='© '+new Date().getFullYear()+' '+(p.name||'');

  if(page==='about'){
    V.append(hero(p),hd('about.md','h2'));
    const a=h('div',{class:'about'});
    (D.about||'').split(/\n\s*\n/).filter(Boolean).forEach(t=>a.append(h('p',{},t)));
    V.append(a.children.length?a:empty());
  }
  if(page==='experience'){
    V.append(hd('experience.md'));
    const L=D.experience||[];
    if(!L.length)V.append(empty());
    L.forEach(e=>V.append(h('article',{class:'card'},
      h('div',{class:'head'},h('h3',{},e.role||''),e.period&&h('span',{class:'meta'},e.period)),
      e.org&&h('div',{class:'sub'},e.org),
      e.desc&&h('p',{class:'desc'},e.desc),
      e.tags&&e.tags.length&&h('ul',{class:'tags'},e.tags.map(t=>h('li',{},t))))));
  }
  if(page==='certifications'){
    V.append(hd('certifications.md'));
    const L=D.certifications||[];
    if(!L.length)V.append(empty());
    const g=h('div',{class:'certs'});
    L.forEach(x=>g.append(h('article',{class:'card'},
      x.image&&h('img',{src:safe(x.image),alt:'',loading:'lazy'}),
      h('h3',{class:'head'},x.url?link(x.url,x.name):x.name),
      h('div',{class:'sub'},[x.issuer,x.date].filter(Boolean).join(' · ')),
      x.credentialId&&h('div',{class:'meta'},'ID '+x.credentialId))));
    if(L.length)V.append(g);
  }
}).catch(()=>{$('view').textContent='Could not load data.json. If you opened this file directly, run a local server: python3 -m http.server'});
