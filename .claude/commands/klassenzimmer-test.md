---
description: Klassenzimmer-Test für eine Lern-App (Messung plus vier Personas)
argument-hint: <pfad/zur/app.html>
---
Führe den Klassenzimmer-Test für `$ARGUMENTS` durch.

1. Messung: `node .claude/skills/kinder-lernapp/audit.cjs $ARGUMENTS`. Das Skript ist auf Demokratie-Kids zugeschnitten. Bei einer anderen App meldest du das und überspringst die Messung, statt Durchlaufschritte zu raten.
2. Datenschutz-Gate: `echo '{"tool_input":{"file_path":"$ARGUMENTS"}}' | node .claude/hooks/html-datenschutz-gate.cjs`.
3. Rufe die vier Agenten parallel auf: `persona-lesestart`, `persona-daz`, `persona-lrs`, `persona-lehrkraft-ipad`. Jeder bekommt den Dateipfad.
4. Fasse zusammen: gemessene Funde, Funde der Personas (Dopplungen zusammenfassen), danach zwei Listen: was behoben werden kann, und was nur mit echten Kindern und Geräten prüfbar bleibt. Ändere nichts ohne Auftrag. Inhalte und pädagogische Entscheidungen gehören der Lehrkraft.
