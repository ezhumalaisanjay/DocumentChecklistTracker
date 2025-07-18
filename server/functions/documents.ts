import { Handler } from '@netlify/functions';
import { storage } from '../storage';
import { insertDocumentSchema } from '../../shared/schema';
import { z } from 'zod';

// Webhook function to send document upload notification
async function sendWebhookNotification(documentName: string, applicationId: string, documentType: string) {
  const webhookUrl = process.env.MONDAY_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('No webhook URL configured, skipping webhook notification');
    return;
  }

  try {
    const webhookData = {
      documentName,
      applicationId,
      documentType,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      console.error('Webhook notification failed:', response.status, response.statusText);
    } else {
      console.log('Webhook notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending webhook notification:', error);
  }
}

const handler: Handler = async (event, context) => {
  const { httpMethod, path, body, headers } = event;
  
  // Handle CORS
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    // Extract path segments
    const pathSegments = path.split('/').filter(Boolean);
    
    if (httpMethod === 'GET') {
      // GET /api/documents/:applicantType
      if (pathSegments.length === 2) {
        const applicantType = pathSegments[1];
        const documents = await storage.getDocuments(applicantType);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(documents),
        };
      }
      
      // GET /api/documents/:id/file
      if (pathSegments.length === 3 && pathSegments[2] === 'file') {
        const id = parseInt(pathSegments[1]);
        const document = await storage.getDocument(id);
        
        if (!document || !document.fileData) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Document not found' }),
          };
        }
        
        const buffer = Buffer.from(document.fileData, 'base64');
        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': document.mimeType,
            'Content-Disposition': `inline; filename="${document.fileName}"`,
          },
          body: buffer.toString('base64'),
          isBase64Encoded: true,
        };
      }
    }
    
    if (httpMethod === 'POST') {
      // POST /api/documents - Upload document
      if (!body) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'No body provided' }),
        };
      }

      let uploadData;
      try {
        uploadData = JSON.parse(body);
      } catch (error) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Invalid JSON body' }),
        };
      }

      // Validate the upload data
      const validationResult = insertDocumentSchema.safeParse(uploadData);
      if (!validationResult.success) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ 
            message: 'Invalid upload data', 
            errors: validationResult.error.errors 
          }),
        };
      }

      // Create the document
      const document = await storage.createDocument(validationResult.data);

      // Send webhook notification with document name and application ID
      const applicationId = uploadData.referenceId || 'unknown';
      await sendWebhookNotification(
        document.fileName,
        applicationId,
        document.documentType
      );

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify(document),
      };
    }
    
    if (httpMethod === 'DELETE') {
      // DELETE /api/documents/:id
      if (pathSegments.length === 2) {
        const id = parseInt(pathSegments[1]);
        const success = await storage.deleteDocument(id);
        
        if (!success) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Document not found' }),
          };
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Document deleted successfully' }),
        };
      }
    }
    
    if (httpMethod === 'PATCH') {
      // PATCH /api/documents/:id/status
      if (pathSegments.length === 3 && pathSegments[2] === 'status') {
        const id = parseInt(pathSegments[1]);
        const { status } = JSON.parse(body || '{}');
        
        if (!status) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Status is required' }),
          };
        }
        
        const document = await storage.updateDocumentStatus(id, status);
        
        if (!document) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Document not found' }),
          };
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(document),
        };
      }
    }
    
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Not found' }),
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export { handler };