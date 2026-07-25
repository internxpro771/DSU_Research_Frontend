import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scholarService } from '../../services/dataService';
import { GuideInfo } from '../../types';
import { toast } from 'react-toastify';

interface GuideSelectionStatus {
  requestId: number;
  status: string;
  guideName: string;
  researchTitle: string;
  objectiveAndScope?: string;
  rejectionComment?: string;
}

const GuideSelectionPage = () => {
  const [guides, setGuides] = useState<GuideInfo[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<number | null>(null);
  const [researchTitle, setResearchTitle] = useState('');
  const [objectiveAndScope, setObjectiveAndScope] = useState('');
  const [selectionStatus, setSelectionStatus] = useState<GuideSelectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const [data, status] = await Promise.all([
          scholarService.getAvailableGuides(),
          scholarService.getGuideSelectionStatus(),
        ]);
        setGuides(data);
        setSelectionStatus((status as GuideSelectionStatus | null) || null);

        if (status && typeof status === 'object') {
          const s = status as GuideSelectionStatus;
          if (s.researchTitle) setResearchTitle(s.researchTitle);
          if (s.objectiveAndScope) setObjectiveAndScope(s.objectiveAndScope);
        }
      } catch {
        toast.error('Failed to load guides');
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide) {
      toast.error('Please select a guide');
      return;
    }
    setSubmitting(true);
    try {
      await scholarService.submitGuideSelection({
        researchTitle,
        objectiveAndScope,
        guideId: selectedGuide,
      });
      toast.success('Guide selection request submitted');
      const status = await scholarService.getGuideSelectionStatus();
      setSelectionStatus((status as GuideSelectionStatus | null) || null);
      navigate('/scholar/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading available guides...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Select Your Guide</h1>

      {selectionStatus && (
        <div className={`mb-4 rounded-lg border p-4 ${selectionStatus.status === 'REJECTED' ? 'bg-red-50 border-red-200' : selectionStatus.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className="text-sm font-semibold text-gray-800">Current Request: {selectionStatus.status}</p>
          <p className="text-sm text-gray-700 mt-1">Guide: {selectionStatus.guideName}</p>
          <p className="text-sm text-gray-700">Research Title: {selectionStatus.researchTitle}</p>
          {selectionStatus.rejectionComment && (
            <p className="text-sm text-red-700 mt-1">Rejection Reason: {selectionStatus.rejectionComment}</p>
          )}
          {selectionStatus.status === 'REJECTED' && (
            <p className="text-xs text-gray-600 mt-2">Update your guide/title/scope and click "Edit & Resubmit".</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title of Research *</label>
          <input
            type="text"
            value={researchTitle}
            onChange={(e) => setResearchTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/30 outline-none"
            placeholder="Enter your research title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objective & Scope *</label>
          <textarea
            value={objectiveAndScope}
            onChange={(e) => setObjectiveAndScope(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/30 outline-none"
            rows={4}
            placeholder="Describe the objective and scope of your research"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Guide *</label>
          {guides.length === 0 ? (
            <p className="text-gray-500 text-sm">No available guides in your department</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {guides.map((guide) => (
                <label
                  key={guide.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedGuide === guide.id ? 'border-indigo-500 bg-dsu-maroon/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="guide"
                      value={guide.id}
                      checked={selectedGuide === guide.id}
                      onChange={() => setSelectedGuide(guide.id)}
                      className="text-dsu-maroon"
                    />
                    <div>
                      <p className="font-medium text-sm">{guide.firstName} {guide.lastName}</p>
                      <p className="text-xs text-gray-500">{guide.designation} • {guide.specialization || 'N/A'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {guide.currentScholarCount}/{guide.maxScholars} scholars
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedGuide || selectionStatus?.status === 'PENDING' || selectionStatus?.status === 'APPROVED'}
          className="w-full bg-dsu-maroon text-white py-2 px-4 rounded-lg font-medium hover:bg-dsu-maroon-hover disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : selectionStatus?.status === 'REJECTED' ? 'Edit & Resubmit' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default GuideSelectionPage;
