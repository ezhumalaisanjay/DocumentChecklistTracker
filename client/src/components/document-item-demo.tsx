import { DocumentUploadDemo } from "./document-upload-demo";
import { documentRequirements, documentDescriptions, documentIcons, type ApplicantType } from "@shared/schema";
import type { Document } from "@shared/schema";

interface DocumentItemDemoProps {
  applicantType: ApplicantType;
  documentType: string;
  documents: Document[];
}

export function DocumentItemDemo({ applicantType, documentType, documents }: DocumentItemDemoProps) {
  const status = documentRequirements[applicantType][documentType];
  const description = documentDescriptions[documentType];
  const icon = documentIcons[documentType];
  
  const uploadedDocument = documents.find(doc => doc.documentType === documentType);

  if (status === "na") {
    return null;
  }

  return (
    <DocumentUploadDemo
      applicantType={applicantType}
      documentType={documentType}
      description={description}
      icon={icon}
      status={status}
      uploadedDocument={uploadedDocument}
    />
  );
}