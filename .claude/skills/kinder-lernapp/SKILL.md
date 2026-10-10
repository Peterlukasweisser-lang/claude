---
name: kinder-lernapp
description: Prüft und überarbeitet Lern-Apps und Lernseiten für Kinder der Klassen 3 bis 4 (Einzeldatei-HTML, Handy und Tablet) nach festen Kriterien zu Lesbarkeit, Bedienbarkeit, Motivation, Barrierefreiheit und Datensparsamkeit. Verwenden, wenn die Demokratie-Kids-App oder eine ähnliche Lernseite gestaltet, verbessert, animiert oder vor dem Einsatz in der Klasse geprüft werden soll. Nicht für Erwachsenen-UI, Landingpages oder Dashboards.
---

# Kinder-Lernapp: Kriterien und Prüfablauf

Zielgruppe: Kinder Klasse 3 bis 4, Einsatz auf Schul- und Privatgeräten (Handy, Tablet), Lehrkraft in NRW als Auftraggeber. Du-Form, Deutsch.

Diese Kriterien haben Vorrang vor Designtrends. Wenn eine Designregel aus einem anderen Skill (zum Beispiel "mutig", "außergewöhnlich", "Awwwards") einem Kriterium hier widerspricht, gilt dieses Dokument.

## Grundhaltung

1. Inhalte und Lernziele ändert der Skill nicht. Texte, Fragen und Antworten nur auf ausdrückliche Bitte anfassen. Vorschläge zu Sprache und Leseniveau als Liste machen, nicht still umschreiben.
2. Pädagogische Entscheidungen (Belohnungssystem, Pflichtfelder, Vergleichsfunktionen) trifft die Lehrkraft. Der Skill benennt das Risiko und fragt.
3. Kein Test ersetzt Kinder. Jede Prüfung endet mit dem Hinweis, was nur mit echten Kindern und echten Geräten prüfbar ist.

## Kriterien

**Lesbarkeit**
- Text, den Kinder lesen müssen: Ziel 16 px, hartes Minimum 14 px. Reine Beschriftungen und Zähler: Minimum 13 px.
- Kontrast Text zu Hintergrund mindestens 4,5:1 (WCAG 2.2, SC 1.4.3). Grauer Zusatztext auf dunklem Grund ist die häufigste Schwachstelle.
- Zoomen niemals sperren (`user-scalable=no` und `maximum-scale=1` sind verboten). Eingabefelder mit mindestens 16 px, sonst zoomt iOS beim Antippen.
- Kurze Sätze. Richtwert: höchstens 12 Wörter pro Satz in Aufgabenstellungen, ein Gedanke pro Satz, keine Verneinungsketten, Fachwörter nur mit Erklärung (die App hat dafür ein Glossar). Das ist eine Faustregel dieses Skills, kein normierter Grenzwert.
- Vorlesefunktion bei allem, was Kinder lesen müssen, um weiterzukommen.

**Bedienbarkeit**
- Tippflächen mindestens 44 × 44 px (WCAG 2.2 verlangt als AA nur 24 px, für Kinderhände gilt 44 als Ziel). Abstand zwischen Tippflächen mindestens 4 px.
- Hover-Effekte nur hinter `@media (hover:hover) and (pointer:fine)`, sonst bleiben sie nach dem Tippen auf Touchgeräten hängen.
- Ziele bewegen sich nicht. Knöpfe pulsieren per Leuchtring, nicht per Größenänderung.
- Jede Aktion hat sofort sichtbare Rückmeldung (`:active`-Zustand).
- Jeder Bildschirm hat einen erkennbaren Weg zurück. Nichts geht durch Zurücktippen verloren.

**Animation und Spiel**
- Bewegung dient der Rückmeldung (richtig, falsch, geschafft), nicht der Dauerunterhaltung. Dauerbewegung nur klein, langsam und am Rand.
- `prefers-reduced-motion` schaltet alle Animationen ab, auch Hintergrund und Konfetti.
- Feiern passend zur Leistung. Schwache Ergebnisse bekommen Ermutigung zum Weitermachen, keine Party und keine Strafe.
- Falsche Antworten erklären, was stimmt. Kein Verlust von Punkten, keine Lebensanzeige, keine Zeitdruck-Anzeige.
- Verboten: Ranglisten und Vergleich zwischen Kindern, Serien mit Verlustangst ("Streak"), Countdown, zufällige Belohnungen, Werbung, In-App-Käufe.

**Daten und Datenschutz**
- Datensparsamkeit (Art. 5 Abs. 1 lit. c DSGVO): nur erfassen, was die App braucht. Ein Spitzname reicht. Pflichtfelder wie Geschlecht und Hautfarbe sind zu begründen oder optional zu machen.
- Keine externen Aufrufe: Schriften, Skripte, Bilder eingebettet, kein Tracking, keine CDNs.
- Daten bleiben auf dem Gerät, Weitergabe nur bewusst durch das Kind oder die Lehrkraft (zum Beispiel per QR).
- Schulrechtliche Vorgaben zur Verarbeitung von Schülerdaten in NRW (zum Beispiel VO-DV I) prüft die Lehrkraft. Der Skill ersetzt diese Prüfung nicht.

**Technik**
- Kein horizontaler Überlauf bei 360 px Breite.
- Lange Namen (20 Zeichen) sprengen kein Layout.
- Keine JavaScript-Fehler außer dem erwarteten Service-Worker-Hinweis unter `file://`.

## Prüfablauf

1. Automatisch: `node .claude/skills/kinder-lernapp/audit.cjs <app.html>`. Das Skript spielt die Demokratie-Kids-App bei 360 und 390 px durch und meldet Schrift unter 13 px, Tippflächen unter 44 px, Kontrast unter 4,5:1, horizontalen Überlauf und JS-Fehler. Grenzen des Skripts: Kontrast auf Farbverläufen wird übersprungen, die Punkte-Navigation der Lernkarten ist wegen ihrer vergrößerten Tippfläche per `::before` ausgenommen, und der Durchlauf ist auf diese App zugeschnitten (Funktionsnamen wie `startQuiz`). Bei anderen Apps zuerst den Durchlauf im Skript anpassen.
2. Von Hand: Screenshots der Hauptbildschirme ansehen, nicht nur Zahlen lesen.
3. Änderungen als zusätzliche Schicht (CSS/JS) vor Eingriffen in die App-Logik bevorzugen, danach Durchlauf wiederholen.
4. Schluss mit zwei Listen: was geprüft und behoben ist, und was nur mit Kindern oder echten Geräten prüfbar bleibt.

## Offene Entscheidungen der Lehrkraft (Stand Demokratie-Kids v20)

- Der Start-Knopf ist gesperrt, bis ein Geschlecht gewählt ist. Soll das Pflicht bleiben?
- Das XP- und Abzeichen-System ist extrinsische Motivation. Soll es bleiben, abgeschwächt oder durch inhaltliche Rückmeldung ersetzt werden?
- Die Frisur-Beschriftung zeigt "cut" statt "undercut". Ist das gewollt?
- Dunkles Design oder zusätzlich ein helles Schema für Beamer und Tageslicht?
