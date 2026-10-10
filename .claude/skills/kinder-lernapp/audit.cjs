// Prüft eine Einzeldatei-Lern-App (HTML) auf kindgerechte Mindeststandards.
// Aufruf: node audit.cjs <pfad/zur/app.html>
// Erwartet global installiertes Playwright (npm root -g) und Chromium.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const MIN_FONT = 13, MIN_TAP = 44, MIN_CONTRAST = 4.5;
const file = process.argv[2];
if (!file) { console.error('Pfad zur HTML-Datei fehlt'); process.exit(1); }

(async () => {
  const browser = await chromium.launch();
  let problems = 0;
  for (const [w, h] of [[360, 640], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on('pageerror', e => { if (!/ServiceWorker/.test(e.message)) errors.push(e.message); });
    await page.goto('file://' + require('path').resolve(file));
    await page.waitForTimeout(500);
    // App-spezifischer Durchlauf (Demokratie-Kids); Fehler hier werden gemeldet, nicht verschluckt.
    const screens = [
      ['Onboarding', async () => {}],
      ['Home', async () => { await page.click('.ob-chip[data-v="w"]'); await page.fill('#av-name', 'Mia'); await page.click('#ob-go'); }],
      ['Thema', () => page.evaluate(() => openThema('demokratie'))],
      ['Lernkarten', () => page.evaluate(() => startLK())],
      ['Quiz', () => page.evaluate(() => { goTo('s-thema'); startQuiz(); })],
      ['Szenario', () => page.evaluate(() => { goTo('s-thema'); startSz(0); })],
      ['Ergebnis', () => page.evaluate(() => showErg('quiz', 30))],
      ['Abzeichen', () => page.evaluate(() => goTo('s-badges'))],
    ];
    for (const [name, step] of screens) {
      try { await step(); } catch (e) { console.log(`[${w}px] ${name}: Schritt fehlgeschlagen: ${e.message.split('\n')[0]}`); continue; }
      await page.waitForTimeout(900);
      const r = await page.evaluate(([MIN_FONT, MIN_TAP, MIN_CONTRAST]) => {
        const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
        const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] === undefined ? 1 : m[3] }; };
        const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
        const hasGradient = el => { for (let e = el; e; e = e.parentElement) { if (getComputedStyle(e).backgroundImage !== 'none') return true; } return false; };
        const bgOf = el => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.a > 0) layers.push(c); if (c.a >= 1) break; }
          let base = { r: 15, g: 15, b: 36 }; for (let i = layers.length - 1; i >= 0; i--) { const l = layers[i]; base = { r: l.r * l.a + base.r * (1 - l.a), g: l.g * l.a + base.g * (1 - l.a), b: l.b * l.a + base.b * (1 - l.a) }; } return base; };
        const active = document.querySelector('.screen.active') || document.body;
        const out = { overflow: document.documentElement.scrollWidth - innerWidth, small: [], tap: [], contrast: [] };
        const seen = new Set();
        active.querySelectorAll('*').forEach(el => {
          if (!vis(el)) return;
          const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
          if (own) {
            const s = getComputedStyle(el), fs = parseFloat(s.fontSize), t = el.textContent.trim().slice(0, 28);
            if (fs < MIN_FONT && !seen.has('f' + t)) { seen.add('f' + t); out.small.push(`${fs}px "${t}"`); }
            const fg = parse(s.color), bg = bgOf(el), a = fg.a;
            const mix = { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
            const L1 = lum(mix), L2 = lum(bg), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
            if (!hasGradient(el) && cr < MIN_CONTRAST && !seen.has('c' + t)) { seen.add('c' + t); out.contrast.push(`${cr.toFixed(1)}:1 "${t}"`); }
          }
          const clickable = el.matches('button,[onclick],input,textarea,select,a[href]');
          if (clickable) { const r = el.getBoundingClientRect(), k = 't' + el.className + el.id;
            if (Math.min(r.width, r.height) < MIN_TAP && !el.classList.contains('dot') && !seen.has(k)) { seen.add(k); out.tap.push(`${Math.round(r.width)}x${Math.round(r.height)} .${(el.className + '').split(' ')[0] || el.tagName}`); } }
        });
        return out;
      }, [MIN_FONT, MIN_TAP, MIN_CONTRAST]);
      const n = r.small.length + r.tap.length + r.contrast.length + (r.overflow > 0 ? 1 : 0);
      problems += n;
      console.log(`[${w}px] ${name}: ${n ? n + ' Auffälligkeiten' : 'ok'}`);
      if (r.overflow > 0) console.log(`   horizontaler Überlauf: ${r.overflow}px`);
      for (const [label, list] of [['Schrift <' + MIN_FONT + 'px', r.small], ['Tippfläche <' + MIN_TAP + 'px', r.tap], ['Kontrast <' + MIN_CONTRAST, r.contrast]])
        if (list.length) console.log(`   ${label}: ${list.slice(0, 8).join(' | ')}${list.length > 8 ? ' … (+' + (list.length - 8) + ')' : ''}`);
    }
    if (errors.length) { problems += errors.length; console.log(`[${w}px] JS-Fehler: ${errors.join(' | ')}`); }
    await page.close();
  }
  await browser.close();
  console.log(problems ? `\n${problems} Auffälligkeiten insgesamt` : '\nAlles im grünen Bereich');
  process.exit(problems ? 1 : 0);
})();
