(() => {
  const notesButtons = [...document.querySelectorAll('.notes-toggle')];
  const notes = document.querySelectorAll('.review-notes');
  let shown = false;
  try { shown = sessionStorage.getItem('pl-wireframe-notes') === 'true'; } catch {}
  function renderNotes() {
    notes.forEach(note => { note.hidden = !shown; });
    notesButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(shown));
    });
  }
  notesButtons.forEach(button => button.addEventListener('click', () => {
    shown = !shown;
    try { sessionStorage.setItem('pl-wireframe-notes', String(shown)); } catch {}
    renderNotes();
    setMap(false);
    if (shown) notes[0]?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }));
  renderNotes();

  const mapButton = document.querySelector('.map-toggle');
  const mapDetails = document.querySelector('#mobile-map');
  function setMap(open) {
    mapButton.setAttribute('aria-expanded', String(open));
    mapDetails.hidden = !open;
  }
  mapButton.addEventListener('click', () => setMap(mapDetails.hidden));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mapDetails.hidden) {
      setMap(false);
      mapButton.focus();
    }
  });
  // An expanded map never covers content in the desktop layout.
  matchMedia('(min-width: 761px)').addEventListener('change', event => {
    if (event.matches) setMap(false);
  });

  if (document.body.dataset.page !== 'home') return;
  const content = JSON.parse(document.querySelector('#interaction-content').textContent);
  const cards = [...document.querySelectorAll('[data-layer]')];
  cards.forEach(card => { card.dataset.baseLabel = card.getAttribute('aria-label'); });
  const presetButtons = [...document.querySelectorAll('[data-preset]')];
  const stepButtons = [...document.querySelectorAll('[data-step]')];
  const summary = document.querySelector('.selection-summary');
  const detail = document.querySelector('.journey-detail');
  const prev = document.querySelector('.journey-prev');
  const next = document.querySelector('.journey-next');
  let step = 0;

  function highlight(layers, mode) {
    cards.forEach(card => {
      const included = layers.includes(card.dataset.layer);
      card.classList.toggle('is-selected', included);
      card.classList.toggle('is-unselected', !included);
      card.querySelector('.selection-label').textContent = included ? (mode === 'journey' ? 'This step' : 'Included') : 'Not in this example';
      const state = mode === 'full' ? '' : included ? (mode === 'journey' ? '. Current journey step.' : '. Included in this example.') : '. Not in this example.';
      card.setAttribute('aria-label', card.dataset.baseLabel + state);
    });
    document.querySelector('.ecosystem').dataset.mode = mode;
  }
  presetButtons.forEach(button => button.addEventListener('click', () => {
    const preset = content.combinations[button.dataset.preset];
    presetButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    highlight(preset.layers, button.dataset.preset === 'full' ? 'full' : 'combination');
    summary.textContent = preset.summary;
  }));

  function renderStep() {
    const item = content.journey[step];
    const name = stepButtons[step].querySelector('small').textContent;
    stepButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === step)));
    detail.className = `journey-detail ${item.id}`;
    detail.querySelector('.journey-count').textContent = `Step 0${step + 1} / 04 · ${name}`;
    detail.querySelector('.journey-title').textContent = item.title;
    detail.querySelector('.journey-copy').textContent = item.copy;
    const link = detail.querySelector('.journey-link');
    link.href = `${item.id}.html`;
    link.querySelector('.journey-link-label').textContent = `Explore ${name}`;
    prev.disabled = step === 0;
    next.disabled = step === content.journey.length - 1;
    next.querySelector('.journey-next-label').textContent = step === content.journey.length - 1 ? 'Journey complete' : 'Next step';
  }
  function chooseStep(index) {
    step = Math.max(0, Math.min(index, content.journey.length - 1));
    renderStep();
    presetButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
    highlight([content.journey[step].id], 'journey');
    const button = stepButtons[step];
    summary.textContent = `Journey · Step 0${step + 1}: ${button.querySelector('strong').textContent} with ${button.querySelector('small').textContent}. Choose a combination above to return to the stack view.`;
  }
  stepButtons.forEach(button => button.addEventListener('click', () => chooseStep(Number(button.dataset.step))));
  prev.addEventListener('click', () => chooseStep(step - 1));
  next.addEventListener('click', () => chooseStep(step + 1));
  renderStep();
  highlight(content.combinations.full.layers, 'full');
})();
// Visible, opt-in local diagnostics; no telemetry or external requests.
if (new URLSearchParams(location.search).has('measure')) {
  const report = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const value = {
      page: location.pathname,
      firstByteMs: Math.round(nav.responseStart - nav.startTime),
      domReadyMs: Math.round(nav.domContentLoadedEventEnd),
      loadedMs: Math.round(nav.loadEventEnd),
      firstContentfulPaintMs: performance.getEntriesByName('first-contentful-paint')[0] ? Math.round(performance.getEntriesByName('first-contentful-paint')[0].startTime) : null,
      htmlBytes: nav.decodedBodySize,
      resourceBytes: resources.reduce((sum, item) => sum + item.decodedBodySize, 0),
      resources: resources.map(item => ({ name: new URL(item.name).pathname, ms: Math.round(item.duration), bytes: item.decodedBodySize })),
      fonts: document.fonts.status
    };
    const panel = document.createElement('details');
    panel.id = 'loading-measurements';
    panel.open = true;
    panel.style.cssText = 'margin:24px;padding:16px;border:1px solid #aaa;background:white;color:#111;position:relative;z-index:30;overflow:auto';
    const summary = document.createElement('summary');
    summary.textContent = 'Local loading measurements';
    const output = document.createElement('pre');
    output.textContent = JSON.stringify(value, null, 2);
    panel.append(summary, output);
    document.querySelector('main').append(panel);
  }));
  if (document.readyState === 'complete') report();
  else addEventListener('load', report, { once: true });
}
