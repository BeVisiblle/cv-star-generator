# BeVisiblle - Complete Setup Guide

## 🚀 Quick Start

This repository contains the complete BeVisiblle application with all features implemented.

### Prerequisites

- **Bun** (recommended) or Node.js
- **Supabase** account and project
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tmorawe9111/cv-star-generator.git
   cd cv-star-generator
   git checkout bevisiblle-complete
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup:**
   - Copy `.env` file and configure your Supabase credentials
   - Update Supabase URL and API keys

4. **Start Development Server:**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Access the application:**
   - Main app: `http://localhost:3000`
   - BeVisiblle Landing: `http://localhost:3000/`
   - Company Search: `http://localhost:3000/company/search`

## 🎯 Key Features Implemented

### ✅ BeVisiblle Landing Page
- Complete landing page with hero section
- Logo marquee animation
- Feature cards and testimonials
- Newsletter integration
- Responsive design

### ✅ Company Authentication
- Clean company onboarding (2-step process)
- Company dashboard with token system
- Protected routes for company users
- Special handling for `team@ausbildungsbasis.de`

### ✅ Token System
- Simple token management with `useSimpleToken` hook
- Profile unlocking functionality
- Local token simulation (starts with 1000 tokens)
- Profile card variants (search vs unlocked)

### ✅ Profile Management
- Candidate search with filters
- Profile unlocking with token deduction
- Full profile view for unlocked candidates
- CV download functionality

### ✅ Database Integration
- Supabase integration
- RLS policies configured
- Company user management
- Profile and token tracking

## 🔧 Technical Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Build Tool:** Vite
- **Package Manager:** Bun (recommended) or npm
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL

## 📁 Key Files

### Components
- `src/components/BeVisiblleLandingPage.tsx` - Main landing page
- `src/components/CleanCompanyOnboarding.tsx` - Company setup
- `src/components/LandingExtras.tsx` - Landing page extras
- `src/components/profile/ProfileCard.tsx` - Profile display

### Hooks
- `src/hooks/useSimpleToken.tsx` - Token management
- `src/hooks/useCompany.tsx` - Company data
- `src/hooks/useAuth.tsx` - Authentication

### Pages
- `src/pages/Company/Search.tsx` - Candidate search
- `src/pages/Company/Dashboard.tsx` - Company dashboard
- `src/pages/Auth.tsx` - Authentication page

### Database
- `supabase/migrations/` - Database migrations
- Various SQL files for debugging and setup

## 🚨 Important Notes

1. **Token System:** Currently uses local simulation (1000 tokens)
2. **Company User:** Special handling for `team@ausbildungsbasis.de`
3. **Database:** Some RLS policies may need adjustment
4. **Assets:** All BeVisiblle assets included in `public/assets/`

## 🔄 Migration from Old System

The codebase has been completely refactored to include:
- New BeVisiblle branding
- Simplified company onboarding
- Working token system
- Improved authentication flow
- Better error handling

## 📞 Support

For issues or questions, check the console logs and ensure:
1. Supabase connection is working
2. Environment variables are set correctly
3. Database migrations are applied
4. Company user exists in database

## 🎉 Ready to Use!

The application is now ready for development and testing. All major features are implemented and working.
