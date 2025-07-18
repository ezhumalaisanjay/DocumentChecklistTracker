import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DocumentItem } from "@/components/document-item";
import { 
  documentRequirements, 
  type ApplicantType, 
  applicantTypes,
  type Document 
} from "@shared/schema";
import { 
  FileText, 
  User, 
  Users, 
  Shield, 
  Save, 
  Send, 
  Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUrlParams } from "@/hooks/use-url-params";

const applicantTypeLabels = {
  primary: "Primary Applicant",
  "co-applicant": "Co-Applicant", 
  guarantor: "Guarantor",
};

const applicantTypeIcons = {
  primary: User,
  "co-applicant": Users,
  guarantor: Shield,
};

interface MondayDocument {
  id: string;
  name: string;
  status: string;
  parentItemName: string;
  parentItemId: string;
  applicantType: string;
}

interface GroupedMondayDocuments {
  "Required Documents - Primary Applicant": MondayDocument[];
  "Required Documents - Co-Applicant": MondayDocument[];
  "Required Documents - Guarantor": MondayDocument[];
}

export default function DocumentCollection() {
  const [selectedApplicantType, setSelectedApplicantType] = useState<ApplicantType>("primary");
  const { toast } = useToast();
  const { getBooleanParam, getStringParam } = useUrlParams();

  // Get URL parameters to determine which applicant types to show
  const showCoApplicant = getBooleanParam("Co-Applicant", true);
  const showGuarantor = getBooleanParam("Guarantor", true);
  
  // Get applicant ID from URL parameters
  const applicantId = getStringParam("ID", "app_1752674377597_3uzu2eefu");

  // Filter available applicant types based on URL parameters
  const availableApplicantTypes = useMemo(() => {
    const types: ApplicantType[] = ["primary"];
    
    if (showCoApplicant) {
      types.push("co-applicant");
    }
    
    if (showGuarantor) {
      types.push("guarantor");
    }
    
    return types;
  }, [showCoApplicant, showGuarantor]);

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", selectedApplicantType],
  });

  // Fetch Monday.com missing documents
  const { data: mondayDocuments = {
    "Required Documents - Primary Applicant": [],
    "Required Documents - Co-Applicant": [],
    "Required Documents - Guarantor": []
  } } = useQuery<GroupedMondayDocuments>({
    queryKey: ["/api/monday/documents", applicantId],
  });

  // Get Monday.com documents for the selected applicant type
  const getMondayDocumentsForType = (applicantType: ApplicantType): MondayDocument[] => {
    const sectionKey = `Required Documents - ${applicantTypeLabels[applicantType]}` as keyof GroupedMondayDocuments;
    return mondayDocuments[sectionKey] || [];
  };

  // Merge Monday.com documents with existing requirements
  const getMergedRequiredDocuments = (applicantType: ApplicantType) => {
    const requirements = documentRequirements[applicantType];
    const mondayDocs = getMondayDocumentsForType(applicantType);
    
    // Only show Monday.com missing documents, hide all other documents
    const mondayRequired = mondayDocs
      .filter(doc => doc.status === "Missing")
      .map(doc => [doc.name, "required"] as [string, string]);
    
    return mondayRequired;
  };

  const getOptionalDocuments = (applicantType: ApplicantType) => {
    // Only show Monday.com missing documents, hide all optional documents
    return [];
  };

  const calculateProgress = () => {
    const requiredDocs = getMergedRequiredDocuments(selectedApplicantType);
    const uploadedRequiredDocs = requiredDocs.filter(([docType]) => 
      documents.some(doc => doc.documentType === docType)
    );
    
    if (requiredDocs.length === 0) return 100;
    return Math.round((uploadedRequiredDocs.length / requiredDocs.length) * 100);
  };

  const getTotalDocuments = () => {
    const mondayDocs = getMondayDocumentsForType(selectedApplicantType);
    return mondayDocs.filter(doc => doc.status === "Missing").length;
  };

  const getCompletedDocuments = () => {
    const mondayDocs = getMondayDocumentsForType(selectedApplicantType);
    const missingDocs = mondayDocs.filter(doc => doc.status === "Missing");
    
    const mondayCompleted = missingDocs.filter(doc => 
      documents.some(uploadedDoc => uploadedDoc.documentType === doc.name)
    ).length;
    
    return mondayCompleted;
  };

  const handleSave = () => {
    toast({
      title: "Progress saved",
      description: "Your document collection progress has been saved.",
    });
  };

  const handleSubmit = () => {
    const requiredDocs = getMergedRequiredDocuments(selectedApplicantType);
    const uploadedRequiredDocs = requiredDocs.filter(([docType]) => 
      documents.some(doc => doc.documentType === docType)
    );
    
    if (uploadedRequiredDocs.length < requiredDocs.length) {
      toast({
        title: "Missing required documents",
        description: `Please upload all required documents before submitting. ${requiredDocs.length - uploadedRequiredDocs.length} documents are still missing.`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Application submitted",
      description: "Your document collection has been submitted for review.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export in progress",
      description: "Your document package is being prepared for download.",
    });
  };

  const progress = calculateProgress();
  const completedDocs = getCompletedDocuments();
  const totalDocs = getTotalDocuments();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="text-blue-600 text-xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Document Collection Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Progress indicator hidden */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Applicant Type Selector */}
        {availableApplicantTypes.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Applicant Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 gap-4 ${
                availableApplicantTypes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
              }`}>
                {availableApplicantTypes.map((type) => {
                  const Icon = applicantTypeIcons[type];
                  const isSelected = selectedApplicantType === type;
                  
                  return (
                    <Button
                      key={type}
                      variant={isSelected ? "default" : "outline"}
                      className={`p-4 h-auto ${
                        isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setSelectedApplicantType(type)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {applicantTypeLabels[type]}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Documents - {applicantTypeLabels[selectedApplicantType]}</CardTitle>
            <p className="text-sm text-gray-600">
              Upload pending documents to complete your application
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monday.com Missing Documents Only */}
                {getMergedRequiredDocuments(selectedApplicantType).map(([docType]) => {
                  const mondayDoc = getMondayDocumentsForType(selectedApplicantType).find(doc => doc.name === docType);
                  return (
                    <DocumentItem
                      key={docType}
                      applicantType={selectedApplicantType}
                      documentType={docType}
                      documents={documents}
                      mondayDocument={mondayDoc}
                      referenceId={applicantId}
                    />
                  );
                })}
                
                {/* Show message if no missing documents */}
                {getMergedRequiredDocuments(selectedApplicantType).length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-gray-500">
                      <i className="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Missing Documents</h3>
                      <p className="text-sm text-gray-600">
                        All documents from Monday.com are up to date for {applicantTypeLabels[selectedApplicantType]}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Bar */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center text-sm text-gray-600">
                <Save className="w-4 h-4 mr-2" />
                <span>Auto-save enabled</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Package
                </Button>
                
                <Button variant="outline" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
                
                <Button onClick={handleSubmit}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
