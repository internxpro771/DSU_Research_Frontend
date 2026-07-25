import { useState } from 'react';
import { formatDate } from '../../utils/formatDate';
import { Upload, CheckCircle, Eye, Edit2 } from 'lucide-react';
import { scholarService } from '../../services/dataService';
import { DocumentItem } from '../../types';
import { toast } from 'react-toastify';

interface SelfStudyUploadSectionProps {
  documents: DocumentItem[];
  onRefresh: () => void;
}

const SelfStudyUploadSection = ({ documents, onRefresh }: SelfStudyUploadSectionProps) => {
  const [uploading, setUploading] = useState(false);

  const getDocByCategory = (category: string) => documents.find(d => d.documentCategory === category);

  const handleUpload = async (file: File, category: string) => {
    setUploading(true);
    try {
      await scholarService.uploadDocument(file, category);
      toast.success('Document uploaded successfully');
      onRefresh();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleReplace = async (documentId: number, file: File) => {
    setUploading(true);
    try {
      await scholarService.replaceDocument(documentId, file);
      toast.success('Document replaced successfully');
      onRefresh();
    } catch {
      toast.error('Failed to replace document');
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    { key: 'ONLINE_CERTIFICATE', label: 'Online Certificate Photocopy', description: 'Upload the certificate from the self-study course platform' },
    { key: 'COURSE_REGISTRATION_CONFIRMATION', label: 'Course Registration Confirmation', description: 'Upload the course registration confirmation document' },
    { key: 'MARK_SHEET', label: 'Mark Sheet', description: 'Upload the mark sheet / grade card' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-2">Self-Study Course Documents</h2>
      <p className="text-sm text-gray-500 mb-4">
        Upload the following documents after completing your self-study course. These documents are required for the First DAC workflow.
      </p>

      <div className="space-y-4">
        {categories.map((cat) => {
          const doc = getDocByCategory(cat.key);
          return (
            <div key={cat.key} className={`border rounded-lg p-4 ${doc ? 'border-green-300 bg-green-50/50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    {doc && <CheckCircle className="w-4 h-4 text-green-500" />}
                    <span>{cat.label}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                  {doc && (
                    <p className="text-xs text-gray-400 mt-1">
                      File: {doc.originalFileName} | Uploaded: {formatDate(doc.createdAt)}
                    </p>
                  )}
                </div>
                {doc && (
                  <div className="flex items-center space-x-2">
                    <a
                      href={`/api/v1/documents/${doc.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="View/Download"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    {doc.editable && (
                      <label className="p-1 text-orange-600 hover:bg-orange-50 rounded cursor-pointer" title="Replace">
                        <Edit2 className="w-4 h-4" />
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReplace(doc.id, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {!doc && (
                <div className="mt-3 flex items-center space-x-3">
                  <label className="flex-1">
                    <div className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded cursor-pointer hover:border-dsu-maroon/40">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">Select file (PDF/DOCX/JPEG/PNG)</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.jpg,.jpeg,.png"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, cat.key);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelfStudyUploadSection;
