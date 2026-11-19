export function compare(a,b){
 const earlier=new Map((a?.members||[]).map(m=>[m[0],m])),later=new Map((b?.members||[]).map(m=>[m[0],m]));
 return [...new Set([...earlier.keys(),...later.keys()])].map(asn=>{
 const old=earlier.get(asn),now=later.get(asn);
 let change='unknown';
 if(a&&b){if(!old)change='added';else if(!now)change='removed';else change=old.slice(2).join('/')===now.slice(2).join('/')?'same':'changed'}
 return {asn,name:(now||old)[1],old,now,change}
 }).sort((x,y)=>x.name.localeCompare(y.name)||x.asn-y.asn);
}
export function usable(rows,change,query,other){
 const q=query.toLowerCase().trim().replace(/^as(?=\d)/,'');const elsewhere=new Set((other?.members||[]).map(r=>r[0]));
 return rows.filter(r=>(change==='all'||r.change===change)&&(!q||String(r.asn)===q||r.name.toLowerCase().includes(q))&&(!other||(r.now&&!elsewhere.has(r.asn))));
}
