import { Handler } from '@netlify/functions';
import { storage } from '../storage';
import { insertDocumentSchema } from '../../shared/schema';
import { z } from 'zod';

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

      // Parse multipart form data (simplified for demo)
      const contentType = headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Content-Type must be multipart/form-data' }),
        };
      }

      // For Netlify Functions, we need to handle file uploads differently
      // This is a simplified version - in production, you'd need proper multipart parsing
      return {
        statusCode: 501,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'File upload not implemented for serverless functions' }),
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