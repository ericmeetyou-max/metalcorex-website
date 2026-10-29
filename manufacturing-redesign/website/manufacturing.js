const menuButton=document.querySelector('.menu-toggle');const menu=document.querySelector('#main-nav');menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open)});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.classList.contains('open')){menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.focus()}});document.querySelectorAll('#main-nav a').forEach(a=>{if(new URL(a.href).pathname===location.pathname.replace(/\.html$/,''))a.setAttribute('aria-current','page')});
if((location.pathname==='/'||location.pathname==='/index.html')&&location.hash==='#quote'){location.replace('/contact#rfq');}
// Accessible process explorer: click, arrow keys, Home and End.
document.querySelectorAll('[role="tablist"]').forEach(list=>{
 const tabs=[...list.querySelectorAll('[role="tab"]')];
 function select(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active});if(focus)tab.focus()}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();select(tabs[next],true)}})});
});
const mega=document.querySelector('.mega');
document.addEventListener('click',e=>{if(mega&&!mega.contains(e.target))mega.open=false});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mega?.open){mega.open=false;mega.querySelector('summary').focus()}});
// Component browsing remains local to the page; RFQ links carry the selected reference.
const componentDialog=document.querySelector('.component-dialog');
let componentButtons=[],componentPosition=0,componentOpener=null;
function showComponent(index){
 componentPosition=(index+componentButtons.length)%componentButtons.length;
 const item=componentButtons[componentPosition],d=item.dataset;
 const photo=componentDialog.querySelector('.dialog-photo>img');
 photo.src=d.componentImage;photo.alt=d.componentTitle+' component reference';
 componentDialog.querySelector('#component-dialog-title').textContent=d.componentTitle;
 componentDialog.querySelector('.dialog-process').textContent=d.componentProcess;
 componentDialog.querySelector('.dialog-description').textContent=d.componentDesc;
 componentDialog.querySelector('.dialog-rfq').href=d.componentRfq;
 componentDialog.querySelector('.dialog-counter').textContent=`${componentPosition+1} / ${componentButtons.length}`;
}
document.querySelectorAll('.component-gallery').forEach(gallery=>{
 const cards=[...gallery.querySelectorAll('.component-card')];
 gallery.querySelectorAll('[data-component-filter]').forEach(button=>button.addEventListener('click',()=>{
  gallery.querySelectorAll('[data-component-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const category=button.dataset.componentFilter;
  cards.forEach(card=>{card.hidden=category!=='all'&&card.dataset.componentCategory!==category});
  const count=cards.filter(c=>!c.hidden).length;
  gallery.querySelector('.component-count').textContent=`${count} collection${count===1?'':'s'}`;
 }));
 const requestedMaterial=new URLSearchParams(location.search).get('material');
 if(requestedMaterial){
  const initialFilter=[...gallery.querySelectorAll('[data-component-filter]')].find(b=>b.dataset.componentFilter===requestedMaterial.toLowerCase());
  initialFilter?.click();
 }
 gallery.querySelectorAll('.component-photo').forEach(button=>button.addEventListener('click',()=>{
  if(!componentDialog)return;
  componentButtons=cards.filter(c=>!c.hidden).map(c=>c.querySelector('.component-photo'));
  componentOpener=button;showComponent(componentButtons.indexOf(button));
  componentDialog.showModal();document.body.classList.add('gallery-dialog-open');
 }));
});
if(componentDialog){
 componentDialog.querySelector('.dialog-close').addEventListener('click',()=>componentDialog.close());
 componentDialog.querySelector('[data-gallery-prev]').addEventListener('click',()=>showComponent(componentPosition-1));
 componentDialog.querySelector('[data-gallery-next]').addEventListener('click',()=>showComponent(componentPosition+1));
 componentDialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'){event.preventDefault();showComponent(componentPosition+1)}
  if(event.key==='ArrowLeft'){event.preventDefault();showComponent(componentPosition-1)}
 });
 componentDialog.addEventListener('click',event=>{if(event.target===componentDialog){const r=componentDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)componentDialog.close()}});
 componentDialog.addEventListener('close',()=>{document.body.classList.remove('gallery-dialog-open');componentOpener?.focus()});
}
