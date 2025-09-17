# 🚀 MIGRATION AUSFÜHREN - SCHRITT FÜR SCHRITT

## ⚠️ **WICHTIG:**
Du musst **ZUERST** die Migration ausführen, bevor du die UI siehst!

## 🔧 **SCHRITT-FÜR-SCHRITT:**

### **1. Supabase Dashboard öffnen**
1. **Gehe zu:** https://supabase.com/dashboard
2. **Logge dich ein** mit deinen Credentials
3. **Wähle dein Projekt:** `koymmvuhcxlvcuoyjnvv`

### **2. SQL Editor öffnen**
1. **Klicke auf "SQL Editor"** im linken Menü
2. **Klicke auf "New Query"**

### **3. Migration ausführen**
1. **Öffne die Datei:** `cv-star-generator/supabase/migrations/20250115000022_ai_matching_system_final.sql`
2. **Kopiere den KOMPLETTEN Inhalt** (Strg+A, Strg+C)
3. **Füge ihn in den SQL Editor ein** (Strg+V)
4. **Klicke auf "Run"** (oder Strg+Enter)

### **4. Erfolg prüfen**
- ✅ Du solltest "Success. No rows returned" sehen
- ❌ Falls Fehler: Melde den genauen Fehlertext

### **5. Tabellen überprüfen**
1. **Klicke auf "Table Editor"** im linken Menü
2. **Du solltest diese Tabellen sehen:**
   - ✅ `candidates`
   - ✅ `jobs`
   - ✅ `companies`
   - ✅ `applications`
   - ✅ `match_cache`
   - ✅ `candidate_match_cache`
   - ✅ `saved_jobs`
   - ✅ `company_follows`
   - ✅ `company_users`
   - ✅ `access_grants`
   - ✅ `suppression`

### **6. Sample Daten prüfen**
1. **Klicke auf "companies" Tabelle**
2. **Du solltest "TechCorp GmbH" sehen**
3. **Klicke auf "jobs" Tabelle**
4. **Du solltest 2 Sample Jobs sehen**

---

**🎯 NACH DIESER MIGRATION FUNKTIONIERT DIE UI!**
