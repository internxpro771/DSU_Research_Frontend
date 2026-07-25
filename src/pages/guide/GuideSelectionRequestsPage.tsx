import { useEffect, useState } from 'react';
import { guideService } from '../../services/dataService';
import RejectModal from '../../components/common/RejectModal';
import { toast } from 'react-toastify';
import { UserCheck } from 'lucide-react';

interface GuideSelectionRequest {
  id: number;
  requestId: number;
  scholarName: string;
  scholarRegistrationNumber: string;
  researchTitle: string;
  objectiveAndScope: string;
  status: string;
}

const GuideSelectionRequestsPage = () => {
  const [requests, setRequests] = useState<GuideSelectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await guideService.getGuideSelectionRequests();
        setRequests(data as GuideSelectionRequest[]);
      } catch {
        toast.error('Failed to load guide selection requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await guideService.approveGuideSelection(id);
      toast.success('Guide selection approved');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const openRejectModal = (id: number) => {
    setRejectingId(id);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (comment: string) => {
    if (rejectingId === null) return;
    try {
      await guideService.rejectGuideSelection(rejectingId, comment);
      toast.success('Guide selection rejected');
      setRequests((prev) => prev.filter((r) => r.id !== rejectingId));
    } catch {
      toast.error('Failed to reject');
    }
    setRejectingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dsu-maroon/10 rounded-lg flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-dsu-maroon" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-800">Guide Selection Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">Scholars requesting you as their research supervisor</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dsu-maroon"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          No pending guide selection requests
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{req.scholarName}</p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {req.scholarRegistrationNumber}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Research Title:</span> {req.researchTitle}
                  </p>
                  {req.objectiveAndScope && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                      <span className="font-medium">Objective & Scope:</span> {req.objectiveAndScope}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(req.id)}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => { setRejectModalOpen(false); setRejectingId(null); }}
        onConfirm={handleRejectConfirm}
        title="Reject Guide Selection"
      />
    </div>
  );
};

export default GuideSelectionRequestsPage;
