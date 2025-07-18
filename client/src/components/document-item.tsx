import { DocumentUpload } from "./document-upload";
import { documentRequirements, documentDescriptions, documentIcons, type ApplicantType } from "@shared/schema";
import type { Document } from "@shared/schema";

interface MondayDocument {
  id: string;
  name: string;
  status: string;
  parentItemName: string;
  parentItemId: string;
  applicantType: string;
}

interface DocumentItemProps {
  applicantType: ApplicantType;
  documentType: string;
  documents: Document[];
  referenceId?: string;
}

export function DocumentItem({ applicantType, documentType, documents, referenceId }: DocumentItemProps) {
  const status = documentRequirements[applicantType][documentType];
  const description = documentDescriptions[documentType];
  const icon = documentIcons[documentType];
  
  const uploadedDocument = documents.find(doc => doc.documentType === documentType);

  if (status === "na") {
    return null;
  }

  return (
    <DocumentUpload
      applicantType={applicantType}
      documentType={documentType}
      description={description}
      icon={icon}
      status={status}
      uploadedDocument={uploadedDocument}
      referenceId={referenceId}
    />
  );
}
