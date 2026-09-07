export function initCatalogSearch() {
  const sidebarInput = document.querySelector<HTMLInputElement>('#pc-search');
  const catalogInput = document.querySelector<HTMLInputElement>('#pc-catalog-search');
  const inputs = [sidebarInput, catalogInput].filter((input): input is HTMLInputElement => Boolean(input));
  const navBody = document.getElementById('pc-nav-body');
  const navToggle = document.getElementById('pc-nav-toggle');
  const navGroups = [...document.querySelectorAll<HTMLDetailsElement>('[data-pc-group]')];
  const items = [...document.querySelectorAll<HTMLAnchorElement>('[data-pc-item]')].map(link => ({
    link, row: link.parentElement!, keywords: link.dataset.pcKeywords || '', href: link.getAttribute('href')!,
  }));
  const cards = [...document.querySelectorAll<HTMLElement>('[data-catalog-item]')];
  const catalogGroups = [...document.querySelectorAll<HTMLElement>('[data-catalog-group]')].map(group => ({
    group, cards: cards.filter(card => card.closest('[data-catalog-group]') === group),
  }));
  const navRows = navGroups.map(group => ({ group, rows: [...group.querySelectorAll('li')] }));
  const savedOpen = new Set<HTMLDetailsElement>();
  let query = '';

  function setNavOpen(open: boolean) {
    navBody?.classList.toggle('is-open', open);
    navToggle?.setAttribute('aria-expanded', String(open));
    navToggle?.querySelector('.pc-nav-chev')?.classList.toggle('rotate-180', open);
  }
  navToggle?.addEventListener('click', () => setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true'));

  function filter(value: string) {
    const nextQuery = value.trim().toLowerCase();
    if (!query && nextQuery) {
      savedOpen.clear();
      navGroups.filter(group => group.open).forEach(group => savedOpen.add(group));
    }
    const wasSearching = Boolean(query);
    query = nextQuery;
    inputs.forEach(input => { if (input.value !== value) input.value = value; });
    const matches = new Set<string>();
    items.forEach(item => {
      const match = !query || item.keywords.includes(query);
      item.row.hidden = !match;
      if (match) matches.add(item.href);
    });
    navRows.forEach(({ group, rows }) => {
      group.hidden = !rows.some(row => !row.hidden);
      if (query) group.open = !group.hidden;
      else if (wasSearching) group.open = savedOpen.has(group);
    });
    cards.forEach(card => { card.hidden = !matches.has(card.dataset.catalogItem!); });
    catalogGroups.forEach(({ group, cards }) => { group.hidden = !cards.some(card => !card.hidden); });
    document.getElementById('pc-noresults')?.classList.toggle('hidden', matches.size > 0 || !query);
    document.getElementById('pc-catalog-empty')?.classList.toggle('hidden', matches.size > 0 || !query);
    const korean = document.documentElement.lang === 'ko';
    const count = document.getElementById('pc-catalog-count');
    if (count) count.textContent = query
      ? korean ? `${matches.size}개 검색 결과` : `${matches.size} ${matches.size === 1 ? 'result' : 'results'}`
      : korean ? `${items.length}개 항목` : `${items.length} items`;
    const navCount = document.getElementById('pc-search-count');
    if (navCount) {
      navCount.classList.toggle('hidden', !query);
      navCount.textContent = korean ? `${matches.size}개 검색 결과` : `${matches.size} ${matches.size === 1 ? 'result' : 'results'}`;
    }
  }
  function syncLanguage() {
    inputs.forEach(input => {
      input.placeholder = (document.documentElement.lang === 'ko' ? input.dataset.placeholderKo : input.dataset.placeholderEn) || '';
    });
    filter(catalogInput?.value || sidebarInput?.value || '');
  }
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input === sidebarInput && input.value) setNavOpen(true);
      filter(input.value);
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); filter(''); }
    });
  });
  document.getElementById('pc-clear-search')?.addEventListener('click', () => {
    filter('');
    (catalogInput || sidebarInput)?.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    (catalogInput || sidebarInput)?.focus();
  });
  // Category links must recover their target after a search hides that section.
  document.addEventListener('click', event => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!link || !catalogInput) return;
    const destination = new URL(link.href);
    if (destination.pathname !== location.pathname) return;
    if (destination.hash === '#catalog' || catalogGroups.some(({ group }) => `#${group.id}` === destination.hash)) filter('');
  });
  document.addEventListener('pc-language-change', syncLanguage);
  syncLanguage();
  navBody?.closest('.site-sidebar')?.classList.add('is-enhanced');
}
