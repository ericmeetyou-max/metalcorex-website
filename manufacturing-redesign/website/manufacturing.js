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
