# KI-Lernwerkstatt

Eigenständige Offline-PWA von Malik Bölüm. Kein Build, keine Pakete, kein Backend, kein API-Schlüssel. Die App führt keine KI-Inferenz aus: Karten und Kostenrechnung laufen vollständig auf dem Gerät.

**[KI-Lernwerkstatt auf GitHub Pages öffnen →](https://malikbolum.github.io/ki-lernwerkstatt-pwa/)**

## Die Idee

Die KI-Lernwerkstatt verbindet Inhalte aus Data Science und KI mit einer betriebswirtschaftlichen Perspektive. Das Portfolio-Projekt macht Begriffe greifbar, lädt zum eigenständigen Lernen ein und zeigt, wie sich Modellkosten und wirtschaftlicher Nutzen gemeinsam betrachten lassen.

### A · Verstehen: Karteikarten

Zehn vorbereitete Karten behandeln LLMs, Harness, RAG, Memory, Prompt Injection, Token-Ökonomie, EU AI Act, Amortisation, Modellqualität und menschliche Freigaben. Antworten lassen sich aufdecken und als „Sicher“ oder „Noch üben“ bewerten. Themenfilter, gemischte Reihenfolge und eigene Karten unterstützen das Lernen im eigenen Tempo.

### B · Anwenden: ROI und Tokenkosten

Ein interaktiver Rechner vergleicht Frontier- und Mini-/Lokal-Modelle mit einem manuellen Prozess. Verändere Vorgangszahl, Zeitbedarf, Personalkosten, Tokenvolumen, Preise und Einführungsaufwand. Die App berechnet monatliche Gesamtkosten, Nettoersparnis, Amortisationsdauer und einen einfachen 12-Monats-ROI. Die Beispielannahmen sind frei editierbar und keine aktuellen Anbieterpreise.

### C · Weiterdenken: Notizen und Lernstand

Eigene Erkenntnisse und Lernfortschritte werden lokal gespeichert. Ein JSON-Export ermöglicht Sicherungen und den Transfer auf andere Geräte; vor dem Import zeigt die App eine geprüfte Vorschau. Nach dem ersten vollständigen Laden funktioniert die Lernwerkstatt auch offline und lässt sich auf unterstützten Geräten als App installieren.

## Technik im Überblick

Vanilla HTML, CSS und JavaScript, Web-App-Manifest und ein versionierter Service Worker. Sämtliche App-Ressourcen liegen lokal im Projekt und werden über relative Pfade geladen. Dadurch funktioniert dieselbe Anwendung sowohl unter einer eigenen Domain als auch im GitHub-Pages-Unterordner. Keine externen CDNs, Tracker oder kostenpflichtigen Modellaufrufe.

## Starten und bereitstellen

Den kompletten Ordner über einen lokalen HTTP-Server oder HTTPS bereitstellen. Zum Beispiel, falls Python verfügbar ist, im übergeordneten Ordner `python3 -m http.server 8080` ausführen und `http://localhost:8080/ki-lernwerkstatt-pwa/` öffnen. Ein file://-Start unterstützt weder Installation noch Service Worker.

GitHub Pages: Die Dateien unverändert im Stamm des Repositories `malikbolum/ki-lernwerkstatt-pwa` ablegen und unter Settings → Pages den Branch `main` und `/(root)` auswählen. Die vorgesehene Adresse ist [malikbolum.github.io/ki-lernwerkstatt-pwa/](https://malikbolum.github.io/ki-lernwerkstatt-pwa/).

## Installieren

- iOS / iPadOS: Safari → Teilen → Zum Home-Bildschirm → ggf. Als Web-App öffnen → Hinzufügen.
- Android: Chrome → Menü → App installieren / Zum Startbildschirm hinzufügen.
- macOS: Safari → Ablage → Zum Dock hinzufügen; alternativ Chrome oder Edge mit Installationsfunktion.
- Windows: Edge oder Chrome → Installationssymbol bzw. Apps-Menü.

Erst einmal online laden und auf **Offline bereit** warten. Danach die App schließen, Flugmodus aktivieren und erneut starten. Alle drei Bereiche benötigen kein Netz. Installationsbezeichnungen hängen von Browser und OS ab. Nicht jeder Desktop-Browser bietet eine native PWA-Installation.

## Daten und Backups

Lernstände, bis zu 200 eigene Karten, bis zu 50.000 Zeichen Notizen, Design und Rechnerannahmen werden in localStorage gespeichert. Der Schlüssel enthält den Anwendungspfad, damit Installationen in Unterordnern getrennt bleiben. Es gibt keine Serverübertragung. Browserdaten können gelöscht werden; Privatmodus und Plattformen können die Speicherdauer einschränken. Installierte Apps und Browser können getrennte Speicher haben.

JSON exportiert Schema-Version 1. Import: maximal 2 MB, validierte Felder, Karten-IDs, Grenzen und Zahlen. Die Vorschau muss ausdrücklich bestätigt werden, bevor der lokale Stand ersetzt wird. Texte werden als Text gerendert, niemals als HTML. Defekte gespeicherte Daten werden nicht still überschrieben. Bei Speicherfehlern warnt die App; Export bleibt verfügbar.

## Rechner

Sämtliche Tarife sind **fiktive, editierbare Beispielpreise in EUR ohne Umsatzsteuer**, keine Anbieterpreislisten. Die Formeln sind in der App erklärt. Die Nettoersparnis enthält verbleibende Personalkosten, Input-/Output-Tokens und monatlichen Betrieb. Für lokale Modelle sind Strom, Hardware und Wartung selbst einzutragen. Zeitgewinn bedeutet frei werdende Kapazität, nicht automatisch weniger Auszahlungen. Es gibt keine Diskontierung, Steuern oder Prognose von Tarifänderungen.

## Offline und Updates

`sw.js` hält den gesamten App-Shell in einem versionierten Cache. Bei jeder Änderung an HTML, CSS, JS, Manifest oder Icons `VERSION` in `sw.js` erhöhen. Eine neue Version wird vollständig vorgeladen; bestehende Nutzer übernehmen sie über „Jetzt aktualisieren“. Nur alte Caches mit der eigenen Scope-Kennung werden gelöscht. Fremde PWAs und ihr Cache bleiben unberührt. Lernstand liegt getrennt davon in localStorage. Die Web-App muss beim erneuten Öffnen gelegentlich online sein, um Updates zu finden.

## Dateien

- `index.html` – semantische Oberfläche und Dialoge
- `styles.css` – responsive Gestaltung, Dark Mode, Touch- und Tastaturbedienung
- `app.js` – Lernkarten, Rechner, geprüfte Backups, lokaler Zustand und Installation
- `manifest.webmanifest` – relative Start-URL, Scope, Icons und Shortcuts
- `sw.js` – versionierter, Scope-getrennter Offline-Cache
- `icons/icon-192.png`, `icons/icon-512.png` – lokale App-Icons aus Maliks Avatar
- `verify.cjs` – lokale Logikprüfung ohne externe Abhängigkeiten (`node verify.cjs`)

## Lernquellen

EU AI Act: risikobasierter Lernüberblick, keine Rechtsberatung. Stand der Prüfung: 29.10.2026. Anwendungsbezogene Pflichten und Fristen separat prüfen.

- Europäische Kommission: https://digital-strategy.ec.europa.eu/en/policies/enforcement-ai-act
- Europäische Kommission, Transparenzpflichten: https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems
- MDN, Offline-Betrieb: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation

## Abnahme

`node verify.cjs` prüft Rechenergebnisse, Grenzfälle, Importvalidierung und lokale Manifest-/Cache-Ressourcen. Browserprüfungen decken Bedienung, Speicherung und den Betrieb im Unterordner ab. Tatsächliche Installation auf allen genannten Betriebssystemen muss auf den jeweiligen Geräten geprüft werden; ein Desktop-Browsertest ist kein Ersatz dafür.

Geprüft am 29.10.2026: Karte aufdecken und bewerten; eigene Karte anlegen und löschen; Filter für offene Karten; Speicherung nach Neuladen; echter JSON-Download und bestätigter Reimport; Null-Vorgänge im Kostenrechner; heller und dunkler Modus; 390-Pixel-Ansicht ohne horizontales Überlaufen. Anschließend wurde der HTTP-Server beendet: Neuladen, Antwortanzeige und Berechnung funktionierten weiterhin aus dem Service-Worker-Cache. Die dafür angelegten Prüfkarten und Notizen wurden wieder entfernt.
