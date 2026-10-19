// Run on any https page (OverDrive's public API allows cross-origin reads). Needs window.__LS_CONFIG = { libraries: [{key,name}] }
// and the shelf in window.__LS_SHELF (or window.name). Starts a background scan; poll window.__LS_LIBBY_STATE.
// Result: window.__LS_LIBBY = { [goodreadsId]: { "<libKey>:a"|"<libKey>:e": [copiesAvailable, holds], dur: audiobookMinutes } }
(() => {
  const cfg = window.__LS_CONFIG;
  const shelf = window.__LS_SHELF || JSON.parse(window.name);
  const skip = cfg.skipScripts ? new RegExp(cfg.skipScripts.map(s => `\\p{Script=${s}}`).join('|'), 'u') : null;
  const norm = s => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[:–—].*$/, '').replace(/^(the|a|an) /, '').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();
  const secs = s => { const p = s.split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : 0; };
  const list = shelf.filter(b => !(skip && skip.test(b.t)));
  window.__LS_LIBBY = {};
  const st = window.__LS_LIBBY_STATE = { total: list.length, done: 0, fin: false, errors: 0 };
  async function one(b) {
    // Non-Latin titles are matched by title only: the catalog lists the author in the original script.
    const latin = !/[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/u.test(b.t);
    const last = (b.a.split(',')[0] || '').toLowerCase().trim();
    const q = b.t.replace(/\(.*?\)/g, '').trim();
    const out = {};
    for (const lib of cfg.libraries) {
      try {
        const j = await fetch(`https://thunder.api.overdrive.com/v2/libraries/${lib.key}/media?query=${encodeURIComponent(q)}&perPage=12&format=ebook-overdrive,audiobook-overdrive`).then(r => r.json());
        for (const i of j.items || []) {
          if (norm(i.title) !== norm(b.t) || (latin && !(i.firstCreatorName || '').toLowerCase().includes(last))) continue;
          const f = i.type && i.type.id === 'audiobook' ? 'a' : 'e';
          const k = `${lib.key}:${f}`;
          const cur = out[k];
          const v = i.isAvailable ? (i.availableCopies || 1) : 0, h = i.holdsCount || 0;
          out[k] = cur ? [Math.max(cur[0], v), Math.min(cur[1], h)] : [v, h];
          if (f === 'a' && !out.dur) { const fm = (i.formats || []).find(x => x.duration); if (fm) out.dur = Math.round(secs(fm.duration) / 60); }
        }
      } catch (e) { st.errors++; }
    }
    if (Object.keys(out).length) window.__LS_LIBBY[b.id] = out;
    st.done++;
  }
  let idx = 0;
  const worker = async () => { while (idx < list.length) await one(list[idx++]); };
  Promise.all([1, 2, 3, 4, 5, 6].map(worker)).then(() => { st.fin = true; });
})();
