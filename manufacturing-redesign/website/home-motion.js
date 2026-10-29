// Optional, one-shot motion: content stays visible if scripting is unavailable.
(() => {
 const root = document.querySelector('.home-page');
 if (!root) return;
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 const running = new Set();
 function reveal(element, delay = 0, image = false) {
  if (preference.matches || !element.animate) return;
  const small = matchMedia('(max-width: 700px)').matches;
  const frames = image && !small
   ? [{opacity: .6, transform: 'scale(.975)'}, {opacity: 1, transform: 'scale(1)'}]
   : [{opacity: .3, transform: `translateY(${small ? 8 : 18}px)`}, {opacity: 1, transform: 'translateY(0)'}];
  const animation = element.animate(frames, {duration: small ? 380 : 650, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards'});
  running.add(animation);
  animation.finished.catch(() => {}).finally(() => running.delete(animation));
 }
 const hero = root.querySelector('.home-hero');
 if (hero && hero.getBoundingClientRect().bottom > 0) {
  hero.querySelectorAll('.eyebrow,h1,p,.home-actions,.home-hero-notes').forEach((el,i) => reveal(el, i*65));
  hero.querySelectorAll('figure').forEach((el,i) => reveal(el, 120+i*90, true));
 }
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    if (el.matches('.journey article')) el.classList.add('is-highlighted');
    reveal(el, Math.min([...el.parentElement.children].indexOf(el),3)*65);
    observer.unobserve(el);
   });
  }, {threshold: .15});
  root.querySelectorAll('.home-capabilities article,.home-data-layout>div,.journey article').forEach(el => observer.observe(el));
 }
 root.querySelectorAll('[role="tab"]').forEach(tab => tab.addEventListener('click', () => {
  const panel = document.getElementById(tab.getAttribute('aria-controls'));
  if (panel && !panel.hidden) reveal(panel);
 }));
 root.querySelectorAll('[data-component-filter]').forEach(button => button.addEventListener('click', () => {
  root.querySelectorAll('.component-card:not([hidden])').forEach((el,i) => {if(i<6) reveal(el,i*35)});
 }));
 preference.addEventListener('change', () => {if(preference.matches) running.forEach(animation => animation.cancel())});
})();
