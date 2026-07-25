import { useEffect, useState } from 'react';
import { formatDate } from '../../utils/formatDate';
import { scholarService } from '../../services/dataService';
import { DocumentItem } from '../../types';
import SelfStudyUploadSection from '../../components/scholar/SelfStudyUploadSection';
import { Upload, CheckCircle, Eye, Edit2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

const DocumentRepositoryPage = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const docs = await scholarService.getDocuments();
      setDocuments(docs);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await scholarService.uploadDocument(file, category);
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch {
      toast.error('Failed to upload document');
    }
  };

  const handleReplaceDocument = async (documentId: number, file: File) => {
    try {
      await scholarService.replaceDocument(documentId, file);
      toast.success('Document replaced successfully');
      fetchDocuments();
    } catch {
      toast.error('Failed to replace document');
    }
  };

  const getDocByCategory = (category: string) => documents.find(d => d.documentCategory === category);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dsu-maroon"></div>
      </div>
    );
  }

  const affidavitParent = getDocByCategory('AFFIDAVIT_PARENT');
  const affidavitScholar = getDocByCategory('AFFIDAVIT_SCHOLAR');
  const halfYearlyReport = getDocByCategory('HALF_YEARLY_REPORT');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-800">Document Repository</h1>
        <p className="text-gray-500 text-sm mt-1">Upload and manage your research documents</p>
      </div>

      {/* Affidavit Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-dsu-maroon" />
          Affidavit Documents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocumentUploadCard
            label="Affidavit (Parent)"
            category="AFFIDAVIT_PARENT"
            document={affidavitParent}
            onUpload={handleFileUpload}
            onReplace={handleReplaceDocument}
          />
          <DocumentUploadCard
            label="Affidavit (Scholar)"
            category="AFFIDAVIT_SCHOLAR"
            document={affidavitScholar}
            onUpload={handleFileUpload}
            onReplace={handleReplaceDocument}
          />
        </div>
      </div>

      {/* Self-Study Course Documents */}
      <SelfStudyUploadSection documents={documents} onRefresh={fetchDocuments} />

      {/* Half-Yearly Report Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-dsu-maroon" />
          Half-Yearly Report Upload
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload your half-yearly progress report as required by the university.
        </p>
        <DocumentUploadCard
          label="Half-Yearly Report"
          category="HALF_YEARLY_REPORT"
          document={halfYearlyReport}
          onUpload={handleFileUpload}
          onReplace={handleReplaceDocument}
        />
      </div>
    </div>
  );
};

// Reusable Document Upload Card
interface DocumentUploadCardProps {
  label: string;
  category: string;
  document: DocumentItem | undefined;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, category: string) => void;
  onReplace: (documentId: number, file: File) => void;
}

const DocumentUploadCard = ({ label, category, document, onUpload, onReplace }: DocumentUploadCardProps) => {
  return (
    <div className={`border rounded-lg p-4 ${document ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-gray-50/30'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            {document && <CheckCircle className="w-4 h-4 text-green-500" />}
            <span>{label}</span>
          </h4>
          {document && (
            <p className="text-xs text-gray-400 mt-1">
              {document.originalFileName} • {formatDate(document.createdAt)}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {document ? (
            <>
              <a
                href={`/api/v1/documents/${document.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                title="View/Download"
              >
                <Eye className="w-4 h-4" />
              </a>
              <label className="p-1.5 text-orange-600 hover:bg-orange-50 rounded cursor-pointer" title="Replace">
                <Edit2 className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onReplace(document.id, file);
                  }}
                />
              </label>
            </>
          ) : (
            <label className="flex items-center space-x-2 px-3 py-2 bg-dsu-maroon text-white rounded-lg text-sm cursor-pointer hover:bg-dsu-maroon-hover transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={(e) => onUpload(e, category)}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentRepositoryPage;
