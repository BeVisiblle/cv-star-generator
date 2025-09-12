# 🚨 Community Feed Fix Guide

## Problem
Der Community Feed lädt keine Posts, Likes oder Kommentare in Lovable.

## Sofortige Lösung (2 Optionen)

### Option 1: Migration anwenden (Empfohlen)
```bash
# 1. Kopiere den Inhalt von: supabase/migrations/20250912140000_fix_community_tables.sql
# 2. Gehe zu Supabase Dashboard > SQL Editor
# 3. Füge den SQL-Code ein und führe ihn aus
# 4. Teste mit: node debug-community-feed.js
```

### Option 2: Fallback verwenden (Sofort)
Der Code wurde bereits aktualisiert mit Fallback-Unterstützung:
- Falls `community_posts` nicht existiert → verwendet `posts` Tabelle
- Falls `community_likes` nicht existiert → verwendet `likes` Tabelle
- Falls `community_comments` nicht existiert → verwendet `comments` Tabelle

## Debug-Schritte

### 1. Teste die Datenbank-Verbindung
```bash
node debug-community-feed.js
```

### 2. Prüfe die Browser-Konsole
- Öffne Developer Tools (F12)
- Gehe zu Console
- Schaue nach Fehlermeldungen

### 3. Prüfe die Network-Tabs
- Gehe zu Network-Tab in Developer Tools
- Lade die Community-Seite neu
- Schaue nach fehlgeschlagenen API-Calls

## Häufige Probleme

### ❌ "relation does not exist"
**Problem**: Community-Tabellen existieren nicht
**Lösung**: Migration anwenden (Option 1)

### ❌ "No published posts found"
**Problem**: Keine Posts in der Datenbank
**Lösung**: 
```bash
node create-test-posts.js
```

### ❌ "permission denied"
**Problem**: RLS-Policies blockieren Zugriff
**Lösung**: Migration anwenden (behebt RLS-Policies)

### ❌ Feed lädt, aber zeigt Demo-Posts
**Problem**: Keine echten Posts in der Datenbank
**Lösung**: 
```bash
node create-test-posts.js
```

## Nach der Behebung

1. **Teste den Feed**: Gehe zu `/community`
2. **Teste Likes**: Klicke auf Herz-Symbol
3. **Teste Kommentare**: Schreibe einen Kommentar
4. **Teste Realtime**: Öffne mehrere Tabs

## Code-Änderungen

### CommunityFeed.tsx
- ✅ Fallback von `community_posts` zu `posts`
- ✅ Bessere Fehlerbehandlung
- ✅ Separate Queries für Profile und Companies

### usePostInteractions.ts
- ✅ Fallback von `community_likes` zu `likes`
- ✅ Fallback von `community_comments` zu `comments`
- ✅ Bessere Fehlerbehandlung

## Nächste Schritte

1. **Migration anwenden** (falls noch nicht geschehen)
2. **Test-Daten erstellen**
3. **Feed testen**
4. **Performance überwachen**

## Support

Bei Problemen:
1. Führe `node debug-community-feed.js` aus
2. Teile die Ausgabe
3. Prüfe Browser-Konsole auf Fehler
