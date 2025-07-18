# Webhook Payload Updates

## Overview
Updated the webhook payload structure to include additional fields for better document tracking and processing.

## Changes Made

### 1. Updated Webhook Payload Structure
The webhook payload now includes the following fields:

```json
{
  "reference_id": "app_1752674377597_3uzu2eefu",
  "application_id": "app_1752674377597_3uzu2eefu", // NEW: Application ID for webhook
  "document_name": "bank-statement.pdf", // NEW: Document name for webhook
  "file_name": "bank-statement.pdf",
  "section_name": "Bank Statement",
  "file_base64": "base64_encoded_file_data"
}
```

### 2. Files Updated

#### `server/functions/api.ts`
- Added `application_id` field to webhook payload
- Added `document_name` field to webhook payload
- Updated logging to include application ID

#### `server/routes.ts`
- Added `application_id` field to webhook payload
- Added `document_name` field to webhook payload
- Updated logging to include application ID

### 3. Data Flow

1. **Frontend**: Application ID is passed from URL parameters (`?ID=app_1752674377597_3uzu2eefu`)
2. **DocumentCollection**: Extracts applicant ID and passes as `referenceId`
3. **DocumentItem**: Passes `referenceId` to `DocumentUpload`
4. **DocumentUpload**: Sends `referenceId` in upload request
5. **Backend**: Uses `referenceId` as both `application_id` and `document_name` in webhook payload

### 4. Benefits

- **Better Tracking**: Webhook now receives explicit application ID and document name
- **Improved Processing**: External systems can easily identify which application the document belongs to
- **Enhanced Logging**: Better visibility into which application is uploading documents
- **Consistent Data**: Both Netlify functions and Express server use the same payload structure

### 5. Testing

The webhook payload structure has been tested and verified to work correctly with the existing webhook endpoint.

## Usage

When a user uploads a document:
1. The application ID is automatically included from the URL parameters
2. The document name is extracted from the uploaded file
3. Both values are sent to the webhook for processing
4. The webhook receives a complete payload with all necessary information

No changes are required on the frontend - the functionality works automatically with the existing URL parameter structure. 