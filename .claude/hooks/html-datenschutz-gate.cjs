#!/usr/bin/env node
// PostToolUse-Hook (Write|Edit): prüft Einzeldatei-HTML auf technische Datenschutz-Hygiene.
// Meldet auf stderr und beendet mit Exit-Code 2, damit Claude die Funde sieht und behebt.
// Grenzen: Mustervergleich, keine Rechtsprüfung. Er ersetzt weder den Skill release-check-html
// noch die Prüfung der Schule nach VO-DV I. Ausnahme im Einzelfall: Kommentar
// <!-- datenschutz-gate: erlaubt https://beispiel.de --> in der Datei.
const fs = require('fs');

let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const file = input && input.tool_input && input.tool_input.file_path;
  if (!file || !/\.html?$/i.test(file) || !fs.existsSync(file)) process.exit(0);

  const src = fs.readFileSync(file, 'utf8');
  const allowed = [...src.matchAll(/<!--\s*datenschutz-gate:\s*erlaubt\s+(\S+)\s*-->/g)].map(m => m[1]);
  const code = src.replace(/<!--[\s\S]*?-->/g, '');
  const findings = [];
  const ok = u => allowed.some(a => u.startsWith(a)) || /^https?:\/\/(www\.)?w3\.org\//.test(u);
  const add = (msg) => { if (!findings.includes(msg)) findings.push(msg); };

  // 1. Externe Ressourcen und Aufrufe (Links zum Anklicken sind kein Aufruf und bleiben erlaubt).
  const patterns = [
    [/\b(?:src|poster|data-src)\s*=\s*["']?\s*((?:https?:)?\/\/[^"'\s>]+)/gi, 'Externe Ressource (src)'],
    [/<link\b[^>]*\bhref\s*=\s*["']?\s*((?:https?:)?\/\/[^"'\s>]+)/gi, 'Externe Ressource (link)'],
    [/@import\s+(?:url\()?\s*["']?((?:https?:)?\/\/[^"')\s;]+)/gi, 'Externer CSS-Import'],
    [/url\(\s*["']?((?:https?:)?\/\/[^"')\s]+)/gi, 'Externe URL in CSS'],
    [/\b(?:fetch|import|XMLHttpRequest[^;]*?open|sendBeacon|WebSocket|EventSource)\s*\(?[^;\n]*?["'`]((?:https?:)?\/\/[^"'`\s]+)/gi, 'Externer Netzwerkaufruf im Skript'],
  ];
  for (const [re, label] of patterns) {
    for (const m of code.matchAll(re)) { if (!ok(m[1])) add(`${label}: ${m[1].slice(0, 80)}`); }
  }

  // 2. Bekannte Tracker und Font-/Script-CDNs.
  const bad = /google-analytics|googletagmanager|gtag\(|\bfbq\(|hotjar|matomo|plausible\.io|fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare|cdn\.jsdelivr|unpkg\.com/i;
  const hit = code.match(bad);
  if (hit && !allowed.some(a => hit[0] && a.includes(hit[0]))) add(`Tracker oder CDN: ${hit[0]}`);

  // 3. Zoom sperren ist laut Skill kinder-lernapp verboten.
  if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(code)) add('Zoom gesperrt (user-scalable=no oder maximum-scale=1)');

  // 4. Animationen ohne Abschaltung bei reduzierter Bewegung.
  if (/@keyframes|animation\s*:|transition\s*:/i.test(code) && !/prefers-reduced-motion/i.test(code)) add('Animationen ohne prefers-reduced-motion');

  if (!findings.length) process.exit(0);
  process.stderr.write(
    `Datenschutz-Gate: ${file}\n` + findings.map(f => ' - ' + f).join('\n') +
    '\nBitte beheben (Ressourcen einbetten, Tracker entfernen). Ausnahme nur mit Begründung per ' +
    '<!-- datenschutz-gate: erlaubt URL --> und nach Rücksprache mit der Lehrkraft. Kein Rechtsurteil.\n'
  );
  process.exit(2);
});
