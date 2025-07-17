import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DocumentItemDemo } from "@/components/document-item-demo";
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

export default function DocumentCollectionDemo() {
  const [selectedApplicantType, setSelectedApplicantType] = useState<ApplicantType>("primary");
  const [documents] = useState<Document[]>([]); // Empty for demo
  const { toast } = useToast();

  const getRequiredDocuments = (applicantType: ApplicantType) => {
    const requirements = documentRequirements[applicantType];
    return Object.entries(requirements).filter(([_, status]) => status === "required");
  };

  const getOptionalDocuments = (applicantType: ApplicantType) => {
    const requirements = documentRequirements[applicantType];
    return Object.entries(requirements).filter(([_, status]) => status === "optional");
  };

  const calculateProgress = () => {
    // For demo purposes, show 0% progress
    return 0;
  };

  const getTotalDocuments = () => {
    const requirements = documentRequirements[selectedApplicantType];
    return Object.values(requirements).filter(status => status !== "na").length;
  };

  const getCompletedDocuments = () => {
    return 0; // For demo
  };

  const handleSave = () => {
    toast({
      title: "Demo Mode",
      description: "This is a demo version. In production, your progress would be saved.",
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Demo Mode",
      description: "This is a demo version. In production, your application would be submitted.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Demo Mode",
      description: "This is a demo version. In production, your documents would be exported.",
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
                Document Collection Portal (Demo)
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span>{completedDocs}</span> of <span>{totalDocs}</span> documents completed
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Notice */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-info-circle text-blue-600"></i>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Demo Mode</h3>
                <p className="text-sm text-blue-700">
                  This is a demo version optimized for Netlify deployment. File uploads are simulated and no data is actually saved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicant Type Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Applicant Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {applicantTypes.map((type) => {
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

        {/* Document Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents - {applicantTypeLabels[selectedApplicantType]}</CardTitle>
            <p className="text-sm text-gray-600">
              Upload all required documents to complete your application (Demo Mode)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Required Documents */}
              {getRequiredDocuments(selectedApplicantType).map(([docType]) => (
                <DocumentItemDemo
                  key={docType}
                  applicantType={selectedApplicantType}
                  documentType={docType}
                  documents={documents}
                />
              ))}
              
              {/* Optional Documents */}
              {getOptionalDocuments(selectedApplicantType).map(([docType]) => (
                <DocumentItemDemo
                  key={docType}
                  applicantType={selectedApplicantType}
                  documentType={docType}
                  documents={documents}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center text-sm text-gray-600">
                <Save className="w-4 h-4 mr-2" />
                <span>Demo mode - changes not saved</span>
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