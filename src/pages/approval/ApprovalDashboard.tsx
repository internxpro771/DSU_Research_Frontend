import { useEffect, useState } from 'react';
import { formatDate } from '../../utils/formatDate';
import { approvalService } from '../../services/dataService';
import { RequestItem } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import RejectModal from '../../components/common/RejectModal';
import { useAppSelector } from '../../hooks/useAppStore';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle } from 'lucide-react';

const ApprovalDashboard = () => {
  const { role } = useAppSelector((state) => state.auth);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await approvalService.getRequests(role!, 0, 50);
        setRequests(data.content);
      } catch {
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    if (role) fetchRequests();
  }, [role]);

  const handleApprove = async (requestId: number) => {
    try {
      await approvalService.approveRequest(role!, requestId);
      toast.success('Request approved');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectRequest = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (comments: string) => {
    if (!selectedRequestId) return;
    try {
      await approvalService.rejectRequest(role!, selectedRequestId, comments);
      toast.success('Request rejected');
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequestId));
    } catch {
      toast.error('Failed to reject');
    } finally {
      setRejectModalOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await approvalService.bulkApprove(role!, selectedIds);
      toast.success(`${selectedIds.length} request(s) approved`);
      setRequests((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    } catch {
      toast.error('Bulk approval failed');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const roleLabel = role === 'DEAN_OF_SCHOOL' ? 'Dean of School' :
                    role === 'DEAN_OF_RESEARCH' ? 'Dean of Research' :
                    role === 'REGISTRAR' ? 'Registrar' : 'Vice Chancellor';

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-gray-800">{roleLabel} — Approval Dashboard</h1>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-dsu-maroon/5 border border-dsu-maroon/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-dsu-maroon">{selectedIds.length} request(s) selected</span>
          <button onClick={handleBulkApprove} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
            Bulk Approve
          </button>
        </div>
      )}

      {/* Request List */}
      <div className="bg-white rounded-lg shadow">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No pending requests</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left"><input type="checkbox" onChange={(e) => {
                    if (e.target.checked) setSelectedIds(requests.map((r) => r.id));
                    else setSelectedIds([]);
                  }} /></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Scholar</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Raised By</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(req.id)} onChange={() => toggleSelect(req.id)} /></td>
                    <td className="px-4 py-3 font-medium">{req.requestType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">{req.scholarName}<br /><span className="text-xs text-gray-500">{req.scholarRegistrationNumber}</span></td>
                    <td className="px-4 py-3">{req.raisedByName}</td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-xs">{req.submittedAt ? formatDate(req.submittedAt) : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => handleApprove(req.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRejectRequest(req.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
};

export default ApprovalDashboard;
