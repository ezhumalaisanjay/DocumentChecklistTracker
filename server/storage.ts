import { documents, type Document, type InsertDocument } from "@shared/schema";

export interface IStorage {
  getDocuments(applicantType: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  updateDocumentStatus(id: number, status: string): Promise<Document | undefined>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private currentId: number;

  constructor() {
    this.documents = new Map();
    this.currentId = 1;
  }

  async getDocuments(applicantType: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.applicantType === applicantType
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const document: Document = {
      ...insertDocument,
      id,
      status: "uploaded",
      uploadedAt: new Date(),
      fileData: insertDocument.fileData || null,
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async updateDocumentStatus(id: number, status: string): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (document) {
      document.status = status;
      this.documents.set(id, document);
      return document;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
