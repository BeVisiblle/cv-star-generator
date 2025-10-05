# CV Star Generator - BeVisiblle

Ein modernes Karriereportal für Auszubildende und Unternehmen mit CV-Generator, Matching-System und Community-Features.

## 🚀 Features

- **CV Generator**: Professionelle Lebensläufe erstellen
- **Company Dashboard**: Unternehmensmanagement
- **Job Matching**: Intelligente Kandidaten-Unternehmen-Zuordnung
- **Community**: Social Features, Messaging, Job-Postings
- **Mobile Support**: Capacitor für iOS/Android

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: React Query + Context API
- **Mobile**: Capacitor

## 📦 Installation

```bash
# Repository klonen
git clone https://github.com/Tmorawe9111/cv-star-generator.git
cd cv-star-generator

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## 🌐 URLs

- **Entwicklung**: http://localhost:3001/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/koymmvuhcxlvcuoyjnvv

## 📁 Projektstruktur

```
src/
├── components/          # React-Komponenten
├── pages/              # Seiten-Routing
├── hooks/              # Custom Hooks
├── services/           # API-Services
├── types/              # TypeScript-Definitionen
└── integrations/       # Supabase-Integration
```

## 🔧 Konfiguration

Die Supabase-Konfiguration ist bereits eingerichtet:
- **Projekt-ID**: `koymmvuhcxlvcuoyjnvv`
- **URL**: `https://koymmvuhcxlvcuoyjnvv.supabase.co`
- **Environment**: `.env.local` für lokale Entwicklung

## 📱 Mobile Development

```bash
# iOS
npx cap add ios
npx cap run ios

# Android
npx cap add android
npx cap run android
```

## 🚀 Deployment

```bash
# Production Build
npm run build

# Preview
npm run preview
```

## 📞 Support

Bei Fragen oder Problemen:
1. Supabase-Verbindung prüfen
2. Environment-Variablen überprüfen
3. Database-Migrationen anwenden
4. Console-Logs überprüfen

---

**Ready to use!** 🎉 Die Anwendung ist vollständig konfiguriert und einsatzbereit.