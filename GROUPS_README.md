# Groups & PDF Q&A System

This document describes the implementation of the groups and PDF Q&A functionality in the Ausbildungsbasis application.

## Overview

The groups system allows users to create and join study groups, upload PDF documents, and engage in Q&A discussions directly linked to specific pages and sections of those documents.

## Features Implemented

### 1. Database Schema
- **Groups**: Course, exam, and profession-based study groups
- **Group Members**: Role-based membership (owner, moderator, member)
- **Posts**: Threads, questions, resources, events, and polls
- **Files**: PDF document storage with metadata
- **File Pages**: Individual page data for PDF processing
- **Questions**: PDF-linked questions with page anchors
- **Answers**: Threaded answers with acceptance system
- **Annotations**: Private and group annotations on PDF pages
- **Votes**: Up/down voting system
- **Reports**: Content moderation system
- **Notifications**: User notification system
- **Credits**: Token-based system for premium features

### 2. UI Components
- **GroupCard**: Displays group information with join/leave actions
- **PdfViewer**: Main PDF viewer with sidebar for Q&A
- **PageThumbnails**: Left sidebar for page navigation
- **PDFSidebar**: Right sidebar for questions and annotations
- **GroupsPage**: Discover and browse groups
- **GroupDetailPage**: Group management and content viewing

### 3. API Hooks
- **useGroups**: Group management (create, join, leave, update)
- **usePosts**: Post management and voting
- **useQuestions**: Question and answer management
- **useFiles**: File upload and management
- **useAnnotations**: PDF annotation system

### 4. Routes
- `/groups` - Groups discovery page
- `/groups/:id` - Group detail page
- `/file/:id` - PDF viewer page

## Database Migration

To apply the database schema, run:

```bash
npx supabase db push
```

The migration file is located at:
`supabase/migrations/20250904083550_groups_pdf_qa_system.sql`

## Environment Setup

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=https://koymmvuhcxlvcuoyjnvv.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Storage Buckets

The system requires two Supabase storage buckets:
- `files` - For PDF document storage
- `thumbs` - For PDF page thumbnails

## PDF Processing (MVP)

Currently, PDF processing is simplified for the MVP:
- Files are uploaded to storage
- Basic file metadata is stored
- Placeholder page data is created
- Full PDF.js integration is TODO

## Next Steps

1. **PDF Processing**: Implement full PDF.js integration for text extraction and thumbnail generation
2. **Search**: Add full-text search for PDF content
3. **Notifications**: Implement real-time notifications
4. **Moderation**: Build moderation dashboard
5. **Mobile**: Optimize for mobile devices
6. **Offline**: Add offline caching for PDFs

## File Structure

```
src/
├── types/groups.ts              # TypeScript type definitions
├── lib/supabase.ts             # Supabase client configuration
├── hooks/
│   ├── useGroups.ts            # Group management hooks
│   ├── usePosts.ts             # Post management hooks
│   ├── useQuestions.ts         # Question/answer hooks
│   └── useFiles.ts             # File management hooks
├── components/
│   ├── groups/
│   │   └── GroupCard.tsx       # Group display component
│   └── pdf/
│       ├── PdfViewer.tsx       # Main PDF viewer
│       ├── PageThumbnails.tsx  # Page navigation
│       └── PDFSidebar.tsx      # Q&A sidebar
├── pages/
│   ├── GroupsPage.tsx          # Groups discovery
│   ├── GroupDetailPage.tsx     # Group management
│   └── PdfViewerPage.tsx       # PDF viewer page
└── api/files/
    └── upload.ts               # File upload utilities
```

## Usage

1. Navigate to `/groups` to discover and join groups
2. Create or join a group to access its content
3. Upload PDF files to share with group members
4. Ask questions and create annotations directly on PDF pages
5. Answer questions and mark solutions as accepted

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access groups they're members of
- File access is restricted to group members
- Moderation tools are available for group owners and moderators
