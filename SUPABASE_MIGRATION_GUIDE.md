# Supabase Migration Guide - Job Posting System

## Übersicht
Dieses Dokument beschreibt, wie die neuen Migrationen für das Job-Posting-System in Supabase angewendet werden.

## Migrationen
Die folgenden Migrationen wurden erstellt und müssen in Supabase angewendet werden:

1. **20250910000000_add_missing_job_columns.sql** - Fehlende Spalten hinzufügen
2. **20250910010000_job_analytics_system.sql** - Analytics und Statistiken
3. **20250910020000_job_preview_system.sql** - Job-Preview und Interaktionen
4. **20250910030000_job_edit_publishing_system.sql** - Job-Bearbeitung und Publishing
5. **20250910040000_job_rpc_functions.sql** - RPC-Funktionen

## Anwendung der Migrationen

### Option 1: Über Supabase Dashboard
1. Gehe zu deinem Supabase-Projekt
2. Navigiere zu "SQL Editor"
3. Kopiere den Inhalt jeder Migration-Datei
4. Führe sie in der richtigen Reihenfolge aus

### Option 2: Über Supabase CLI (empfohlen)
```bash
# Stelle sicher, dass du mit deinem Projekt verbunden bist
supabase link --project-ref koymmvuhcxlvcuoyjnvv

# Wende alle Migrationen an
supabase db push

# Oder wende spezifische Migrationen an
supabase migration up
```

### Option 3: Über SQL-Dateien direkt
1. Öffne jede Migration-Datei in `supabase/migrations/`
2. Kopiere den Inhalt
3. Führe sie in Supabase SQL Editor aus

## Neue Features nach der Migration

### 1. Erweiterte Job-Spalten
- `description_md` - Markdown-Beschreibung
- `tasks_md` - Markdown-Aufgaben
- `requirements_md` - Markdown-Anforderungen
- `slug` - SEO-freundliche URLs
- `view_count` - Aufrufzähler
- `application_count` - Bewerbungszähler
- `tags` - Job-Tags
- `is_featured` - Featured Jobs
- `is_urgent` - Dringende Jobs

### 2. Analytics-System
- **job_analytics** - Tägliche/wöchentliche/monatliche Statistiken
- **job_performance_metrics** - Performance-Metriken
- **job_search_analytics** - Such-Analytics
- **job_post_views** - View-Tracking

### 3. Job-Preview-System
- **job_previews** - Vorschau-Tokens
- **job_bookmarks** - Job-Favoriten
- **job_shares** - Job-Sharing
- **job_interactions** - Benutzer-Interaktionen
- **job_recommendations** - Job-Empfehlungen

### 4. Edit & Publishing-System
- **job_edit_history** - Bearbeitungshistorie
- **job_publishing_queue** - Publishing-Queue
- **job_approvals** - Genehmigungsworkflow
- **job_templates** - Job-Vorlagen
- **job_bulk_operations** - Bulk-Operationen

### 5. RPC-Funktionen
- `get_company_job_stats()` - Firmen-Statistiken
- `get_job_applications()` - Bewerbungen abrufen
- `update_application_status()` - Bewerbungsstatus aktualisieren
- `publish_job_with_tokens()` - Job mit Token veröffentlichen
- `search_jobs()` - Job-Suche
- `get_job_recommendations()` - Job-Empfehlungen
- `toggle_job_like()` - Job-Like/Bookmark

## Wichtige Hinweise

### RLS (Row Level Security)
Alle neuen Tabellen haben RLS aktiviert mit entsprechenden Policies:
- Firmen können nur ihre eigenen Jobs verwalten
- Benutzer können nur ihre eigenen Bookmarks/Interaktionen sehen
- Öffentliche Jobs sind für alle sichtbar

### Indizes
Alle wichtigen Spalten haben Indizes für bessere Performance:
- Such-Indizes für Titel, Stadt, Arbeitstyp
- Performance-Indizes für Statistiken
- Unique-Indizes für Constraints

### Trigger
- Automatische Slug-Generierung
- View-Count-Updates
- Application-Count-Updates
- Edit-History-Logging

## Nach der Migration

### 1. Teste die Verbindung
```sql
-- Teste die neuen Spalten
SELECT id, title, description_md, slug, view_count 
FROM job_posts 
LIMIT 5;

-- Teste die RPC-Funktionen
SELECT * FROM get_company_job_stats('deine-company-id');
```

### 2. Aktualisiere die Frontend-Types
Die TypeScript-Types in `src/integrations/supabase/types.ts` sollten automatisch aktualisiert werden, wenn du `supabase gen types` ausführst.

### 3. Teste die neuen Features
- Job-Erstellung mit allen neuen Feldern
- Job-Preview-System
- Analytics und Statistiken
- RPC-Funktionen

## Troubleshooting

### Häufige Probleme
1. **RLS-Fehler**: Stelle sicher, dass der Benutzer authentifiziert ist
2. **Spalten-Fehler**: Überprüfe, ob alle Migrationen angewendet wurden
3. **RPC-Fehler**: Überprüfe die Berechtigungen für die Funktionen

### Debugging
```sql
-- Überprüfe Tabellen-Existenz
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'job_%';

-- Überprüfe RPC-Funktionen
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%job%';
```

## Support
Bei Problemen mit den Migrationen:
1. Überprüfe die Supabase-Logs
2. Teste die SQL-Befehle einzeln
3. Stelle sicher, dass alle Abhängigkeiten erfüllt sind
