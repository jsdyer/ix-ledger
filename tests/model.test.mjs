import test from 'node:test';import assert from 'node:assert/strict';import {compare,usable} from '../web/model.mjs';
const a={members:[[1,'One',1,1000,0],[2,'Two',1,0,1]]},b={members:[[1,'One',2,3000,0],[3,'Three',1,100,0]]};
test('unique ASN changes and missing edition',()=>{assert.equal(compare(a,b).find(x=>x.asn===1).change,'changed');assert.equal(compare(a,b).find(x=>x.asn===2).change,'removed');assert.ok(compare(null,b).every(x=>x.change==='unknown'))});
test('other exchange intersection and AS-prefixed search',()=>{assert.deepEqual(usable(compare(a,b),'all','',a).map(x=>x.asn),[3]);assert.equal(usable(compare(a,b),'added','AS3',null).length,1)});
