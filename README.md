# Document Collection System

A full-stack document collection interface for financial applications with applicant-specific requirements tracking and file upload functionality.

## Features

- **Multi-Applicant Support**: Handle documents for Primary Applicant, Co-Applicant, and Guarantor
- **Document Requirements**: Different document requirements based on applicant type
- **File Upload**: Drag-and-drop file upload with validation (PDF, JPG, PNG up to 10MB)
- **Progress Tracking**: Visual progress indicators and completion status
- **Responsive Design**: Mobile-first responsive interface
- **Real-time Updates**: Live status updates and notifications

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, Drizzle ORM
- **Database**: PostgreSQL (with in-memory storage for development)
- **Build Tool**: Vite
- **Deployment**: Netlify (with serverless functions)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5000](http://localhost:5000) in your browser

## Netlify Deployment

### Option 1: Direct Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/public` folder to Netlify

### Option 2: Git-based Deployment (Recommended)

1. Push your code to a Git repository
2. Connect your repository to Netlify
3. Netlify will automatically use the settings from `netlify.toml`:
   - Build command: `vite build`
   - Publish directory: `dist/public`

The `netlify.toml` file is already configured with the necessary settings.

## Project Structure

```
├── client/src/           # Frontend React application
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── lib/             # Utility libraries
│   └── hooks/           # Custom React hooks
├── server/              # Backend Express server
│   ├── functions/       # Netlify serverless functions
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data storage layer
├── shared/              # Shared types and schemas
└── dist/               # Build output
```

## Document Requirements

### Primary Applicant & Co-Applicant
- **Required**: Photo ID, SSN Card, Bank Statements, Tax Returns, Employment Letter, Pay Stubs
- **Optional**: Credit Report, Reference Letters

### Guarantor
- **Required**: Photo ID, SSN Card, Bank Statements, Tax Returns, Employment Letter, Pay Stubs, Credit Report
- **Optional**: Reference Letters

## Environment Variables

For local development with database:
- `DATABASE_URL`: PostgreSQL connection string

For production deployment:
- No environment variables required for demo mode

## Demo Mode

When deployed to Netlify, the application automatically switches to demo mode with:
- Simulated file uploads
- Local state management
- Mock progress tracking
- Visual feedback without server persistence

## URL Parameters

The application supports URL parameters to control which applicant types are shown:

- `?Co-Applicant=yes` - Show Co-Applicant section (default: yes)
- `?Co-Applicant=no` - Hide Co-Applicant section
- `?Guarantor=yes` - Show Guarantor section (default: yes)
- `?Guarantor=no` - Hide Guarantor section

### Example URLs:
- `https://yourapp.netlify.app/` - Show all applicant types
- `https://yourapp.netlify.app/?Co-Applicant=no` - Hide Co-Applicant section
- `https://yourapp.netlify.app/?Co-Applicant=yes&Guarantor=no` - Show Co-Applicant, hide Guarantor
- `https://yourapp.netlify.app/?ID=app_123&Co-Applicant=yes&Guarantor=no` - With application ID and selective sections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details