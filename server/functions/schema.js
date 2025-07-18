import { z } from 'zod';

// Document schema for validation
export const insertDocumentSchema = z.object({
  applicantType: z.string().min(1),
  documentType: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  fileData: z.string().optional(),
});

// Applicant types
export const applicantTypes = [
  "primary",
  "co-applicant", 
  "guarantor"
];

// Document requirements
export const documentRequirements = {
  primary: {
    "Photo ID": "required",
    "SSN Card": "required",
    "Bank Statements": "required",
    "Tax Returns": "required",
    "Employment Letter": "required",
    "Pay Stubs": "required",
    "Credit Report": "optional",
    "Reference Letters": "optional",
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
  },
};

// Document descriptions
export const documentDescriptions = {
  "Photo ID": "Driver's license, passport, or state ID",
  "SSN Card": "Official SSN card or W-2 form",
  "Bank Statements": "Last 3 months of bank statements",
  "Tax Returns": "Last 2 years of tax returns",
  "Employment Letter": "Letter from employer confirming employment",
  "Pay Stubs": "Last 3 months of pay stubs",
  "Credit Report": "Recent credit report from major bureau",
  "Reference Letters": "Professional or personal references",
};

// Document icons
export const documentIcons = {
  "Photo ID": "id-card",
  "SSN Card": "id-badge",
  "Bank Statements": "university",
  "Tax Returns": "file-invoice",
  "Employment Letter": "briefcase",
  "Pay Stubs": "money-check",
  "Credit Report": "chart-line",
  "Reference Letters": "envelope",
}; 