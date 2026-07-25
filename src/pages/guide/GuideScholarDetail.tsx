import { useEffect, useState } from 'react';
import { formatDate } from '../../utils/formatDate';
import { useParams, useNavigate } from 'react-router-dom';
import { guideService } from '../../services/dataService';
import { Scholar, RequestItem } from '../../types';
import WorkflowProgress from '../../components/common/WorkflowProgress';
import StatusBadge from '../../components/common/StatusBadge';
import ChatWindow from '../../components/common/ChatWindow';
import FirstDacMeetingSection from '../../components/guide/FirstDacMeetingSection';
import ComprehensiveVivaSection from '../../components/guide/ComprehensiveVivaSection';
import ColloquiumSection from '../../components/guide/ColloquiumSection';
import InchCommitteeSection from '../../components/guide/InchCommitteeSection';
import SynopsisSection from '../../components/guide/SynopsisSection';
import ThesisDefenseSection from '../../components/guide/ThesisDefenseSection';
import { ArrowLeft, FileText, Eye, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import DateInput from '../../components/common/DateInput';
import TimeInput from '../../components/common/TimeInput';
import { getRequestTypeLabel } from '../../constants';

const formatMeetingTypeLabel = (requestType: string): string => {
  const label = getRequestTypeLabel(requestType);
  return label.replace(/^Requisition for\s+/i, '').replace(/\s+Meeting$/i, '');
};

const COMMON_MEETING_REQUEST_TYPES = [
  'INITIAL_DAC_REQUEST',
  'COMPREHENSIVE_VIVA_REQUEST',
  'COLLOQUIUM_REQUEST',
  'INCH_COMMITTEE_REQUEST',
  'SYNOPSIS_REQUEST',
  'THESIS_DEFENSE_REQUEST',
] as const;

const PHASE_TABS = [
  { key: 'nomination-expert-members', label: 'Phase 1: Nomination of Expert Members' },
  { key: 'first-dac', label: 'Phase 2: First DAC Meeting' },
  { key: 'comprehensive-viva', label: 'Phase 3: Comprehensive Viva' },
  { key: 'colloquium', label: 'Phase 4: Colloquium' },
  { key: 'inch-committee', label: 'Phase 5: Inch Committee' },
  { key: 'synopsis', label: 'Phase 6: Synopsis' },
  { key: 'thesis-defense', label: 'Phase 7: Thesis Defense' },
];

const GuideScholarDetail = () => {
  const { scholarId } = useParams<{ scholarId: string }>();
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [scholarDocs, setScholarDocs] = useState<{ id: number; originalFileName: string; documentCategory: string; fileType: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nomination-expert-members');
  const [meetingRequestType, setMeetingRequestType] = useState<string>('INITIAL_DAC_REQUEST');
  const [meetingVenue, setMeetingVenue] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [meetingEndTime, setMeetingEndTime] = useState('');
  const [meetingSubmitting, setMeetingSubmitting] = useState(false);
  const [meetingExpanded, setMeetingExpanded] = useState(false);
  const [meetingRequestsExpanded, setMeetingRequestsExpanded] = useState(false);
  const [scholarDocsExpanded, setScholarDocsExpanded] = useState(false);
  const navigate = useNavigate();

  const selectedMeetingRequest = requests.find((r) => r.requestType === meetingRequestType);
  const meetingRequests = requests
    .filter((r) => COMMON_MEETING_REQUEST_TYPES.includes(r.requestType as typeof COMMON_MEETING_REQUEST_TYPES[number]))
    .sort((a, b) => new Date(b.createdAt || b.submittedAt || 0).getTime() - new Date(a.createdAt || a.submittedAt || 0).getTime());

  const isSelectedApproved = selectedMeetingRequest?.status === 'APPROVED';

  const handleEditResubmitMeetingRequest = async () => {
    if (!selectedMeetingRequest || selectedMeetingRequest.status !== 'REJECTED') return;
    try {
      const reopened = await guideService.resubmitRequest(selectedMeetingRequest.id);
      handleRequestCreated(reopened);
      toast.success('Request reopened for editing');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to reopen request');
    }
  };

  const handleSubmitCommonMeetingRequest = async () => {
    if (!scholar) return;
    if (!meetingRequestType || !meetingVenue.trim() || !meetingDate || !meetingStartTime || !meetingEndTime) {
      toast.error('Please complete all meeting requisition fields');
      return;
    }
    if (selectedMeetingRequest && (selectedMeetingRequest.status === 'SUBMITTED' || selectedMeetingRequest.status === 'PENDING_APPROVAL' || selectedMeetingRequest.status === 'APPROVED')) {
      toast.error('A request of this type is already submitted and awaiting approval');
      return;
    }
    setMeetingSubmitting(true);
    try {
      let requestId = selectedMeetingRequest?.id;
      const payload = {
        requestType: meetingRequestType,
        scholarId: scholar.id,
        formData: {
          scholarName: `${scholar.firstName} ${scholar.lastName}`,
          registrationNumber: scholar.registrationNumber,
          venue: meetingVenue,
          meetingDate,
          startTime: meetingStartTime,
          endTime: meetingEndTime,
        },
      };

      if (selectedMeetingRequest && (selectedMeetingRequest.status === 'DRAFT' || selectedMeetingRequest.status === 'REJECTED')) {
        const updated = await guideService.updateRequest(selectedMeetingRequest.id, payload);
        handleRequestCreated(updated);
        requestId = updated.id;
      } else {
        const created = await guideService.createRequest(payload);
        handleRequestCreated(created);
        requestId = created.id;
      }

      if (requestId) {
        const submitted = await guideService.submitRequest(requestId);
        handleRequestCreated(submitted);
      }

      toast.success(`${getRequestTypeLabel(meetingRequestType)} submitted`);
      setMeetingVenue('');
      setMeetingDate('');
      setMeetingStartTime('');
      setMeetingEndTime('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit meeting requisition');
    } finally {
      setMeetingSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scholarData, requestData] = await Promise.all([
          guideService.getScholarDetail(Number(scholarId)),
          guideService.getRequests(0, 100),
        ]);
        setScholar(scholarData);
        // Filter requests for this scholar
        const scholarRequests = requestData.content.filter(
          (r) => r.scholarRegistrationNumber === scholarData.registrationNumber
        );
        setRequests(scholarRequests);
        // Fetch scholar documents
        try {
          const docs = await guideService.getScholarDocuments(Number(scholarId));
          setScholarDocs(docs);
        } catch { /* ignore */ }
      } catch {
        toast.error('Failed to load scholar details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scholarId]);

  const handleRequestCreated = (req: RequestItem) => {
    setRequests((prev) => {
      const existing = prev.findIndex((r) => r.id === req.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = req;
        return updated;
      }
      return [...prev, req];
    });
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!scholar) return <div className="text-center py-10">Scholar not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/guide/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-800">
            {scholar.firstName} {scholar.lastName}
          </h1>
          <p className="text-sm text-gray-500">
            {scholar.registrationNumber} • {scholar.departmentName}
          </p>
        </div>
      </div>

      {/* Scholar Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Scholar Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Registration No:</span> <span className="font-medium">{scholar.registrationNumber}</span></div>
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{scholar.firstName} {scholar.lastName}</span></div>
          <div><span className="text-gray-500">School:</span> <span className="font-medium">{scholar.schoolName}</span></div>
          <div><span className="text-gray-500">Department:</span> <span className="font-medium">{scholar.departmentName}</span></div>
          <div><span className="text-gray-500">Batch:</span> <span className="font-medium">{scholar.batch || '-'}</span></div>
          <div><span className="text-gray-500">Current Stage:</span> <StatusBadge status={scholar.currentWorkflowStage} /></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{scholar.email || '-'}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{scholar.phone || '-'}</span></div>
          <div className="md:col-span-3"><span className="text-gray-500">Research Title:</span> <span className="font-medium">{scholar.researchTitle || '-'}</span></div>
        </div>
      </div>

      {/* Message Scholar */}
      {scholar.userId && (
        <ChatWindow
          otherUserId={scholar.userId}
          otherUserName={`${scholar.firstName} ${scholar.lastName}`}
        />
      )}

      {/* Workflow Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">PhD Progress</h2>
        <WorkflowProgress stages={scholar.workflowProgress} />
      </div>

      {/* Scholar Uploaded Documents */}
      {scholarDocs.length > 0 && (() => {
        const allowedCategories = ['ONLINE_CERTIFICATE', 'COURSE_REGISTRATION_CONFIRMATION', 'MARK_SHEET', 'HALF_YEARLY_REPORT', 'AFFIDAVIT_PARENT', 'AFFIDAVIT_SCHOLAR'];
        const filteredDocs = scholarDocs.filter(doc => allowedCategories.includes(doc.documentCategory));
        if (filteredDocs.length === 0) return null;
        return (
        <div className="bg-white rounded-lg shadow p-6">
          <button
            type="button"
            onClick={() => setScholarDocsExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold">Scholar Uploaded Documents</h2>
            {scholarDocsExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
          </button>
          {scholarDocsExpanded && (
            <div className="space-y-2 mt-4">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{doc.originalFileName}</p>
                      <p className="text-xs text-gray-400">{doc.documentCategory.replace(/_/g, ' ')} • {formatDate(doc.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a href={`/api/v1/documents/${doc.id}/view`} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View">
                      <Eye className="w-4 h-4" />
                    </a>
                    <a href={`/api/v1/documents/${doc.id}/download`} download className="p-1 text-green-600 hover:bg-green-50 rounded" title="Download">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <button
          onClick={() => setMeetingExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-lg font-semibold">Meeting Requisition</h2>
          {meetingExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
        </button>
        {meetingExpanded && (
          <>
        <p className="text-sm text-gray-500 mt-3 mb-4">Raise a common requisition for any phase meeting using one shared form.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Type</label>
            <select
              value={meetingRequestType}
              onChange={(e) => setMeetingRequestType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none"
            >
              {COMMON_MEETING_REQUEST_TYPES.map((requestType) => (
                <option
                  key={requestType}
                  value={requestType}
                  disabled={requests.some((r) => r.requestType === requestType && r.status === 'APPROVED')}
                >
                  {formatMeetingTypeLabel(requestType)}{requests.some((r) => r.requestType === requestType && r.status === 'APPROVED') ? ' (Approved)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
            <input
              type="text"
              value={meetingVenue}
              onChange={(e) => setMeetingVenue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Date</label>
            <DateInput
              value={meetingDate}
              onChange={setMeetingDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
            <TimeInput
              value={meetingStartTime}
              onChange={setMeetingStartTime}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
            <TimeInput
              value={meetingEndTime}
              onChange={setMeetingEndTime}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Existing status: <span className="font-medium">{selectedMeetingRequest?.status || 'Not raised'}</span>
          </p>
          <div className="flex items-center gap-2">
            {selectedMeetingRequest?.status === 'REJECTED' && (
              <button
                onClick={handleEditResubmitMeetingRequest}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Edit / Resubmit
              </button>
            )}
            <button
              onClick={handleSubmitCommonMeetingRequest}
              disabled={meetingSubmitting || isSelectedApproved}
              className="px-4 py-2 bg-dsu-maroon text-white rounded-lg text-sm hover:bg-dsu-maroon-hover disabled:opacity-50"
            >
              {meetingSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
        {meetingRequests.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setMeetingRequestsExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between text-left mb-3"
            >
              <h3 className="text-sm font-semibold text-gray-700">Requests</h3>
              {meetingRequestsExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>
            {meetingRequestsExpanded && (
              <div className="space-y-2">
                {meetingRequests.map((request) => (
                  <div key={request.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">{getRequestTypeLabel(request.requestType)}</p>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Venue: {(request.formData?.venue as string) || '-'} | Date: {(request.formData?.meetingDate as string) || '-'} | Start: {(request.formData?.startTime as string) || '-'} | End: {(request.formData?.endTime as string) || '-'}
                    </p>
                    {request.status === 'PENDING_APPROVAL' && (
                      <p className="text-xs text-amber-700 mt-1">
                        Pending at: {request.currentApproverRole ? request.currentApproverRole.replace(/_/g, ' ') : 'Pending approver not assigned'}
                      </p>
                    )}
                    {request.approvals && request.approvals.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600">Approval Trail</p>
                        <div className="mt-1 space-y-1">
                          {request.approvals.map((approval) => (
                            <p key={approval.id} className="text-xs text-gray-600">
                              {approval.approverRole?.replace(/_/g, ' ')}: {approval.status?.replace(/_/g, ' ')}
                              {approval.status === 'APPROVED' && approval.approverName ? ` by ${approval.approverName}` : ''}
                              {approval.actedAt ? ` on ${formatDate(approval.actedAt)}` : ''}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Phase Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="flex flex-wrap gap-1">
          {PHASE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-dsu-maroon text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase Content */}
      {activeTab === 'nomination-expert-members' && (
        <FirstDacMeetingSection
          scholar={scholar}
          existingRequests={requests}
          onRequestCreated={handleRequestCreated}
          mode="nomination-only"
        />
      )}
      {activeTab === 'first-dac' && (
        <FirstDacMeetingSection
          scholar={scholar}
          existingRequests={requests}
          onRequestCreated={handleRequestCreated}
          mode="first-dac-without-nomination"
        />
      )}
      {activeTab === 'comprehensive-viva' && (
        <ComprehensiveVivaSection
          scholar={scholar}
          existingRequests={requests}
          onRequestCreated={handleRequestCreated}
          hideMeetingRequestCard={true}
        />
      )}
      {activeTab === 'colloquium' && (
        <ColloquiumSection
          scholar={scholar}
          existingRequests={requests}
          onRequestCreated={handleRequestCreated}
          hideMeetingRequestCard={true}
        />
      )}
      {activeTab === 'inch-committee' && (
        <InchCommitteeSection
          scholar={scholar}
          existingRequests={requests}
          onRequestCreated={handleRequestCreated}
          hideMeetingRequestCard={true}
        />
      )}
      {activeTab === 'synopsis' && (
        <SynopsisSection
          scholar={scholar}
          existingRequests={requests}
          onRequestCreated={handleRequestCreated}
          hideMeetingRequestCard={true}
        />
      )}
      {activeTab === 'thesis-defense' && (
        <ThesisDefenseSection
          scholar={scholar}
          existingRequests={requests}
          onRequestCreated={handleRequestCreated}
          hideMeetingRequestCard={true}
        />
      )}
    </div>
  );
};

export default GuideScholarDetail;
