#!/usr/bin/env node
// Baut aus den Notizen unter wissen/ den Wegweiser als eine Offline-HTML.
// Aufruf:  node wissen/bauen.cjs                 -> wissen/wegweiser.html (ohne Privates)
//          node wissen/bauen.cjs --mit-privat    -> wissen/wegweiser-privat.html (liest auch wissen/privat/)
// Privates liegt nur lokal unter wissen/privat/ und steht in .gitignore. Nie committen oder teilen.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const mitPrivat = process.argv.includes('--mit-privat');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'privat' && !mitPrivat ? [] : walk(p);
    return e.name.endsWith('.md') && e.name !== 'README.md' ? [p] : [];
  });
}

const list = v => (v ? v.split(';').map(s => s.trim()).filter(Boolean) : []);

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const fm = {};
  const body = m ? m[2] : raw;
  if (m) for (const line of m[1].split('\n')) { const k = line.match(/^([\w-]+):\s*(.*)$/); if (k) fm[k[1]] = k[2].trim(); }
  const id = path.basename(file, '.md');
  const kurz = body.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('Verknüpft')) || '';
  const links = [...new Set([...body.matchAll(/\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]/g)].map(x => x[1].trim()))];
  return {
    id, titel: fm.titel || id, typ: fm.typ || 'projekt', bereich: fm.bereich || 'Sonstiges',
    sichtbarkeit: fm.sichtbarkeit || 'oeffentlich', status: fm.status || '', tags: list(fm.tags),
    versionHier: fm.version_hier || '', versionAktuell: fm.version_aktuell || '',
    fundorte: list(fm.fundorte), offen: list(fm.offen), quelle: fm.quelle || '', kurz: kurz.trim(), links,
    privat: file.includes(path.sep + 'privat' + path.sep),
  };
}

const notes = walk(root).map(parse);
const ids = new Set(notes.map(n => n.id));
const pairKey = (a, b) => [a, b].sort().join('|');
const edgeSet = new Set();
const defekt = [];
for (const n of notes) {
  for (const t of n.links) {
    if (!ids.has(t)) { defekt.push({ von: n.id, nach: t }); continue; }
    if (t !== n.id) edgeSet.add(pairKey(n.id, t));
  }
}
const edges = [...edgeSet].map(k => k.split('|'));
const deg = Object.fromEntries(notes.map(n => [n.id, 0]));
edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });

// Vorschläge: gleiche Themen (mindestens zwei gemeinsame Tags), aber noch nicht verknüpft.
// Private Notizen werden nie mit öffentlichen verschlagwortet vorgeschlagen.
const vorschlaege = [];
for (let i = 0; i < notes.length; i++) for (let j = i + 1; j < notes.length; j++) {
  const a = notes[i], b = notes[j];
  if (a.privat !== b.privat || edgeSet.has(pairKey(a.id, b.id))) continue;
  const gemeinsam = a.tags.filter(t => b.tags.includes(t));
  if (gemeinsam.length >= 2) vorschlaege.push({ a: a.id, b: b.id, tags: gemeinsam });
}
vorschlaege.sort((x, y) => y.tags.length - x.tags.length);

const data = {
  erzeugt: new Date().toISOString().slice(0, 10),
  mitPrivat,
  notes,
  edges,
  luecken: {
    einzel: notes.filter(n => deg[n.id] === 0).map(n => n.id),
    schwach: notes.filter(n => deg[n.id] === 1).map(n => n.id),
    veraltet: notes.filter(n => n.versionHier && n.versionAktuell && n.versionHier !== n.versionAktuell).map(n => n.id),
    defekt,
    vorschlaege: vorschlaege.slice(0, 30),
  },
};

const json = JSON.stringify(data).replace(/</g, '\\u003c');
const html = fs.readFileSync(path.join(root, 'vorlage.html'), 'utf8').replace('__DATA__', () => json);
const out = path.join(root, mitPrivat ? 'wegweiser-privat.html' : 'wegweiser.html');
fs.writeFileSync(out, html);
console.log(`${notes.length} Notizen, ${edges.length} Verknüpfungen, ${data.luecken.einzel.length} ohne Verknüpfung, ${vorschlaege.length} Vorschläge, ${defekt.length} defekte Links -> ${path.relative(process.cwd(), out)}`);
