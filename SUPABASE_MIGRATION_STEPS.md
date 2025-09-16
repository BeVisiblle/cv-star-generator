# 🚀 SOFORTIGE SUPABASE MIGRATION - SCHRITT FÜR SCHRITT

## ⚠️ **WARUM DU NICHTS SIEHST:**
Die Migrationen sind erstellt, aber **noch nicht in der Datenbank ausgeführt**. Deshalb siehst du keine neuen Tabellen oder Features.

## 🔧 **LÖSUNG - FÜHRE DIESE SCHRITTE AUS:**

### **Schritt 1: Supabase Dashboard öffnen**
1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt: `koymmvuhcxlvcuoyjnvv`
3. Klicke auf **"SQL Editor"** im linken Menü

### **Schritt 2: Migration 1 ausführen**
```sql
-- Kopiere den Inhalt von: supabase/migrations/20250115000015_matching_system_foundation.sql
-- und führe ihn im SQL Editor aus

-- Diese Migration erstellt:
-- - companies, jobs, candidates Tabellen
-- - skills, certs Tabellen  
-- - applications, match_cache Tabellen
-- - Alle RLS Policies
-- - Sample Daten
```

### **Schritt 3: Migration 2 ausführen**
```sql
-- Kopiere den Inhalt von: supabase/migrations/20250115000016_job_search_system.sql
-- und führe ihn im SQL Editor aus

-- Diese Migration erstellt:
-- - v_my_applications View
-- - open_jobs_search RPC Function
-- - saved_jobs, company_follows Tabellen
-- - Sample Jobs
```

### **Schritt 4: Migration 3 ausführen**
```sql
-- Kopiere den Inhalt von: supabase/migrations/20250115000017_foryou_matching_system.sql
-- und führe ihn im SQL Editor aus

-- Diese Migration erstellt:
-- - candidate_match_cache Tabelle
-- - v_candidate_foryou Views
-- - prune_cmc_for_candidate RPC Function
```

### **Schritt 5: Migration 4 ausführen**
```sql
-- Kopiere den Inhalt von: supabase/migrations/20250115000018_company_topmatches_system.sql
-- und führe ihn im SQL Editor aus

-- Diese Migration erstellt:
-- - company_users Tabelle
-- - v_job_topmatches View
-- - mark_application_freigeschaltet RPC Function
-- - grant_profile_view RPC Function
```

### **Schritt 6: Migration 5 ausführen**
```sql
-- Kopiere den Inhalt von: supabase/migrations/20250115000019_job_wizard_system.sql
-- und führe ihn im SQL Editor aus

-- Diese Migration erstellt:
-- - compute_job_quality Function
-- - sync_job_requirements RPC Function
-- - sync_job_locations RPC Function
-- - job_drafts Tabelle
```

### **Schritt 7: Edge Functions deployen**
1. Gehe zu **"Edge Functions"** im Supabase Dashboard
2. Klicke **"Deploy Function"**
3. Deploye: `matching_generate_jobs_for_candidate`
4. Deploye: `matching_generate_topk`

## ✅ **NACH DER MIGRATION SIEHST DU:**

### **Neue Tabellen:**
- `companies` - Unternehmen
- `jobs` - Stellenanzeigen  
- `candidates` - Kandidaten
- `applications` - Bewerbungen
- `match_cache` - AI Matches
- `saved_jobs` - Gespeicherte Jobs
- `company_follows` - Unternehmen folgen

### **Neue Views:**
- `v_jobs_with_company` - Jobs mit Unternehmensdaten
- `v_my_applications` - Meine Bewerbungen
- `v_candidate_foryou` - Für dich Empfehlungen
- `v_job_topmatches` - Top Matches für Unternehmen

### **Neue RPC Functions:**
- `open_jobs_search` - Job Suche
- `apply_to_job` - Bewerbung einreichen
- `prune_cmc_for_candidate` - Match Cache bereinigen
- `mark_application_freigeschaltet` - Kandidat freischalten

## 🎯 **TESTEN NACH MIGRATION:**

1. **Jobsuche:** Gehe zu `/jobs` - sollte funktionieren
2. **Für dich:** Gehe zu `/foryou` - AI Empfehlungen
3. **Company Matches:** Gehe zu `/company/matches` - Top Matches

## 🚨 **WICHTIG:**
- Führe die Migrationen **in der richtigen Reihenfolge** aus
- Jede Migration sollte **erfolgreich** sein
- Bei Fehlern: Stoppe und melde den Fehler

---

**Nach diesen Schritten werden alle 6 Prompts Features funktionieren!** 🚀
