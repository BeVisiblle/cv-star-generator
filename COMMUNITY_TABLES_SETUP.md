# Community Tables Setup Guide

## 🎯 Problem
Der Code verwendet `community_posts`, `community_likes`, `community_comments`, und `community_shares` Tabellen, aber diese existieren möglicherweise nicht in der Datenbank oder haben nicht die richtige Struktur.

## 🔧 Lösung
Eine neue Migration wurde erstellt, die alle Community-Tabellen mit der korrekten Struktur und RLS-Policies erstellt.

## 📋 Schritte zur Anwendung

### 1. Migration anwenden
```bash
# Via Supabase Dashboard SQL Editor:
# Kopiere den Inhalt von: supabase/migrations/20250912140000_fix_community_tables.sql
# Und führe ihn im SQL Editor aus
```

### 2. Migration testen
```bash
# Teste die Tabellen-Struktur
node test-community-tables.js
```

### 3. Test-Daten erstellen
```bash
# Erstelle Test-Posts für den Feed
node create-test-posts.js
```

## 📊 Tabellen-Struktur

### `community_posts`
- `id` (UUID, Primary Key)
- `actor_user_id` (UUID, Foreign Key zu profiles)
- `actor_company_id` (UUID, Foreign Key zu companies)
- `body_md` (TEXT, Post-Inhalt)
- `media` (JSONB, Array von Media-Objekten)
- `status` (TEXT, 'draft'|'scheduled'|'published'|'deleted')
- `visibility` (TEXT, 'CommunityOnly'|'CommunityAndCompanies')
- `like_count` (INTEGER, automatisch aktualisiert)
- `comment_count` (INTEGER, automatisch aktualisiert)
- `share_count` (INTEGER, automatisch aktualisiert)

### `community_likes`
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key zu community_posts)
- `liker_user_id` (UUID, Foreign Key zu auth.users)
- `created_at` (TIMESTAMP)

### `community_comments`
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key zu community_posts)
- `author_user_id` (UUID, Foreign Key zu auth.users)
- `body_md` (TEXT, Kommentar-Inhalt)
- `parent_comment_id` (UUID, Foreign Key zu community_comments für Antworten)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `community_shares`
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key zu community_posts)
- `sharer_user_id` (UUID, Foreign Key zu auth.users)
- `created_at` (TIMESTAMP)

## 🔒 RLS Policies

### Posts
- **SELECT**: Nur veröffentlichte Posts, basierend auf Visibility
- **INSERT**: Nur authentifizierte User, die als Autor oder Company-Mitarbeiter berechtigt sind
- **UPDATE/DELETE**: Nur der Autor oder Company-Mitarbeiter

### Likes
- **SELECT**: Nur für sichtbare Posts
- **INSERT**: Nur authentifizierte User für veröffentlichte Posts
- **DELETE**: Nur der User selbst

### Comments
- **SELECT**: Nur für sichtbare Posts
- **INSERT**: Nur authentifizierte User für veröffentlichte Posts
- **UPDATE/DELETE**: Nur der Autor

### Shares
- **SELECT**: Nur für sichtbare Posts
- **INSERT**: Nur authentifizierte User für veröffentlichte Posts

## ⚡ Performance Features

### Indizes
- Alle wichtigen Spalten sind indexiert
- Composite Indizes für häufige Queries

### Trigger
- Automatische Aktualisierung der Like/Comment/Share-Counts
- Timestamp-Updates

### Realtime
- Alle Tabellen sind für Realtime-Updates konfiguriert
- Änderungen werden automatisch an alle Clients übertragen

## 🧪 Testing

### Tabellen-Test
```bash
node test-community-tables.js
```
Prüft:
- ✅ Tabellen-Existenz
- ✅ Spalten-Struktur
- ✅ RLS-Policies
- ✅ Indizes
- ✅ Trigger
- ✅ Realtime-Konfiguration

### Test-Daten
```bash
node create-test-posts.js
```
Erstellt:
- 📝 10 Test-Posts mit verschiedenen Inhalten
- 🖼️ Posts mit und ohne Bilder
- ❤️ Test-Likes
- 💬 Test-Kommentare

## 🔄 Nach der Migration

1. **Feed testen**: Gehe zu `/community` und überprüfe, ob Posts angezeigt werden
2. **Interaktionen testen**: Teste Likes, Kommentare und Shares
3. **Realtime testen**: Öffne mehrere Browser-Tabs und teste Live-Updates
4. **Performance prüfen**: Überprüfe, ob der Feed schnell lädt

## 🐛 Troubleshooting

### Fehler: "relation does not exist"
- Migration wurde nicht angewendet
- Führe die Migration über Supabase Dashboard aus

### Fehler: "permission denied"
- RLS-Policies sind zu restriktiv
- Überprüfe die Policies in der Migration

### Fehler: "function does not exist"
- Trigger-Funktionen fehlen
- Führe die komplette Migration erneut aus

### Posts werden nicht angezeigt
- Überprüfe, ob `status = 'published'` ist
- Überprüfe die `visibility` Einstellungen
- Überprüfe die RLS-Policies

## 📝 Nächste Schritte

Nach erfolgreicher Migration:
1. Teste alle Community-Features
2. Erstelle echte Posts über die UI
3. Teste mit verschiedenen User-Rollen
4. Überwache Performance und Fehler
5. Passe RLS-Policies bei Bedarf an
