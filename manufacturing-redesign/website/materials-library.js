(() => {
  document.querySelectorAll('[data-catalog]').forEach(catalog => {
    const input = catalog.querySelector('[data-search]');
    const buttons = [...catalog.querySelectorAll('button[data-group]')];
    const cards = [...catalog.querySelectorAll('.library-card')];
    const count = catalog.querySelector('[data-count]');
    const empty = catalog.querySelector('.catalog-empty');
    let group = 'All';
    const update = () => {
      const query = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(card => {
        const matches = (group === 'All' || card.dataset.group === group) && card.textContent.toLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) shown++;
      });
      count.textContent = `${shown} of ${cards.length} options${group === 'All' ? '' : ' · ' + group}`;
      empty.hidden = shown !== 0;
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      group = button.dataset.group;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      update();
    }));
    input.addEventListener('input', update);
    update();
  });
})();
