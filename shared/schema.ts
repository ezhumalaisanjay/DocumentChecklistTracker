import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicantType: varchar("applicant_type", { length: 50 }).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("uploaded"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  fileData: text("file_data"), // Base64 encoded file data for in-memory storage
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  applicantType: true,
  documentType: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  fileData: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export const applicantTypes = [
  "primary",
  "co-applicant", 
  "guarantor",
  "self-employed",
  "corporate"
] as const;

export type ApplicantType = typeof applicantTypes[number];

export const documentRequirements: Record<ApplicantType, Record<string, "required" | "optional" | "na">> = {
  primary: {
    "Photo ID": "required",
    "SSN Card": "required",
    "Bank Statements": "required",
    "Tax Returns": "required",
    "Employment Letter": "required",
    "Pay Stubs": "required",
    "Credit Report": "optional",
    "Reference Letters": "optional",
    "1099 Forms": "na",
    "Accountant Letter": "na",
    "Business License": "na",
    "Articles of Incorporation": "na",
    "Corporate Resolution": "na",
  },
  "co-applicant": {
    "Photo ID": "required",
    "SSN Card": "required",
    "Bank Statements": "required",
    "Tax Returns": "required",
    "Employment Letter": "required",
    "Pay Stubs": "required",
    "Credit Report": "optional",
    "Reference Letters": "optional",
    "1099 Forms": "na",
    "Accountant Letter": "na",
    "Business License": "na",
    "Articles of Incorporation": "na",
    "Corporate Resolution": "na",
  },
  guarantor: {
    "Photo ID": "required",
    "SSN Card": "required",
    "Bank Statements": "required",
    "Tax Returns": "required",
    "Employment Letter": "required",
    "Pay Stubs": "required",
    "Credit Report": "required",
    "Reference Letters": "optional",
    "1099 Forms": "na",
    "Accountant Letter": "na",
    "Business License": "na",
    "Articles of Incorporation": "na",
    "Corporate Resolution": "na",
  },
  "self-employed": {
    "Photo ID": "required",
    "SSN Card": "required",
    "Bank Statements": "required",
    "Tax Returns": "required",
    "Employment Letter": "required",
    "Pay Stubs": "required",
    "Credit Report": "optional",
    "Reference Letters": "optional",
    "1099 Forms": "required",
    "Accountant Letter": "required",
    "Business License": "required",
    "Articles of Incorporation": "optional",
    "Corporate Resolution": "na",
  },
  corporate: {
    "Photo ID": "required",
    "SSN Card": "required",
    "Bank Statements": "required",
    "Tax Returns": "required",
    "Employment Letter": "required",
    "Pay Stubs": "required",
    "Credit Report": "optional",
    "Reference Letters": "optional",
    "1099 Forms": "na",
    "Accountant Letter": "na",
    "Business License": "required",
    "Articles of Incorporation": "required",
    "Corporate Resolution": "required",
  },
};

export const documentDescriptions: Record<string, string> = {
  "Photo ID": "Driver's license, passport, or state ID",
  "SSN Card": "Official SSN card or W-2 form",
  "Bank Statements": "Last 3 months of bank statements",
  "Tax Returns": "Last 2 years of tax returns",
  "Employment Letter": "Letter from employer confirming employment",
  "Pay Stubs": "Last 3 months of pay stubs",
  "Credit Report": "Recent credit report from major bureau",
  "Reference Letters": "Professional or personal references",
  "1099 Forms": "Independent contractor tax forms",
  "Accountant Letter": "Letter from certified accountant",
  "Business License": "Valid business license or permit",
  "Articles of Incorporation": "Corporate formation documents",
  "Corporate Resolution": "Board resolution authorizing transaction",
};

export const documentIcons: Record<string, string> = {
  "Photo ID": "id-card",
  "SSN Card": "id-badge",
  "Bank Statements": "university",
  "Tax Returns": "file-invoice",
  "Employment Letter": "briefcase",
  "Pay Stubs": "money-check",
  "Credit Report": "chart-line",
  "Reference Letters": "envelope",
  "1099 Forms": "file-contract",
  "Accountant Letter": "calculator",
  "Business License": "certificate",
  "Articles of Incorporation": "building",
  "Corporate Resolution": "gavel",
};
