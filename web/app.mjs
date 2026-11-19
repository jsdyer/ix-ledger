import {get,options,data,fmt,stats,table,barlist,link,csv,initial,share,failure} from './ui.mjs';
import {compare,usable} from './model.mjs';
const ids=['exchange','from','to','change','outside','query'];
let editions=new Map(),dates=[],visible=[];
const names={added:'Appeared',removed:'Disappeared',changed:'Connection changed',same:'Same listed connection',unknown:'Baseline unavailable'};
const cap=m=>m?m[4]===m[2]?'Unreported':fmt(m[3]/1000)+(m[4]?' + unreported':''):'—';
function render(cause){
 let from=get('from').value,to=get('to').value;
 if(from>to){if(cause==='from')get('to').value=from;else get('from').value=to;from=get('from').value;to=get('to').value}
 const key=Number(get('exchange').value),a=editions.get(from).get(key),b=editions.get(to).get(key),name=b||a||[...editions.values()].reverse().map(d=>d.get(key)).find(Boolean);
 const previous=get('outside').options.length?get('outside').value:initial.get('outside');
 options('outside',[['','No exchange filter'],...[...editions.get(to).values()].filter(x=>x.id!==key).map(x=>[x.id,x.name])],previous);
 const other=editions.get(to).get(Number(get('outside').value));
 get('title').textContent=name.name+(name.city?' · '+name.city:'');
 get('coverage').textContent=(!a||!b?'Selected exchange missing from '+(!a?from:to)+'. Changes cannot be classified.':'Comparing '+from+' with '+to+'.');
 const rows=compare(a,b),total=ms=>ms.reduce((s,m)=>s+m[3],0)/1000;
 stats([[b?fmt(b.members.length):'—','Member ASNs on '+to],[a&&b?fmt(rows.filter(r=>r.change==='added').length):'—','Appeared'],[a&&b?fmt(rows.filter(r=>r.change==='removed').length):'—','Disappeared'],[b?fmt(total(b.members)):'—','Listed interface Gbps on '+to]]);
 barlist('timeline',dates.filter(d=>editions.get(d).has(key)).map(d=>[d,editions.get(d).get(key).members.length]));
 visible=usable(rows,get('change').value,get('query').value,other);
 get('matches').textContent=fmt(visible.length)+' matching ASNs'+(other?' listed here and absent from '+other.name+' on '+to:'')+'. Speeds below are the sum of reported interface rates in Gbps.';
 table('records',['ASN','Network','Change','Earlier Gbps','Later Gbps'],visible.map(r=>['AS'+r.asn,r.name,names[r.change],cap(r.old),cap(r.now)]));
 const archive=d=>'https://data.caida.org/datasets/peeringdb-v2/'+d.slice(0,7).replace('-','/')+'/peeringdb_2_dump_'+d.replaceAll('-','_')+'.json';
 get('sources').replaceChildren(link('Earlier PeeringDB snapshot',archive(from)),' · ',link('Later snapshot',archive(to)),' · ',link('Exchange in PeeringDB','https://www.peeringdb.com/ix/'+key),' · ',link('CAIDA archive documentation','https://www.caida.org/catalog/datasets/peeringdb/'));share(ids);
}
async function start(){const state=await data('status');dates=state.dates;
 const bundles=await Promise.all(dates.map(d=>data(d)));editions=new Map(dates.map((d,i)=>[d,new Map(bundles[i].map(x=>[x.id,x]))]));
 const all=new Map();for(const e of editions.values())for(const [id,x]of e)all.set(id,x);
 options('exchange',[...all.values()].sort((a,b)=>a.name.localeCompare(b.name)).map(x=>[x.id,x.name]),initial.get('exchange')||'863');
 options('from',dates.map(d=>[d,d]),initial.get('from')||dates.find(d=>d.startsWith('2025'))||dates[0]);options('to',dates.map(d=>[d,d]),initial.get('to')||dates.at(-1));
 if([...get('change').options].some(o=>o.value===initial.get('change')))get('change').value=initial.get('change');
 get('query').value=initial.get('query')||'';
 get('stamp').textContent=state.exchanges+' exchanges in the latest edition · '+dates.length+' snapshots · Retrieved '+state.retrieved;
 for(const id of ids)get(id).addEventListener(id==='query'?'input':'change',()=>render(id));
 get('export').onclick=()=>csv('ix-ledger-'+get('exchange').value,['ASN','Network','Change','Earlier snapshot','Earlier Mbps','Earlier interfaces without rate','Later snapshot','Later Mbps','Later interfaces without rate'],visible.map(r=>[r.asn,r.name,names[r.change],get('from').value,r.old?.[3],r.old?.[4],get('to').value,r.now?.[3],r.now?.[4]]));render();
}start().catch(failure);
