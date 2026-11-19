export const get=id=>document.getElementById(id);
export function node(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n}
export function options(id, pairs, preferred){
 const s=get(id);s.replaceChildren(...pairs.map(([v,t])=>new Option(t,v)));if([...s.options].some(o=>o.value===String(preferred)))s.value=preferred;
}
export async function data(path){const r=await fetch('./data/'+path+'.json');if(!r.ok)throw Error('Dataset could not be loaded');return r.json()}
export const fmt=n=>Number(n).toLocaleString('en-CA');
export function stats(pairs){get('stats').replaceChildren(...pairs.map(([v,t])=>{const p=node('div',null,'stat');p.append(node('strong',v),node('span',t));return p}))}
export function table(id,headers,rows){const head=node('thead'),body=node('tbody'),r=node('tr');for(const h of headers)r.append(node('th',h));head.append(r);
 for(const fields of rows){const r=node('tr');for(const field of fields){const d=node('td');d.append(field instanceof Node?field:String(field));r.append(d)}body.append(r)}
 get(id).replaceChildren(head,body)}
export function barlist(id,rows){const max=Math.max(1,...rows.map(r=>r[1]));get(id).replaceChildren(...rows.map(([s,v])=>{const row=node('div',null,'bar'),track=node('div',null,'track'),fill=node('i',null,'fill');fill.style.width=(100*v/max)+'%';track.append(fill);row.append(node('span',s),track,node('span',fmt(v)));return row}))}
export function link(label,url){const a=node('a',label);a.href=url;return a}
export function csv(name,headers,records){const escape=v=>'"'+String(v??'').replaceAll('"','""')+'"';const content=[headers,...records].map(r=>r.map(escape).join(',')).join('\r\n');const a=node('a');a.href=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));a.download=name+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
export const initial=new URLSearchParams(location.search);
export function share(ids){const q=new URLSearchParams();for(const id of ids)if(get(id).value)q.set(id,get(id).value);history.replaceState(null,'','?'+q)}
export function failure(err){get('stamp').textContent='This edition could not be loaded. Reload the page to retry.';console.error(err)}
