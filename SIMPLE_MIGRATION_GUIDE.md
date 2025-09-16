# 🚀 EINFACHE MIGRATION - NUR 2 SCHRITTE!

## ⚠️ **PROBLEM GELÖST:**
Die `candidates` Tabelle existiert bereits, aber ohne die benötigten Spalten wie `stage`.

## 🔧 **LÖSUNG - NUR 2 SCHRITTE:**

### **SCHRITT 1: Supabase Dashboard öffnen**
1. **Gehe zu:** https://supabase.com/dashboard
2. **Wähle dein Projekt:** `koymmvuhcxlvcuoyjnvv`
3. **Klicke auf "SQL Editor"** im linken Menü

### **SCHRITT 2: Add Missing Columns Migration ausführen**
```sql
-- Kopiere den kompletten Inhalt von:
-- cv-star-generator/supabase/migrations/20250115000020_add_missing_columns.sql

-- Diese Migration:
-- ✅ Fügt alle fehlenden Spalten zu existierenden Tabellen hinzu
-- ✅ Erstellt alle fehlenden Tabellen
-- ✅ Erstellt alle benötigten Indexes
-- ✅ Aktiviert RLS auf allen Tabellen
-- ✅ Erstellt Sample Daten
```

## ✅ **WAS DIESE MIGRATION MACHT:**

### **Fügt Spalten hinzu:**
- ✅ `candidates.stage` - Kandidaten-Status
- ✅ `candidates.bio_short` - Kurze Biografie
- ✅ `candidates.bio_long` - Lange Biografie
- ✅ `candidates.profile_completeness` - Profil-Vollständigkeit
- ✅ `candidates.embedding` - AI Embedding
- ✅ `candidates.home_point` - Wohnort
- ✅ `candidates.commute_mode` - Pendel-Modus
- ✅ `candidates.max_commute_minutes` - Max. Pendelzeit
- ✅ `candidates.willing_to_relocate` - Umzugswilligkeit
- ✅ `candidates.relocation_cities` - Umzugsstädte
- ✅ `candidates.language_at_work` - Arbeitssprache
- ✅ `candidates.availability_date` - Verfügbarkeitsdatum

### **Erstellt Tabellen:**
- ✅ `companies` - Unternehmen
- ✅ `jobs` - Stellenanzeigen
- ✅ `applications` - Bewerbungen
- ✅ `match_cache` - AI Matches
- ✅ `candidate_match_cache` - ForYou Cache
- ✅ `saved_jobs` - Gespeicherte Jobs
- ✅ `company_follows` - Unternehmen folgen
- ✅ `company_users` - Unternehmensbenutzer
- ✅ `job_drafts` - Job Entwürfe

### **Erstellt Sample Daten:**
- ✅ TechCorp GmbH Unternehmen
- ✅ JavaScript, Python, React Skills
- ✅ Führerschein, Erste Hilfe Zertifikate

## 🎯 **NACH DER MIGRATION:**

### **Teste diese URLs:**
1. **Jobsuche:** `/jobs` - Sollte funktionieren
2. **Für dich:** `/foryou` - AI Empfehlungen
3. **Company Matches:** `/company/matches` - Top Matches

### **Überprüfe in Supabase:**
- **Table Editor** → Alle Tabellen sollten da sein
- **API** → RPC Functions sollten funktionieren

## 🚨 **WICHTIG:**
- **Führe nur diese EINE Migration aus**
- **Sie sollte ohne Fehler durchlaufen**
- **Bei Fehlern: Melde den genauen Fehlertext**

---

**🚀 Nach diesem EINEN Schritt sollten alle 6 Prompts Features funktionieren!**
