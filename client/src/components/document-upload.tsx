import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

interface DocumentUploadProps {
  applicantType: string;
  documentType: string;
  description: string;
  icon: string;
  status: "required" | "optional" | "na";
  uploadedDocument?: Document;
}

export function DocumentUpload({
  applicantType,
  documentType,
  description,
  icon,
  status,
  uploadedDocument,
}: DocumentUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicantType", applicantType);
      formData.append("documentType", documentType);
      
      const response = await apiRequest("POST", "/api/documents", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", applicantType] });
      toast({
        title: "Document uploaded successfully",
        description: `${documentType} has been uploaded.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", applicantType] });
      toast({
        title: "Document removed",
        description: `${documentType} has been removed.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove document",
        description: error.message || "Failed to remove document",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  if (status === "na") {
    return null;
  }

  const getStatusBadge = () => {
    if (uploadedDocument) {
      if (uploadedDocument.status === "processing") {
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <i className="fas fa-check-circle mr-1"></i>
          Uploaded
        </Badge>
      );
    }
    
    return status === "required" ? (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        <i className="fas fa-exclamation-circle mr-1"></i>
        Required
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        <i className="fas fa-info-circle mr-1"></i>
        Optional
      </Badge>
    );
  };

  const handlePreview = () => {
    if (uploadedDocument) {
      window.open(`/api/documents/${uploadedDocument.id}/file`, '_blank');
    }
  };

  const handleDelete = () => {
    if (uploadedDocument) {
      deleteMutation.mutate(uploadedDocument.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={`p-4 transition-all duration-200 hover:shadow-md ${
      uploadedDocument ? 
        uploadedDocument.status === "processing" ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"
        : "border-gray-200"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <i className={`fas fa-${icon} ${
            uploadedDocument ? 
              uploadedDocument.status === "processing" ? "text-yellow-600" : "text-green-600"
              : "text-gray-400"
          } mr-3`}></i>
          <div>
            <h3 className="font-medium text-gray-900">{documentType}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {uploadedDocument ? (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-file-pdf text-red-600 mr-3"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedDocument.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedDocument.fileSize)} • {
                    uploadedDocument.status === "processing" ? "Under review" : 
                    `Uploaded ${new Date(uploadedDocument.uploadedAt!).toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {uploadedDocument.status === "processing" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreview}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800"
                    disabled={deleteMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your file here, or{" "}
            <span className="text-blue-600 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
          
          {uploadMutation.isPending && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
