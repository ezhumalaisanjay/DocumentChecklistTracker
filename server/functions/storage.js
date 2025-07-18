// In-memory storage for Netlify functions
class MemStorage {
  constructor() {
    this.documents = new Map();
    this.currentId = 1;
  }

  async getDocuments(applicantType) {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.applicantType === applicantType
    );
  }

  async getDocument(id) {
    return this.documents.get(id);
  }

  async createDocument(insertDocument) {
    const id = this.currentId++;
    const document = {
      ...insertDocument,
      id,
      status: "uploaded",
      uploadedAt: new Date(),
      fileData: insertDocument.fileData || null,
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id) {
    return this.documents.delete(id);
  }

  async updateDocumentStatus(id, status) {
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