// Run with window.__LS_EXPORT set to the object to export (e.g. window.__LS_EXPORT = window.__LS_LIBBY).
// Renders it as text in the page so it can be read with get_page_text (JS tool results get truncated near 800 chars).
document.body.innerHTML = '<pre id="ls-export" style="white-space:pre-wrap;word-break:break-all"></pre>';
document.getElementById('ls-export').textContent = JSON.stringify(window.__LS_EXPORT);
console.log(JSON.stringify(window.__LS_EXPORT).length + ' chars');
