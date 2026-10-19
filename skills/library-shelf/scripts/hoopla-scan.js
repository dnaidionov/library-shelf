// Run on a hoopladigital.com tab where the user is already logged in (never ask for or type a password).
// Needs the shelf in window.name (set by goodreads-shelf.js) and window.__LS_HOOPLA_LIMIT (default: all).
// Resumable: progress lives in sessionStorage; run again after a reload and it continues.
// Hoopla's pages are heavy and crash the tab after roughly 450 searches, so run in chunks of ~400 and reload between them.
// Result: window.__LS_HOOPLA = { [goodreadsId]: "a" | "e" | "ae" }
(() => {
  const shelf = JSON.parse(window.name);
  const cfg = window.__LS_CONFIG || {};
  const skip = cfg.skipScripts ? new RegExp(cfg.skipScripts.map(s => `\\p{Script=${s}}`).join('|'), 'u') : null;
  const norm = s => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[:–—].*$/, '').replace(/^(the|a|an) /, '').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();
  const list = shelf.filter(b => !(skip && skip.test(b.t)));
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem('ls_hoopla') || '{}'); } catch (e) {}
  const hits = window.__LS_HOOPLA = saved.hits || {};
  const st = window.__LS_HOOPLA_STATE = { total: list.length, next: Math.max(0, (saved.next || 0) - 6), fin: false, timeouts: 0 };
  const limit = Math.min(list.length, window.__LS_HOOPLA_LIMIT || list.length);
  const persist = () => { try { sessionStorage.setItem('ls_hoopla', JSON.stringify({ next: st.next, hits })); } catch (e) {} };
  async function one(b) {
    const latin = !/[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/u.test(b.t);
    const last = (b.a.split(',')[0] || '').toLowerCase().trim();
    const f = document.createElement('iframe');
    f.style.cssText = 'width:900px;height:700px;position:fixed;left:-3000px';
    f.src = '/search?q=' + encodeURIComponent(b.t.replace(/\(.*?\)/g, '').trim()) + '&scope=BOOKS';
    document.body.appendChild(f);
    try {
      await new Promise((res, rej) => { f.onload = res; setTimeout(() => rej('timeout'), 15000); });
      let t = '';
      for (let i = 0; i < 24; i++) { await new Promise(r => setTimeout(r, 500)); t = f.contentDocument.body.innerText; if (/Showing \d+|No results|0 results/i.test(t) && i > 1) break; }
      const L = t.split('\n').map(x => x.trim()).filter(Boolean);
      let a = false, e = false;
      for (let i = 0; i < L.length - 2; i++) {
        if (L[i] !== 'Audiobook' && L[i] !== 'Ebook') continue;
        let j = i + 1; if (L[j] === 'PA' || L[j] === 'Explicit') j++;
        if (norm(L[j]) === norm(b.t) && (!latin || (L[j + 1] || '').toLowerCase().includes(last))) { if (L[i] === 'Audiobook') a = true; else e = true; }
      }
      if (a || e) hits[b.id] = (a ? 'a' : '') + (e ? 'e' : '');
    } catch (err) { st.timeouts++; }
    f.remove();
  }
  const worker = async () => { while (st.next < limit) { const b = list[st.next++]; await one(b); persist(); } };
  Promise.all([1, 2, 3].map(worker)).then(() => { st.fin = true; persist(); });
})();
