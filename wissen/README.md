# Wissen: Notizen und Wegweiser

Eine Notiz pro Projekt, App, Konzept oder Skill. Die Notizen sind die einzige Quelle. Der Wegweiser (`wegweiser.html`) wird daraus erzeugt.

Neu bauen: `node wissen/bauen.cjs`

## Notiz anlegen
Datei `wissen/<ordner>/<kurzname>.md` mit Kopfblock (`titel`, `typ`, `bereich`, `sichtbarkeit`, `status`, `tags`, `version_hier`, `version_aktuell`, `fundorte`, `offen`, `quelle`) und Verweisen im Text als `[[kurzname]]`. Listen im Kopfblock trennst du mit `;`. Beispiel: `apps/app-demokratie-kids.md`.

## Regeln
- Nur Titel, Status, Version, Fundort und Links. Keine Inhalte, keine Namen, keine Kontaktdaten, nichts aus Klassenlisten.
- Privates (Roman, LLM-Konzept) gehört nicht in dieses Verzeichnis. Wenn du es lokal verknüpfen willst: Notizen unter `wissen/privat/` ablegen und `node wissen/bauen.cjs --mit-privat` ausführen. Das Ergebnis `wegweiser-privat.html` und der Ordner `privat/` stehen in `.gitignore` und werden nie geteilt.
- Alle Einträge stammen bisher aus der Projektlandkarte vom 23.09.2026 und sind nicht neu geprüft.
- Vorschläge im Reiter Lücken entstehen aus gemeinsamen Themen (mindestens zwei). Sie sind Hinweise, keine Tatsachen.
