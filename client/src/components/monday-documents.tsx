import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertCircle, FileText, CheckCircle } from 'lucide-react';

interface MondayDocument {
  id: string;
  name: string;
  status: string;
  parentItemName: string;
  parentItemId: string;
  applicantType: string;
}

interface GroupedDocuments {
  "Required Documents - Primary Applicant": MondayDocument[];
  "Required Documents - Co-Applicant": MondayDocument[];
  "Required Documents - Guarantor": MondayDocument[];
}

interface MondayDocumentsProps {
  applicantId: string;
}

export function MondayDocuments({ applicantId }: MondayDocumentsProps) {
  const [documents, setDocuments] = useState<GroupedDocuments>({
    "Required Documents - Primary Applicant": [],
    "Required Documents - Co-Applicant": [],
    "Required Documents - Guarantor": []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMondayDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/monday/documents/${applicantId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch Monday.com documents');
        }
        
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (applicantId) {
      fetchMondayDocuments();
    }
  }, [applicantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading Monday.com documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-red-600 p-6">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Error: {error}</span>
      </div>
    );
  }

  // Calculate total documents across all sections
  const totalDocuments = Object.values(documents).reduce((total, sectionDocs) => total + sectionDocs.length, 0);

  if (totalDocuments === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Monday.com Documents</h3>
        </div>
        <p className="text-gray-500">No missing documents found for this applicant.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <FileText className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-semibold">Monday.com Documents (Missing)</h3>
      </div>
      <div className="space-y-6">
        {Object.entries(documents).map(([sectionName, sectionDocs]) => {
          if (sectionDocs.length === 0) return null;
          
          return (
            <div key={sectionName} className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {sectionName}
              </h4>
              <div className="space-y-3">
                {sectionDocs.map((doc: MondayDocument) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <h5 className="font-medium text-gray-900">{doc.name}</h5>
                        <p className="text-sm text-gray-500">
                          Parent: {doc.parentItemName} • Type: {doc.applicantType}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">Missing</Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">
          Found {totalDocuments} missing document{totalDocuments !== 1 ? 's' : ''} for applicant: {applicantId}
        </p>
      </div>
    </div>
  );
} 