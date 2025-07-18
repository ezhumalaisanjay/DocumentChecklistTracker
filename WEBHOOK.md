# Webhook Integration for File Uploads

This document explains how the webhook functionality works when files are uploaded to the Document Checklist Tracker.

## Overview

When a user uploads a document through the application, the system automatically sends a webhook notification containing the document name and application ID to a configured webhook URL.

## Configuration

To enable webhook notifications, set the following environment variable:

```bash
MONDAY_WEBHOOK_URL=https://your-webhook-endpoint.com/webhook
```

## Webhook Payload

When a file is uploaded, the system sends a POST request to the configured webhook URL with the following JSON payload:

```json
{
  "documentName": "example-document.pdf",
  "applicationId": "app_1752674377597_3uzu2eefu",
  "documentType": "Photo ID",
  "uploadedAt": "2024-01-15T10:30:00.000Z",
  "status": "uploaded"
}
```

### Payload Fields

- **documentName**: The original filename of the uploaded document
- **applicationId**: The unique identifier for the application (from URL parameters)
- **documentType**: The type of document (e.g., "Photo ID", "SSN Card", etc.)
- **uploadedAt**: ISO timestamp when the document was uploaded
- **status**: The status of the document (always "uploaded" for new uploads)

## Implementation Details

### Frontend

The application ID is extracted from URL parameters and passed through the component chain:

1. `DocumentCollection` page extracts `applicantId` from URL parameters
2. Passes it as `referenceId` to `DocumentItem` component
3. `DocumentItem` passes it to `DocumentUpload` component
4. `DocumentUpload` includes it in the upload data sent to the API

### Backend

The serverless function (`server/functions/documents.ts`) handles the webhook:

1. Receives the upload data including `referenceId`
2. Creates the document in storage
3. Calls `sendWebhookNotification()` with document name, application ID, and document type
4. Sends POST request to configured webhook URL

## Error Handling

- If no webhook URL is configured, the function logs a message and continues without sending a webhook
- If the webhook request fails, the error is logged but doesn't affect the upload process
- The upload is considered successful even if the webhook fails

## Testing

To test the webhook functionality:

1. Set the `MONDAY_WEBHOOK_URL` environment variable
2. Upload a document through the application
3. Check your webhook endpoint for the notification
4. Verify the payload contains the expected data

## Example Webhook Handler

Here's an example of how you might handle the webhook on your server:

```javascript
app.post('/webhook', (req, res) => {
  const { documentName, applicationId, documentType, uploadedAt, status } = req.body;
  
  console.log(`Document uploaded: ${documentName} for application ${applicationId}`);
  console.log(`Document type: ${documentType}`);
  console.log(`Uploaded at: ${uploadedAt}`);
  
  // Process the webhook data as needed
  // e.g., update Monday.com, send notifications, etc.
  
  res.status(200).json({ received: true });
});
```

## Security Considerations

- The webhook URL should use HTTPS in production
- Consider implementing webhook signature verification for additional security
- The webhook endpoint should be idempotent to handle duplicate requests
- Implement proper error handling and logging on your webhook endpoint 