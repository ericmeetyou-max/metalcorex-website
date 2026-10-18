import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function setup(){
 const handlers={};const fileHandlers={};
 const files={files:[],setCustomValidity(v){this.validation=v},setAttribute(){},removeAttribute(){},addEventListener(k,v){fileHandlers[k]=v}};
 const error={};const clear={addEventListener(){}};
 const form={querySelector(s){return s==='[name="drawings"]'?files:s==='#fileError'?error:clear},addEventListener(k,v){handlers[k]=v}};
 vm.runInNewContext(readFileSync(new URL('../website/contact-professional.js',import.meta.url),'utf8'),{document:{querySelector:()=>form},Event});
 return {handlers,fileHandlers,files,error};
}
test('new quote fields survive existing message contract without repeated accumulation',()=>{
 const {handlers}=setup();
 for(let i=0;i<2;i++){
 const data=new FormData();data.set('message','Critical bore tolerance per drawing.');data.set('quote_quantity','100 / 500');data.set('requested_finish','Clear anodizing');data.set('delivery_destination','Berlin, Germany');data.set('delivery_timing','Flexible');
 handlers.formdata({formData:data});assert.match(data.get('message'),/Quantity to quote: 100 \/ 500/);assert.match(data.get('message'),/Surface finish: Clear anodizing/);assert.match(data.get('message'),/Delivery destination: Berlin, Germany/);assert.match(data.get('message'),/Target delivery timing: Flexible/);assert.equal(data.get('message').split('Project specifications').length,2);
 }
});
test('attachment validation matches count, individual and total API limits',()=>{
 const {files,fileHandlers}=setup();
 for(const [batch,expect] of [[Array(9).fill({name:'a.pdf',size:1}),'8 files'],[[{name:'a.exe',size:1}],'unsupported'],[[{name:'a.pdf',size:26*1024*1024}],'25 MB'],[Array(3).fill({name:'a.pdf',size:18*1024*1024}),'50 MB'],[[{name:'part.STEP',size:1024}],''],[[],'']]){files.files=batch;fileHandlers.change();assert.ok(expect?files.validation.includes(expect):files.validation==='');}
});
