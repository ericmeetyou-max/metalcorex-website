(() => {
 const input = document.querySelector('#serviceSearch');
 if (!input) return;
 const groups = [...document.querySelectorAll('.directory-group')];
 const result = document.querySelector('#serviceResults');
 const empty = document.querySelector('.services-empty');
 function update() {
  const query = input.value.trim().toLowerCase();
  let count = 0, families = 0;
  groups.forEach(group => {
   const family = group.querySelector('.directory-heading h2').textContent.toLowerCase();
   let visible = 0;
   group.querySelectorAll('.directory-service').forEach(card => {
    const match = (family + ' ' + card.textContent).toLowerCase().includes(query);
    card.hidden = !match;
    if (match) visible++;
   });
   group.hidden = visible === 0;
   count += visible;
   if (visible) families++;
  });
  result.textContent = `${count} ${count === 1 ? "capability" : "capabilities"} across ${families} process ${families === 1 ? "family" : "families"}`;
  empty.hidden = count !== 0;
 }
 input.addEventListener('input', update);
 document.querySelector('#clearServiceSearch').addEventListener('click', () => {input.value='';update();input.focus();});
 document.querySelectorAll('a[href^="#group-"]').forEach(link => link.addEventListener('click', () => {input.value='';update();}));
 update();
})();
