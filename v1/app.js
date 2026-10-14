(() => {
  const button = document.querySelector('.notes-toggle');
  const notes = document.querySelectorAll('.review-notes');
  let shown = false;
  try { shown = sessionStorage.getItem('pl-wireframe-notes') === 'true'; } catch {}
  function render() {
    notes.forEach(note => { note.hidden = !shown; });
    button.setAttribute('aria-pressed', String(shown));
    button.innerHTML = `Design notes <span aria-hidden="true">${shown ? '−' : '＋'}</span>`;
  }
  button.addEventListener('click', () => {
    shown = !shown;
    try { sessionStorage.setItem('pl-wireframe-notes', String(shown)); } catch {}
    render();
    if (shown) notes[0]?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  });
  render();
})();
