import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { approvalService } from '../../services/dataService';
import { RequestItem, Scholar, GuideInfo, GroupedRequestItem } from '../../types';
import RequestApprovalTable from '../../components/common/RequestApprovalTable';
import GroupedRequestApprovalTable from '../../components/common/GroupedRequestApprovalTable';
import DateInput from '../../components/common/DateInput';
import { useAppSelector } from '../../hooks/useAppStore';
import { toast } from 'react-toastify';
import { UserCheck, FileCheck, Clock, TrendingUp, AlertCircle, CheckCircle2, GraduationCap } from 'lucide-react';
import { getRequestTypeLabel, WORKFLOW_STAGE_LABELS, WORKFLOW_STAGES } from '../../constants';

const MEETING_REQUEST_TYPES = [
  'INITIAL_DAC_REQUEST',
  'COMPREHENSIVE_VIVA_REQUEST',
  'COLLOQUIUM_REQUEST',
  'INCH_COMMITTEE_REQUEST',
  'SYNOPSIS_REQUEST',
  'THESIS_DEFENSE_REQUEST',
];

// Types already covered by the grouped table or meeting-requests tab for each phase
const GROUPED_TAB_EXCLUDED_TYPES: Record<string, string[]> = {
  'first-dac': ['FIRST_DAC_MINUTES', 'COURSE_WORK', 'SELF_STUDY_COURSE', 'INITIAL_DAC_REQUEST'],
  'comprehensive-viva': ['CV_MINUTES', 'CV_SYLLABUS', 'COMPREHENSIVE_VIVA_REQUEST'],
  colloquium: ['COLLOQUIUM_MINUTES', 'COLLOQUIUM_ATTENDANCE', 'COLLOQUIUM_REQUEST'],
};

const PHASE_TAB_STAGE_MAP: Record<string, string> = {
  'first-dac': 'FIRST_DAC_MEETING',
  'comprehensive-viva': 'COMPREHENSIVE_VIVA',
  colloquium: 'COLLOQUIUM',
  'inch-committee': 'INCH_COMMITTEE',
  synopsis: 'SYNOPSIS',
  'thesis-defense': 'THESIS_DEFENSE',
};

const REQUEST_TYPE_TAB_MAP: Record<string, string> = {
  'nomination-expert-members': 'DAC_NOMINATION',
};

const FilterInput = ({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-dsu-maroon/30 focus:border-dsu-maroon/30 outline-none w-48 h-10 text-gray-700 hover:border-gray-400 transition-colors"
  />
);

const FilterSelect = ({ placeholder, value, onChange, options }: { placeholder: string; value: string; onChange: (v: string) => void; options: string[] }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-dsu-maroon/30 focus:border-dsu-maroon/30 outline-none min-w-[150px] h-10 text-gray-700 cursor-pointer hover:border-gray-400 transition-colors"
  >
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o.includes('_') ? getRequestTypeLabel(o) : o}</option>)}
  </select>
);

const DeanSchoolDashboard = () => {
  const { role, fullName } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [guides, setGuides] = useState<GuideInfo[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [groupedRequests, setGroupedRequests] = useState<GroupedRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState('');

  // Student filters
  const [filterScholarName, setFilterScholarName] = useState('');
  const [filterRegNo, setFilterRegNo] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterGuide, setFilterGuide] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterBatch, setFilterBatch] = useState('');

  // Guide filters
  const [filterGuideName, setFilterGuideName] = useState('');
  const [filterGuideDesig, setFilterGuideDesig] = useState('');
  const [filterGuideDept, setFilterGuideDept] = useState('');

  // Request filters
  const [filterReqType, setFilterReqType] = useState('');
  const [filterReqRaisedBy, setFilterReqRaisedBy] = useState('');
  const [filterReqDept, setFilterReqDept] = useState('');
  const [filterReqStatus] = useState('');
  const [filterReqDate, setFilterReqDate] = useState('');

  // Grouped request filters (First DAC, Comprehensive Viva, Colloquium)
  const [filterGroupedScholar, setFilterGroupedScholar] = useState('');
  const [filterGroupedRaisedBy, setFilterGroupedRaisedBy] = useState('');
  const [filterGroupedDept, setFilterGroupedDept] = useState('');
  const [filterGroupedStatus, setFilterGroupedStatus] = useState('');
  const [filterGroupedDate, setFilterGroupedDate] = useState('');

  const validTabs = ['dashboard', 'students', 'guides', 'nomination-expert-members', 'first-dac', 'comprehensive-viva', 'colloquium', 'inch-committee', 'synopsis', 'thesis-defense', 'meeting-requests'];
  const rawTab = searchParams.get('tab') || 'dashboard';
  const activeTab = validTabs.includes(rawTab) ? rawTab : 'dashboard';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scholarData, guideData, requestData, groupedData] = await Promise.all([
        approvalService.getScholars(role!, 0, 100),
        approvalService.getGuides(role!, 0, 100),
        approvalService.getRequests(role!, 0, 200),
        approvalService.getGroupedRequests(role!),
      ]);
      setScholars(scholarData.content);
      setGuides(guideData.content);
      setRequests(requestData.content);
      setGroupedRequests(groupedData);
      if (scholarData.content.length > 0 && scholarData.content[0].schoolName) {
        setSchoolName(scholarData.content[0].schoolName);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'dashboard' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (role) fetchData();
  }, [role]);

  const departments = [...new Set(scholars.map(s => s.departmentName).filter((v): v is string => Boolean(v)))];
  const guideNames = [...new Set(scholars.map(s => s.guideName).filter((v): v is string => Boolean(v)))];
  const stages = [...new Set(scholars.map(s => s.currentWorkflowStage).filter((v): v is string => Boolean(v)))];
  const batches = [...new Set(scholars.map(s => s.batch).filter((v): v is string => Boolean(v)))];
  const designations = [...new Set(guides.map(g => g.designation).filter((v): v is string => Boolean(v)))];
  const guideDepts = [...new Set(guides.map(g => g.departmentName).filter((v): v is string => Boolean(v)))];
  const raisedByNames = [...new Set(requests.map(r => r.raisedByName).filter((v): v is string => Boolean(v)))];
  const reqDepts = [...new Set(requests.map(r => r.departmentName).filter((v): v is string => Boolean(v)))];
  const stageForTab = PHASE_TAB_STAGE_MAP[activeTab];
  const requestTypeForTab = REQUEST_TYPE_TAB_MAP[activeTab];
  const requestPool = requests.filter((r) => {
    if (activeTab === 'meeting-requests') return MEETING_REQUEST_TYPES.includes(r.requestType);
    if (requestTypeForTab) return r.requestType === requestTypeForTab;
    if (stageForTab) return r.workflowStage === stageForTab;
    return false;
  });
  const reqTypes = [...new Set(requestPool.map(r => r.requestType).filter((v): v is string => Boolean(v)))];

  const filteredScholars = scholars.filter(s => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return (
      (!filterScholarName || name.includes(filterScholarName.toLowerCase())) &&
      (!filterRegNo || (s.registrationNumber || '').toLowerCase().includes(filterRegNo.toLowerCase())) &&
      (!filterDept || s.departmentName === filterDept) &&
      (!filterGuide || s.guideName === filterGuide) &&
      (!filterStage || s.currentWorkflowStage === filterStage) &&
      (!filterBatch || s.batch === filterBatch)
    );
  });

  const filteredGuides = guides.filter(g => {
    const name = `${g.firstName} ${g.lastName}`.toLowerCase();
    return (
      (!filterGuideName || name.includes(filterGuideName.toLowerCase())) &&
      (!filterGuideDesig || g.designation === filterGuideDesig) &&
      (!filterGuideDept || g.departmentName === filterGuideDept)
    );
  });

  const getFilteredRequests = () => {
    return requests.filter(r => {
      if (activeTab === 'meeting-requests' && !MEETING_REQUEST_TYPES.includes(r.requestType)) return false;
      if (requestTypeForTab && r.requestType !== requestTypeForTab) return false;
      if (stageForTab && r.workflowStage !== stageForTab) return false;
      if (filterReqType && r.requestType !== filterReqType) return false;
      if (filterReqRaisedBy && r.raisedByName !== filterReqRaisedBy) return false;
      if (filterReqDept && r.departmentName !== filterReqDept) return false;
      if (filterReqStatus && r.status !== filterReqStatus) return false;
      if (filterReqDate && r.submittedAt) {
        const submittedDate = r.submittedAt.slice(0, 10);
        if (submittedDate !== filterReqDate) return false;
      }
      return true;
    });
  };

  const isRequestTab = activeTab === 'meeting-requests' || Boolean(stageForTab) || Boolean(requestTypeForTab);

  return (
    <div className="space-y-6">

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Welcome Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="font-heading text-2xl font-bold text-gray-800">
              Welcome, <span className="text-dsu-maroon">{fullName || 'Dean'}</span>
            </h1>
            <p className="text-gray-500 mt-1">
              {schoolName ? <span className="font-medium">{schoolName}</span> : 'School Dashboard'} — Here's your school's PhD program overview
            </p>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-dsu-maroon/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-dsu-maroon" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{scholars.length}</p>
                  <p className="text-xs text-gray-500">PhD Scholars</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{requests.filter(r => r.status === 'PENDING_APPROVAL').length}</p>
                  <p className="text-xs text-gray-500">Awaiting Your Action</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'APPROVED').length}</p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{guides.length}</p>
                  <p className="text-xs text-gray-500">Active Guides</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scholar Pipeline & Pending Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Scholar Pipeline */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-dsu-maroon" />
                  Scholar Pipeline
                </h2>
                <span className="text-xs text-gray-400">{scholars.length} total</span>
              </div>
              {/* Segmented overview bar */}
              {scholars.length > 0 && (
                <div className="flex h-3 rounded-full overflow-hidden mb-5 bg-gray-100">
                  {WORKFLOW_STAGES.map((stage, idx) => {
                    const count = scholars.filter(s => s.currentWorkflowStage === stage).length;
                    const percentage = (count / scholars.length) * 100;
                    if (count === 0) return null;
                    const colors = ['bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-yellow-400', 'bg-lime-500', 'bg-emerald-500', 'bg-teal-500', 'bg-dsu-maroon'];
                    return <div key={stage} className={`${colors[idx]} transition-all duration-500`} style={{ width: `${percentage}%` }} title={`${WORKFLOW_STAGE_LABELS[stage]}: ${count}`} />;
                  })}
                </div>
              )}
              {/* Stage cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WORKFLOW_STAGES.map((stage, idx) => {
                  const count = scholars.filter(s => s.currentWorkflowStage === stage).length;
                  const colors = ['border-rose-200 bg-rose-50', 'border-orange-200 bg-orange-50', 'border-amber-200 bg-amber-50', 'border-yellow-200 bg-yellow-50', 'border-lime-200 bg-lime-50', 'border-emerald-200 bg-emerald-50', 'border-teal-200 bg-teal-50', 'border-dsu-maroon/20 bg-dsu-maroon/5'];
                  const textColors = ['text-rose-700', 'text-orange-700', 'text-amber-700', 'text-yellow-700', 'text-lime-700', 'text-emerald-700', 'text-teal-700', 'text-dsu-maroon'];
                  return (
                    <div key={stage} className={`p-3 rounded-lg border ${colors[idx]} transition-all`}>
                      <p className={`text-xl font-bold ${textColors[idx]}`}>{count}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-tight">{WORKFLOW_STAGE_LABELS[stage]}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Pending Actions
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {requests.filter(r => r.status === 'PENDING_APPROVAL').slice(0, 8).map((r) => (
                  <div key={r.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.scholarName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getRequestTypeLabel(r.requestType)}</p>
                  </div>
                ))}
                {requests.filter(r => r.status === 'PENDING_APPROVAL').length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-300" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                )}
                {requests.filter(r => r.status === 'PENDING_APPROVAL').length > 8 && (
                  <p className="text-xs text-center text-dsu-maroon mt-2 cursor-pointer hover:underline" onClick={() => setSearchParams({ tab: 'meeting-requests' })}>
                    +{requests.filter(r => r.status === 'PENDING_APPROVAL').length - 8} more
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FileCheck className="w-4 h-4 text-green-600" />
              Recent Activity
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Scholar</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Request</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...requests].sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '')).slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-medium text-gray-800">{r.scholarName}</td>
                      <td className="py-2.5 px-3 text-gray-600">{getRequestTypeLabel(r.requestType)}</td>
                      <td className="py-2.5 px-3 text-gray-500">{r.departmentName || '-'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          r.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                          r.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {r.status === 'PENDING_APPROVAL' ? 'Pending' : r.status === 'APPROVED' ? 'Approved' : r.status === 'REJECTED' ? 'Rejected' : r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400 text-xs">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-gray-400">No recent activity</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PhD Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <FilterInput placeholder="Scholar Name" value={filterScholarName} onChange={setFilterScholarName} />
            <FilterInput placeholder="Registration No" value={filterRegNo} onChange={setFilterRegNo} />
            <FilterSelect placeholder="All Departments" value={filterDept} onChange={setFilterDept} options={departments} />
            <FilterSelect placeholder="All Guides" value={filterGuide} onChange={setFilterGuide} options={guideNames} />
            <FilterSelect placeholder="All Stages" value={filterStage} onChange={setFilterStage} options={stages} />
            <FilterSelect placeholder="All Batches" value={filterBatch} onChange={setFilterBatch} options={batches} />
          </div>
          {loading ? <div className="text-center py-10">Loading...</div> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Registration No</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Guide</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Stage</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredScholars.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="px-4 py-3">{s.registrationNumber}</td>
                        <td className="px-4 py-3">{s.departmentName}</td>
                        <td className="px-4 py-3">{s.guideName || '-'}</td>
                        <td className="px-4 py-3 text-xs">{s.currentWorkflowStage?.replace(/_/g, ' ') || '-'}</td>
                        <td className="px-4 py-3">{s.batch || '-'}</td>
                      </tr>
                    ))}
                    {filteredScholars.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No scholars found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <FilterInput placeholder="Guide Name" value={filterGuideName} onChange={setFilterGuideName} />
            <FilterSelect placeholder="All Designations" value={filterGuideDesig} onChange={setFilterGuideDesig} options={designations} />
            <FilterSelect placeholder="All Departments" value={filterGuideDept} onChange={setFilterGuideDept} options={guideDepts} />
          </div>
          {loading ? <div className="text-center py-10">Loading...</div> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Employee ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Designation</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Specialization</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Scholars</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredGuides.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium">{g.firstName} {g.lastName}</td>
                        <td className="px-4 py-3">{g.empId || '-'}</td>
                        <td className="px-4 py-3">{g.designation}</td>
                        <td className="px-4 py-3">{g.specialization}</td>
                        <td className="px-4 py-3">{g.departmentName}</td>
                        <td className="px-4 py-3">{g.currentScholarCount}/{g.maxScholars}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${g.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {g.isAvailable ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredGuides.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No guides found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Request Tabs */}
      {isRequestTab && (
        <div className="space-y-4">
          {/* Grouped request tabs (First DAC, Comprehensive Viva, Colloquium) */}
          {(activeTab === 'first-dac' || activeTab === 'comprehensive-viva' || activeTab === 'colloquium') && (
            <>
              {(() => {
                const filtered = groupedRequests.filter(r => {
                  if (activeTab === 'first-dac') return r.requestType === 'FIRST_DAC_MINUTES';
                  if (activeTab === 'comprehensive-viva') return r.requestType === 'CV_MINUTES';
                  if (activeTab === 'colloquium') return r.requestType === 'COLLOQUIUM_MINUTES';
                  return true;
                });
                const excluded = GROUPED_TAB_EXCLUDED_TYPES[activeTab] || [];
                const standaloneAsGrouped = requests
                  .filter(r => r.workflowStage === stageForTab && !excluded.includes(r.requestType))
                  .map((r): GroupedRequestItem => ({
                    minutesRequestId: r.id,
                    requestType: r.requestType,
                    displayTitle: getRequestTypeLabel(r.requestType),
                    status: r.status,
                    currentApproverRole: r.currentApproverRole,
                    workflowStage: r.workflowStage,
                    scholarName: r.scholarName,
                    scholarRegistrationNumber: r.scholarRegistrationNumber,
                    raisedByName: r.raisedByName,
                    departmentName: r.departmentName,
                    schoolName: r.schoolName,
                    submittedAt: r.submittedAt,
                    remarks: r.remarks,
                    subRequests: [],
                    allDocuments: r.documents,
                    approvals: r.approvals,
                    formData: r.formData,
                  }));
                const allGrouped = [...filtered, ...standaloneAsGrouped];
                const groupedRaisedByOptions = [...new Set(allGrouped.map(r => r.raisedByName).filter(Boolean))];
                const groupedDeptOptions = [...new Set(allGrouped.map(r => r.departmentName).filter((v): v is string => Boolean(v)))];
                const groupedStatusOptions = [...new Set(allGrouped.map(r => r.status).filter(Boolean))];
                const filteredGrouped = allGrouped.filter(r => {
                  if (filterGroupedScholar && !(r.scholarName || '').toLowerCase().includes(filterGroupedScholar.toLowerCase())) return false;
                  if (filterGroupedRaisedBy && r.raisedByName !== filterGroupedRaisedBy) return false;
                  if (filterGroupedDept && r.departmentName !== filterGroupedDept) return false;
                  if (filterGroupedStatus && r.status !== filterGroupedStatus) return false;
                  if (filterGroupedDate && r.submittedAt) {
                    const submittedDate = r.submittedAt.slice(0, 10);
                    if (submittedDate !== filterGroupedDate) return false;
                  }
                  return true;
                });
                return (
                  <>
                    <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <FilterInput placeholder="Scholar Name" value={filterGroupedScholar} onChange={setFilterGroupedScholar} />
                      <FilterSelect placeholder="Raised By" value={filterGroupedRaisedBy} onChange={setFilterGroupedRaisedBy} options={groupedRaisedByOptions} />
                      <FilterSelect placeholder="All Departments" value={filterGroupedDept} onChange={setFilterGroupedDept} options={groupedDeptOptions} />
                      <FilterSelect placeholder="All Statuses" value={filterGroupedStatus} onChange={setFilterGroupedStatus} options={groupedStatusOptions} />
                      <div className="w-48">
                        <DateInput
                          value={filterGroupedDate}
                          onChange={setFilterGroupedDate}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-dsu-maroon/30 focus:border-dsu-maroon/30 outline-none h-10 text-gray-700 hover:border-gray-400 transition-colors"
                        />
                      </div>
                    </div>
                    {loading ? <div className="text-center py-10">Loading...</div> : (
                      <GroupedRequestApprovalTable
                        requests={filteredGrouped}
                        role={role!}
                        onRefresh={fetchData}
                        showDeptColumn={true}
                      />
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* Regular request tabs (Other phases + meeting-requests) */}
          {!(activeTab === 'first-dac' || activeTab === 'comprehensive-viva' || activeTab === 'colloquium') && (
            <>
              <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <FilterSelect placeholder="All Types" value={filterReqType} onChange={setFilterReqType} options={reqTypes} />
                <FilterSelect placeholder="Raised By" value={filterReqRaisedBy} onChange={setFilterReqRaisedBy} options={raisedByNames} />
                <FilterSelect placeholder="All Departments" value={filterReqDept} onChange={setFilterReqDept} options={reqDepts} />
                <div className="w-48">
                  <DateInput
                    value={filterReqDate}
                    onChange={setFilterReqDate}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-dsu-maroon/30 focus:border-dsu-maroon/30 outline-none h-10 text-gray-700 hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>
              {loading ? <div className="text-center py-10">Loading...</div> : (
                <RequestApprovalTable
                  requests={getFilteredRequests()}
                  role={role!}
                  onRefresh={fetchData}
                  showDeptColumn={true}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DeanSchoolDashboard;
