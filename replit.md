# Document Collection System

## Overview

This is a full-stack document collection system built with React, Express.js, and PostgreSQL. The application allows users to upload and manage documents for different types of applicants (primary, co-applicant, guarantor) with specific document requirements for each type.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: React Dropzone for drag-and-drop file uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Upload**: Multer for handling multipart/form-data
- **Session Management**: Connect-pg-simple for PostgreSQL session store
- **API Design**: RESTful API with JSON responses

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Storage**: Documents stored with Base64 encoded file data for simplicity
- **Tables**: Single `documents` table with applicant type categorization

## Key Components

### Document Management
- **Document Upload**: Drag-and-drop interface with file validation (PDF, JPG, PNG)
- **Document Requirements**: Type-specific requirements (required, optional, not applicable)
- **Document Status**: Track upload status and validation state
- **File Size Limits**: 10MB maximum file size with proper error handling

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: shadcn/ui for consistent UI components
- **Progress Tracking**: Visual progress indicators for document completion
- **Toast Notifications**: User feedback for upload success/failure

### Data Validation
- **Schema Validation**: Zod schemas for runtime type checking
- **File Type Validation**: MIME type checking for security
- **Form Validation**: React Hook Form with resolver integration

## Data Flow

1. **Document Upload Flow**:
   - User selects applicant type
   - System displays required/optional documents
   - User drags/drops files or clicks to upload
   - File validation occurs (type, size)
   - File converted to Base64 and stored in database
   - UI updates with success/error feedback

2. **Document Retrieval Flow**:
   - Frontend requests documents for specific applicant type
   - Backend queries database filtered by applicant type
   - Documents returned with metadata (status, upload date, etc.)
   - Frontend displays documents with appropriate status indicators

3. **Progress Tracking**:
   - System calculates completion percentage based on required documents
   - Real-time updates as documents are uploaded
   - Visual indicators for missing required documents

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI primitives for accessibility
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Utility Libraries**: clsx and class-variance-authority for styling

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **File Processing**: Multer for multipart form handling
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier (implied by configuration)
- **Database Tools**: Drizzle Kit for schema management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js` (local development)
- **Netlify Functions**: esbuild bundles serverless functions to `dist/functions/`
- **Database**: Drizzle pushes schema changes to PostgreSQL

### Environment Configuration
- **Database**: CONNECTION_URL environment variable required for full functionality
- **Development**: NODE_ENV=development for development mode
- **Production**: NODE_ENV=production for optimized builds
- **Netlify**: Automatic demo mode detection for serverless deployment

### Server Setup
- **Local Development**: Express serves built frontend from `dist/public`
- **Netlify Deployment**: Static files served from `dist/public` with serverless functions
- **API Routes**: RESTful endpoints under `/api` prefix (local) or `/.netlify/functions/` (Netlify)
- **Error Handling**: Global error middleware for consistent error responses
- **Logging**: Request logging for API endpoints with response details

### Storage Strategy
- **Current**: In-memory storage class for development/testing
- **Production Ready**: Database storage with Base64 encoded files
- **Netlify Demo**: Local state management with simulated uploads
- **Scalability**: Easy to extend to cloud storage (S3, etc.) by implementing IStorage interface

### Netlify Deployment (January 2025)
- **Build Command**: `vite build` (configured in netlify.toml)
- **Publish Directory**: `dist/public`
- **Demo Mode**: Automatic detection for Netlify deployment with simulated file uploads
- **Configuration**: `netlify.toml` with proper redirects and build settings
- **Status**: Successfully configured and tested for Git-based deployment

The system now supports both local development with full backend functionality and Netlify deployment with demo mode for static hosting and serverless functions.