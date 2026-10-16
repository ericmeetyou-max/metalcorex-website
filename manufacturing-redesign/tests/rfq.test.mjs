import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const root=new URL('../',import.meta.url);
const source=readFileSync(new URL('website/worker.js',root),'utf8');
let sent=[];
globalThis.__smtpConnect=()=>{
 const responses=['220 Ready','250 Hello','334 User','334 Password','235 Authenticated','250 Sender','250 Recipient','354 Data','250 Sent','221 Bye'];
 let index=0,controller;
 return {readable:new ReadableStream({start(c){controller=c;c.enqueue(new TextEncoder().encode(responses[index++]+'\r\n'));}}),writable:new WritableStream({write(bytes){const text=new TextDecoder().decode(bytes);if(text.includes('Subject:'))sent.push(text);controller.enqueue(new TextEncoder().encode(responses[index++]+'\r\n'));}}),close:async()=>{}};
};
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source.replace('import { connect } from "cloudflare:sockets";','const connect=globalThis.__smtpConnect;')).toString('base64'));
function environment(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('website/db/schema.sql',root),'utf8'));
 const DB={prepare(sql){let args=[];return {bind(...values){args=values;return this},async run(){return db.prepare(sql).run(...args)},async first(){return db.prepare(sql).get(...args)||null},async all(){return {results:db.prepare(sql).all(...args)}}}}};
 const files=new Map();
 return {DB,db,files,RFQ_FILES:{async put(key,stream,options){files.set(key,{bytes:await new Response(stream).arrayBuffer(),httpMetadata:options.httpMetadata})},async get(key){const item=files.get(key);return item?{body:item.bytes,httpMetadata:item.httpMetadata}:null}},ASSETS:{fetch:async()=>new Response('asset',{headers:{'content-type':'text/html'}})},ADMIN_TOKEN:'local-test-token-only',SMTP_USERNAME:'test@example.invalid',SMTP_PASSWORD:'local-test-only'};
}
function form(extra={}){const f=new FormData();for(const [k,v] of Object.entries({name:'Alice Engineer',company:'Custom Manufacturing',email:'engineer@example.org',country:'Germany',part_name:'Line array mounting bracket',process:'Die Casting',message:'Please quote aluminum mounting brackets for our professional speaker system. We need 500 units with black anodized finish and dimensional inspection.',form_started_at:String(Date.now()-30000),form_nonce:'test-local-nonce-123456',...extra}))f.set(k,v);f.append('drawings',new File(['0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF'],'bracket.dxf',{type:'application/dxf'}));return f;}
function submit(env,body=form(),origin='https://metalcorex.com'){return worker.fetch(new Request('https://metalcorex.com/api/rfq',{method:'POST',headers:{origin},body}),env,{});}
test('RFQ stores actual SQL rows and file bytes, produces both SMTP messages with new-site links',async()=>{sent=[];const e=environment();const res=await submit(e);assert.equal(res.status,200);const data=await res.json();assert.equal(data.files,1);assert.equal(data.email.ok,true);assert.equal(data.customerEmail.ok,true);assert.equal(e.db.prepare('SELECT status FROM rfq_submissions').get().status,'New');assert.equal(e.files.size,1);assert.equal(sent.length,2);assert(sent.every(x=>x.includes('https://metalcorex.com')));
 const key=[...e.files.keys()][0];let download=await worker.fetch(new Request('https://metalcorex.com/api/files?key='+encodeURIComponent(key)),e,{});assert.equal(download.status,401);
 download=await worker.fetch(new Request('https://metalcorex.com/api/files?key='+encodeURIComponent(key),{headers:{authorization:'Bearer local-test-token-only'}}),e,{});assert.equal(download.status,200);assert((await download.text()).includes('ENTITIES'));});
test('missing fields rejected',async()=>{assert.equal((await submit(environment(),form({company:''}))).status,400)});
test('unsupported drawing rejected',async()=>{const f=form();f.delete('drawings');f.append('drawings',new File(['bad'],'bad.exe'));assert.equal((await submit(environment(),f)).status,400)});
