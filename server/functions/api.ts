import { Handler } from '@netlify/functions';
import { storage } from './storage.js';
import { insertDocumentSchema } from './schema.js';
import { z } from 'zod';
import { ApiClient } from '@mondaydotcomorg/api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Monday.com API token - should be set as environment variable
const MONDAY_TOKEN = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzOTcyMTg4NCwiYWFpIjoxMSwidWlkIjo3ODE3NzU4NCwiaWFkIjoiMjAyNS0wNy0xNlQxMjowMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTUxNjQ0NSwicmduIjoidXNlMSJ9.s43_kjRmv-QaZ92LYdRlEvrq9CYqxKhh3XXpR-8nhKU";

// Webhook URL - should be set as environment variable
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://hook.us1.make.com/2vu8udpshhdhjkoks8gchub16wjp7cu3';

const handler: Handler = async (event, context) => {
  const { httpMethod, path, body, headers } = event;
  
  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Extract path segments - handle both direct function calls and redirects
    let pathSegments = path.split('/').filter(Boolean);
    
    // If the path starts with the function name, remove it
    if (pathSegments[0] === 'api') {
      pathSegments = pathSegments.slice(1);
    }
    
    // Monday.com API endpoints
    if (pathSegments[0] === 'monday') {
      return await handleMondayEndpoints(pathSegments, httpMethod);
    }
    
    // Document API endpoints
    if (pathSegments[0] === 'documents') {
      return await handleDocumentEndpoints(pathSegments, httpMethod, body, headers);
    }
    
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Not found', path: path, segments: pathSegments }),
    };
    
  } catch (error) {
    console.error('Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Internal server error', error: errorMessage }),
    };
  }
};

async function handleMondayEndpoints(pathSegments: string[], httpMethod: string) {
  if (httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  // GET /api/monday/documents/:applicantId
  if (pathSegments.length === 3 && pathSegments[1] === 'documents') {
    const applicantId = pathSegments[2];
    const mondayApiClient = new ApiClient({ token: MONDAY_TOKEN });

    const query = `
      query {
        boards(ids: 9602025981) {
          items_page {
            items {
              id
              name
              column_values(ids: ["text_mksxyax3"]) {
                id
                text
              }
              subitems {
                id
                name
                column_values(ids: ["status", "color_mksyqx5h"]) {
                  id
                  text
                  ... on StatusValue {
                    label
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await mondayApiClient.request(query);
    const items = (response as any)?.boards?.[0]?.items_page?.items || [];
    const targetStatus = "Missing";

    // Filter items by Applicant ID, then get missing subitems from those items
    const filteredSubitems = items.flatMap((item: any) => {
      const itemApplicantId = item.column_values.find((cv: any) => cv.id === "text_mksxyax3")?.text;
      
      // Only process items where Applicant ID matches
      if (itemApplicantId === applicantId) {
        return (item.subitems || []).filter((subitem: any) => {
          const status = subitem.column_values.find((cv: any) => cv.id === "status")?.text;
          return status === targetStatus;
        }).map((subitem: any) => {
          // Get the Applicant type from the color_mksyqx5h column, or try to infer from other columns
          let applicantType = subitem.column_values.find((cv: any) => cv.id === "color_mksyqx5h")?.text;
          
          // If no color column found, try to infer from the subitem name or other properties
          if (!applicantType) {
            // Default to "Primary Applicant" if we can't determine
            applicantType = "Primary Applicant";
          }
          
          // Map "Applicant" to "Primary Applicant" for consistency
          if (applicantType === "Applicant") {
            applicantType = "Primary Applicant";
          }
          
          return {
            ...subitem,
            parentItemName: item.name,
            parentItemId: item.id,
            applicantType: applicantType
          };
        });
      }
      return [];
    });

    // Group subitems by applicant type
    const groupedDocuments: { [key: string]: any[] } = {
      "Required Documents - Primary Applicant": [],
      "Required Documents - Co-Applicant": [],
      "Required Documents - Guarantor": []
    };

    filteredSubitems.forEach((subitem: any) => {
      const applicantType = subitem.applicantType;
      let sectionName = "Required Documents - Primary Applicant"; // default

      // Map "Applicant" to "Primary Applicant" for consistency
      if (applicantType === "Applicant" || applicantType === "Primary Applicant") {
        sectionName = "Required Documents - Primary Applicant";
      } else if (applicantType === "Co-Applicant") {
        sectionName = "Required Documents - Co-Applicant";
      } else if (applicantType === "Guarantor") {
        sectionName = "Required Documents - Guarantor";
      }

      groupedDocuments[sectionName].push({
        id: subitem.id,
        name: subitem.name,
        status: subitem.column_values.find((cv: any) => cv.id === "status")?.text,
        parentItemName: subitem.parentItemName,
        parentItemId: subitem.parentItemId,
        applicantType: applicantType === "Applicant" ? "Primary Applicant" : applicantType
      });
    });

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(groupedDocuments),
    };
  }

  // GET /api/monday/debug
  if (pathSegments.length === 2 && pathSegments[1] === 'debug') {
    const mondayApiClient = new ApiClient({ token: MONDAY_TOKEN });

    const query = `
      query {
        boards(ids: 9602025981) {
          items_page {
            items {
              id
              name
              subitems {
                id
                name
                column_values(ids: ["status"]) {
                  id
                  text
                }
              }
            }
          }
        }
      }
    `;

    const response = await mondayApiClient.request(query);
    const items = (response as any)?.boards?.[0]?.items_page?.items || [];
    
    const allSubitems = items.flatMap((item: any) => item.subitems || []);
    const missingSubitems = allSubitems.filter((subitem: any) => {
      const status = subitem.column_values.find((cv: any) => cv.id === "status")?.text;
      return status === "Missing";
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        totalItems: items.length,
        totalSubitems: allSubitems.length,
        missingSubitems: missingSubitems.length,
        missingItems: missingSubitems.map((s: any) => ({ 
          id: s.id, 
          name: s.name,
          status: s.column_values.find((cv: any) => cv.id === "status")?.text
        }))
      }),
    };
  }

  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Monday.com endpoint not found' }),
  };
}

async function handleDocumentEndpoints(pathSegments: string[], httpMethod: string, body: string | null, headers: any) {
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

    try {
      const data = JSON.parse(body);
      const { applicantType, documentType, fileName, fileSize, mimeType, fileData, referenceId } = data;
      
      if (!applicantType || !documentType || !fileName || !fileSize || !mimeType || !fileData) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing required fields' }),
        };
      }

      const documentData = {
        applicantType,
        documentType,
        fileName,
        fileSize,
        mimeType,
        fileData,
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      
      // Send file to webhook
      try {
        const webhookPayload = {
          reference_id: referenceId || "default",
          file_name: fileName,
          section_name: documentType,
          file_base64: fileData
        };

        console.log(`Sending file to webhook: ${fileName} (${fileSize} bytes)`);
        
        const webhookResponse = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', webhookResponse.status, webhookResponse.statusText);
        } else {
          console.log('File sent to webhook successfully');
          const responseText = await webhookResponse.text();
          if (responseText) {
            console.log('Webhook response:', responseText);
          }
        }
      } catch (webhookError) {
        console.error('Error sending to webhook:', webhookError);
        // Don't fail the upload if webhook fails
      }
      
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify(document),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Invalid document data", errors: error.errors }),
        };
      }
      throw error;
    }
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
    body: JSON.stringify({ message: 'Document endpoint not found' }),
  };
}

export { handler }; 