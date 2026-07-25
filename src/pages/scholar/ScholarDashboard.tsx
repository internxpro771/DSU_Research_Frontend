import { useEffect, useState } from 'react';
import { scholarService } from '../../services/dataService';
import { Scholar } from '../../types';
import WorkflowProgress from '../../components/common/WorkflowProgress';
import { CheckCircle, BookOpen, Target, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { WORKFLOW_STAGE_LABELS } from '../../constants';

const ScholarDashboard = () => {
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profile, docs] = await Promise.all([
        scholarService.getProfile(),
        scholarService.getDocuments(),
      ]);
      setScholar(profile);
      const scholarOwnedDocuments = docs.filter(doc => doc.uploadedById === profile.userId);
      setDocumentCount(scholarOwnedDocuments.length);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dsu-maroon"></div></div>;
  if (!scholar) return <div className="text-center py-10">Profile not found</div>;

  // Calculate progress metrics
  const completedStages = scholar.workflowProgress?.filter(s => s.status === 'COMPLETED').length || 0;
  const totalStages = 8;
  const progressPercent = Math.round((completedStages / totalStages) * 100);
  const currentStageLabel = WORKFLOW_STAGE_LABELS[scholar.currentWorkflowStage] || scholar.currentWorkflowStage;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-800 uppercase">
              Welcome, {scholar.firstName} {scholar.lastName}
            </h1>
            <p className="text-gray-500 mt-1">
              {scholar.departmentName} • Guide: {scholar.guideName || 'Not yet assigned'}
            </p>
          </div>
          <div className="mt-3 md:mt-0 text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Scholar ID</p>
            <p className="text-lg font-semibold text-dsu-maroon">{scholar.registrationNumber}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-dsu-maroon/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-dsu-maroon" />
            </div>
            <span className="text-xs text-gray-500 uppercase">Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{progressPercent}%</p>
          <p className="text-xs text-gray-500 mt-1">Research Completion</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{completedStages}/{totalStages}</p>
          <p className="text-xs text-gray-500 mt-1">Stages Completed</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase">Current</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{currentStageLabel}</p>
          <p className="text-xs text-gray-500 mt-1">Active Phase</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase">Documents</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{documentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Uploaded Files</p>
        </div>
      </div>

      {/* PhD Journey */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="section-title mb-4">PhD Journey</h2>
        <WorkflowProgress stages={scholar.workflowProgress} />
      </div>
    </div>
  );
};

export default ScholarDashboard;

