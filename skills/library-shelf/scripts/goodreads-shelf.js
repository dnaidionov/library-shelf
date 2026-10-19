// Run on a goodreads.com tab (the user's own browser session). Needs window.__LS_CONFIG = { goodreadsUserId, shelf }.
// Result: window.__LS_SHELF = [{ id, t, a, added, pages, rating }], also kept in window.name so it survives navigation.
(async () => {
  const cfg = window.__LS_CONFIG;
  const shelf = [];
  for (let p = 1; p <= 40; p++) {
    const url = `/review/list/${cfg.goodreadsUserId}?shelf=${encodeURIComponent(cfg.shelf || 'to-read')}&per_page=100&page=${p}&sort=date_added&order=d`;
    const html = await fetch(url).then(r => r.text());
    const rows = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('tr.bookalike')];
    if (!rows.length) break;
    for (const r of rows) {
      const a = r.querySelector('td.field.title a');
      const id = (a?.getAttribute('href') || '').match(/show\/(\d+)/)?.[1];
      if (!id) continue;
      const added = new Date((r.querySelector('td.field.date_added span')?.getAttribute('title') || '').trim() + ' UTC');
      const pages = Number((r.querySelector('td.field.num_pages .value')?.innerText || '').replace(/\D/g, '')) || 0;
      const rating = Number((r.querySelector('td.field.avg_rating .value')?.innerText || '').trim()) || 0;
      shelf.push({ id, t: a.title, a: (r.querySelector('td.field.author a')?.textContent || '').trim(), added: isNaN(added) ? '' : added.toISOString().slice(0, 10), pages, rating });
    }
    if (rows.length < 100) break;
  }
  window.__LS_SHELF = shelf;
  window.name = JSON.stringify(shelf);
  console.log('shelf', shelf.length);
})();
