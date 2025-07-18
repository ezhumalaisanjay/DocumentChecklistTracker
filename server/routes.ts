import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import { ApiClient } from "@mondaydotcomorg/api";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Monday.com API integration - Debug columns endpoint
  app.get("/api/monday/columns", async (req, res) => {
    try {
      const myToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzOTcyMTg4NCwiYWFpIjoxMSwidWlkIjo3ODE3NzU4NCwiaWFkIjoiMjAyNS0wNy0xNlQxMjowMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTUxNjQ0NSwicmduIjoidXNlMSJ9.s43_kjRmv-QaZ92LYdRlEvrq9CYqxKhh3XXpR-8nhKU";
      const mondayApiClient = new ApiClient({ token: myToken });

      const query = `
        query {
          boards(ids: 9602025981) {
            columns {
              id
              title
              type
            }
            items_page {
              items {
                id
                name
                column_values {
                  id
                  title
                  text
                  type
                }
                subitems {
                  id
                  name
                  column_values {
                    id
                    title
                    text
                    type
                  }
                }
              }
            }
          }
        }
      `;

      const response = await mondayApiClient.request(query);
      res.json(response);
    } catch (error) {
      console.error("Error fetching Monday.com columns:", error);
      res.status(500).json({ message: "Failed to fetch Monday.com columns" });
    }
  });

  // Monday.com API integration - Raw response for debugging
  app.get("/api/monday/raw", async (req, res) => {
    try {
      const myToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzOTcyMTg4NCwiYWFpIjoxMSwidWlkIjo3ODE3NzU4NCwiaWFkIjoiMjAyNS0wNy0xNlQxMjowMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTUxNjQ0NSwicmduIjoidXNlMSJ9.s43_kjRmv-QaZ92LYdRlEvrq9CYqxKhh3XXpR-8nhKU";
      const mondayApiClient = new ApiClient({ token: myToken });

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
                  column_values(ids: ["status", "text_mksxyax3"]) {
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
      res.json(response);
    } catch (error) {
      console.error("Error fetching Monday.com raw data:", error);
      res.status(500).json({ message: "Failed to fetch Monday.com raw data" });
    }
  });

  // Monday.com API integration - Debug endpoint
  app.get("/api/monday/debug", async (req, res) => {
    try {
      const myToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzOTcyMTg4NCwiYWFpIjoxMSwidWlkIjo3ODE3NzU4NCwiaWFkIjoiMjAyNS0wNy0xNlQxMjowMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTUxNjQ0NSwicmduIjoidXNlMSJ9.s43_kjRmv-QaZ92LYdRlEvrq9CYqxKhh3XXpR-8nhKU";
      const mondayApiClient = new ApiClient({ token: myToken });

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
                  column_values(ids: ["status", "text_mksxyax3"]) {
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
      
      const allSubitems = items.flatMap((item: any) => item.subitems || []);
      const missingSubitems = allSubitems.filter((subitem: any) => {
        const status = subitem.column_values.find((cv: any) => cv.id === "status")?.text;
        return status === "Missing";
      });

      res.json({
        totalItems: items.length,
        totalSubitems: allSubitems.length,
        missingSubitems: missingSubitems.length,
        missingItems: missingSubitems.map((s: any) => ({ 
          id: s.id, 
          name: s.name,
          status: s.column_values.find((cv: any) => cv.id === "status")?.text
        }))
      });
    } catch (error) {
      console.error("Error in debug endpoint:", error);
      res.status(500).json({ message: "Failed to fetch debug data" });
    }
  });

  // Monday.com API integration - Test endpoint
  app.get("/api/monday/test", async (req, res) => {
    try {
      const myToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzOTcyMTg4NCwiYWFpIjoxMSwidWlkIjo3ODE3NzU4NCwiaWFkIjoiMjAyNS0wNy0xNlQxMjowMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTUxNjQ0NSwicmduIjoidXNlMSJ9.s43_kjRmv-QaZ92LYdRlEvrq9CYqxKhh3XXpR-8nhKU";
      const mondayApiClient = new ApiClient({ token: myToken });

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
                  column_values(ids: ["status", "text_mksxyax3"]) {
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
      
      const allSubitems = items.flatMap((item: any) => item.subitems || []);
      const missingSubitems = allSubitems.filter((subitem: any) => {
        const status = subitem.column_values.find((cv: any) => cv.id === "status")?.text;
        return status === "Missing";
      });

      res.json({
        totalItems: items.length,
        totalSubitems: allSubitems.length,
        missingSubitems: missingSubitems.length,
        missingItems: missingSubitems.map((s: any) => ({ id: s.id, name: s.name }))
      });
    } catch (error) {
      console.error("Error in test endpoint:", error);
      res.status(500).json({ message: "Failed to fetch test data" });
    }
  });

  // Monday.com API integration
  app.get("/api/monday/documents/:applicantId", async (req, res) => {
    try {
      const { applicantId } = req.params;
      const myToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzOTcyMTg4NCwiYWFpIjoxMSwidWlkIjo3ODE3NzU4NCwiaWFkIjoiMjAyNS0wNy0xNlQxMjowMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTUxNjQ0NSwicmduIjoidXNlMSJ9.s43_kjRmv-QaZ92LYdRlEvrq9CYqxKhh3XXpR-8nhKU";
      const mondayApiClient = new ApiClient({ token: myToken });

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

      res.setHeader('Cache-Control', 'no-store');
      res.json(groupedDocuments);
    } catch (error) {
      console.error("Error fetching or filtering subitems:", error);
      res.status(500).json({ message: "Failed to fetch Monday.com documents" });
    }
  });
  
  // Get documents for an applicant type
  app.get("/api/documents/:applicantType", async (req, res) => {
    try {
      const { applicantType } = req.params;
      const documents = await storage.getDocuments(applicantType);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Upload document
  app.post("/api/documents", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { applicantType, documentType, referenceId } = req.body;
      
      if (!applicantType || !documentType) {
        return res.status(400).json({ message: "Applicant type and document type are required" });
      }

      const fileData = req.file.buffer.toString('base64');
      
      const documentData = {
        applicantType,
        documentType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileData,
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      
      // Send file to webhook immediately
      try {
        const webhookPayload = {
          reference_id: referenceId || "default",
          application_id: referenceId || "default", // Application ID for webhook
          document_name: req.file.originalname, // Document name for webhook
          file_name: req.file.originalname,
          section_name: documentType,
          file_base64: fileData
        };

        console.log(`Sending file to webhook: ${req.file.originalname} (${req.file.size} bytes) for application ID: ${referenceId}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const webhookResponse = await fetch('https://hook.us1.make.com/2vu8udpshhdhjkoks8gchub16wjp7cu3', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', webhookResponse.status, webhookResponse.statusText);
          console.error('Webhook response:', await webhookResponse.text());
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
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Update document status
  app.patch("/api/documents/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const document = await storage.updateDocumentStatus(id, status);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document status" });
    }
  });

  // Get document file data
  app.get("/api/documents/:id/file", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document || !document.fileData) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const buffer = Buffer.from(document.fileData, 'base64');
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve document file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
