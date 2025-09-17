# 🎯 DISCOVER CARDS SYSTEM - KOMPLETTE ANLEITUNG

## ✨ **WAS ICH FÜR DICH ERSTELLT HABE:**

### ** Große, detaillierte Cards basierend auf dem Bild:**

#### **👤 PersonCard Features:**
- ✅ **Große Profile Cards** mit Gradient-Hintergrund
- ✅ **Profilbild** mit Initialen-Fallback
- ✅ **Name + Verifikations-Badge** (wenn verifiziert)
- ✅ **Titel @ Unternehmen** Format
- ✅ **Branche-Badge** und andere Tags
- ✅ **Bio-Text** über die Person
- ✅ **Standort** mit Icon
- ✅ **Gemeinsame Kontakte** (nur wenn > 0)
- ✅ **Vernetzen/Nachricht Buttons**
- ✅ **Profil ansehen** Link

#### **🏢 CompanyCard Features:**
- ✅ **Unternehmens-Logo** mit Initialen-Fallback
- ✅ **Firmenname + Branche**
- ✅ **Standort + Mitarbeiteranzahl**
- ✅ **Unternehmens-Beschreibung**
- ✅ **Gemeinsame Kontakte** (nur wenn > 0)
- ✅ **Mitarbeiter die du kennst** (klickbar)
- ✅ **Angebotene Jobs** (klickbar)
- ✅ **Folgen/Unternehmen ansehen** Buttons

### ** Neue Seiten:**

#### **1. `/discover/people` - Alle Personen**
- Große Grid mit PersonCards
- Suchfunktion
- Filter nach Branche, Standort, etc.

#### **2. `/discover/companies` - Alle Unternehmen**
- Große Grid mit CompanyCards
- Suchfunktion
- Klickbare Mitarbeiter und Jobs

#### **3. `/discover` - Haupt-Discover Seite**
- Übersicht mit Statistiken
- Quick Actions
- Tipps für Vernetzung

#### **4. Erweiterte `/community/contacts`**
- Integriert die neue DiscoverSection
- Zeigt interessante Personen und Unternehmen

### **🔗 Integration:**

#### **Klickbare Elemente:**
- **Mitarbeiter** → `/u/{employeeId}` (Profil)
- **Jobs** → `/jobs#{jobId}` (Job-Detail)
- **Personen** → `/u/{personId}` (Profil)
- **Unternehmen** → `/company/{companyId}` (Profil)

#### **Buttons:**
- **Vernetzen** → Connection Request
- **Nachricht** → Direct Message
- **Folgen** → Follow Company/Person
- **Profil ansehen** → View Profile

## 🚀 **WIE DU ES TESTEST:**

### **1. Nach Migration ausführen:**
```bash
npm run dev
```

### **2. URLs testen:**
- **`/discover`** - Haupt-Discover Seite
- **`/discover/people`** - Alle Personen
- **`/discover/companies`** - Alle Unternehmen
- **`/community/contacts`** - Erweiterte Community

### **3. Features testen:**
- **Klicke auf "Weitere anzeigen"** → Große Cards
- **Suche nach Personen/Unternehmen**
- **Klicke auf Mitarbeiter** → Geht zum Profil
- **Klicke auf Jobs** → Geht zur Jobsuche
- **Teste Vernetzen/Nachricht Buttons**

## **DESIGN-FEATURES:**

### **🎨 Visuelles Design:**
- **Gradient-Hintergrund** (Blau → Lila → Rosa)
- **Schatten und Hover-Effekte**
- **Runde Profile-Bilder** mit Border
- **Badges** für Branche und Status
- **Icons** für alle Aktionen

### **📱 Responsive Design:**
- **Mobile-first** Ansatz
- **Grid-Layout** (1-2-3 Spalten)
- **Touch-friendly** Buttons
- **Optimiert** für alle Bildschirmgrößen

### ** UX-Features:**
- **Loading States** mit Skeleton
- **Empty States** mit hilfreichen Nachrichten
- **Search & Filter** Funktionalität
- **Breadcrumb Navigation**
- **Quick Actions** für häufige Aufgaben

## 📊 **DATEN-INTEGRATION:**

### **Personen-Daten:**
```typescript
interface Person {
  id: string;
  name: string;
  profileImage?: string;
  title?: string;
  company?: string;
  isVerified?: boolean;
  industry?: string;
  location?: string;
  bio?: string;
  mutualConnections?: number;
  connections?: string[];
  isConnected?: boolean;
  isFollowing?: boolean;
}
```

### **Unternehmen-Daten:**
```typescript
interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  employeeCount?: string;
  description?: string;
  mutualConnections?: number;
  employees?: Array<{
    id: string;
    name: string;
    title: string;
    profileImage?: string;
  }>;
  openJobs?: Array<{
    id: string;
    title: string;
    track: string;
    contractType: string;
  }>;
  isFollowing?: boolean;
}
```

## 🎯 **NÄCHSTE SCHRITTE:**

### **1. Migration ausführen:**
- Führe die AI Matching Migration aus
- Teste die neuen Cards

### **2. Daten verknüpfen:**
- Verbinde echte Profile-Daten
- Implementiere Connection-Logic
- Füge Messaging hinzu

### **3. Erweitern:**
- Filter nach Branche, Standort, etc.
- Sortierung nach Relevanz
- Infinite Scroll für große Listen

---

**🎉 Du hast jetzt ein komplettes Discover-System mit großen, detaillierten Cards wie im Bild!**

**Die Cards zeigen alle wichtigen Informationen und sind vollständig klickbar für bessere Vernetzung!** 🚀
