# 🚀 Clean Posts System Migration - Manual Steps

## Schritt 1: Supabase Dashboard öffnen
1. Gehe zu https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Klicke auf "SQL Editor" im linken Menü

## Schritt 2: Hauptmigration ausführen
Kopiere den gesamten Inhalt der Datei `supabase/migrations/20250130000000_clean_posts_system.sql` und füge ihn in den SQL Editor ein.

**WICHTIG:** Diese Migration wird alle bestehenden Posts-Tabellen löschen und neu erstellen!

## Schritt 3: Migration ausführen
1. Klicke auf "Run" (oder Strg+Enter)
2. Warte bis die Migration erfolgreich abgeschlossen ist
3. Du solltest eine Erfolgsmeldung sehen

## Schritt 4: Testdaten einfügen
Kopiere den gesamten Inhalt der Datei `supabase/migrations/20250130000001_test_posts_data.sql` und füge ihn in den SQL Editor ein.

## Schritt 5: Testdaten ausführen
1. Klicke auf "Run" (oder Strg+Enter)
2. Warte bis die Testdaten erfolgreich eingefügt sind

## Schritt 6: Überprüfung
Gehe zu "Table Editor" und überprüfe, dass folgende Tabellen existieren:
- ✅ `posts` (mit Testdaten)
- ✅ `comments` (leer)
- ✅ `likes` (leer)
- ✅ `shares` (leer)

## Schritt 7: Anwendung testen
1. Gehe zu http://localhost:3000
2. Logge dich ein
3. Gehe zum Dashboard
4. Du solltest die Test-Posts sehen mit Namen und Beschreibungen
5. Teste das Erstellen neuer Posts
6. Teste das Liken, Kommentieren und Teilen

## Was passiert nach der Migration:
- ✅ Alle alten Posts-Tabellen werden gelöscht
- ✅ Neue, saubere Tabellen werden erstellt
- ✅ Test-Posts werden eingefügt
- ✅ Alle Interaktionen (Like, Comment, Share) funktionieren
- ✅ Namen und Beschreibungen werden korrekt angezeigt

## Bei Problemen:
Falls etwas nicht funktioniert, überprüfe:
1. Ob alle Tabellen korrekt erstellt wurden
2. Ob die RLS Policies aktiv sind
3. Ob die Testdaten eingefügt wurden
4. Ob der Server läuft (http://localhost:3000)