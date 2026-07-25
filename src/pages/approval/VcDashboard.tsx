import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { approvalService } from '../../services/dataService';
import { RequestItem, Scholar, GuideInfo } from '../../types';
import RequestApprovalTable from '../../components/common/RequestApprovalTable';
import { useAppSelector } from '../../hooks/useAppStore';
import { toast } from 'react-toastify';
import { FileCheck, Shield, CreditCard, Clock, TrendingUp, AlertCircle, CheckCircle2, GraduationCap, Award } from 'lucide-react';
import DateInput from '../../components/common/DateInput';
import { getRequestTypeLabel, WORKFLOW_STAGE_LABELS, WORKFLOW_STAGES } from '../../constants';

interface UserRow {
  id: number;
  firstName: string;
  lastName: string;
  empId?: string;
  email?: string;
  phone?: string;
  username: string;
  schoolName: string;
  departmentName?: string;
  isActive: boolean;
}

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
    {options.map((option) => <option key={option} value={option}>{option.includes('_') ? getRequestTypeLabel(option) : option}</option>)}
  </select>
);

const VcDashboard = () => {
  const { role } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [guides, setGuides] = useState<GuideInfo[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [schoolDeans, setSchoolDeans] = useState<UserRow[]>([]);
  const [deanResearch, setDeanResearch] = useState<UserRow[]>([]);
  const [, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; email?: string; phone?: string; username: string; empId?: string; role: string } | null>(null);

  const [scholarName, setScholarName] = useState('');
  const [scholarRegNo, setScholarRegNo] = useState('');
  const [scholarSchool, setScholarSchool] = useState('');
  const [scholarDepartment, setScholarDepartment] = useState('');
  const [scholarGuide, setScholarGuide] = useState('');
  const [scholarStage, setScholarStage] = useState('');
  const [scholarBatch, setScholarBatch] = useState('');

  const [guideName, setGuideName] = useState('');
  const [guideDesignation, setGuideDesignation] = useState('');
  const [guideSchool, setGuideSchool] = useState('');
  const [guideDepartment, setGuideDepartment] = useState('');

  const [schoolDeanName, setSchoolDeanName] = useState('');
  const [schoolDeanSchool, setSchoolDeanSchool] = useState('');

  const [requestType, setRequestType] = useState('');
  const [requestRaisedBy, setRequestRaisedBy] = useState('');
  const [requestSchool, setRequestSchool] = useState('');
  const [requestDepartment, setRequestDepartment] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [requestDate, setRequestDate] = useState('');

  const validTabs = ['dashboard', 'students', 'guides', 'school-deans', 'dean-research', 'panel-nomination', 'profile'];
  const activeTab = validTabs.includes(searchParams.get('tab') || '') ? (searchParams.get('tab') as string) : 'dashboard';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scholarData, guideData, requestData, schoolDeanData, deanResearchData] = await Promise.all([
        approvalService.getScholars(role!, 0, 50),
        approvalService.getGuides(role!, 0, 50),
        approvalService.getRequests(role!, 0, 50),
        approvalService.getVcSchoolDeans(),
        approvalService.getVcDeanResearch(),
      ]);
      setScholars(scholarData.content);
      setGuides(guideData.content);
      setRequests(requestData.content);
      setSchoolDeans(schoolDeanData);
      setDeanResearch(deanResearchData);
      const profileData = await approvalService.getVcProfile();
      setProfile(profileData);
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

  const uniqueSchools = useMemo(() => [...new Set(scholars.map((s) => s.schoolName).filter(Boolean))], [scholars]);
  const uniqueDepartments = useMemo(() => [...new Set(scholars.map((s) => s.departmentName).filter(Boolean))], [scholars]);
  const uniqueGuideNames = useMemo(() => [...new Set(scholars.map((s) => s.guideName).filter(Boolean))], [scholars]);
  const uniqueStages = useMemo(() => [...new Set(scholars.map((s) => s.currentWorkflowStage).filter(Boolean))], [scholars]);
  const uniqueBatches = useMemo(() => [...new Set(scholars.map((s) => s.batch).filter(Boolean))], [scholars]);
  const uniqueDesignations = useMemo(() => [...new Set(guides.map((g) => g.designation).filter(Boolean))], [guides]);
  const uniqueGuideSchools = useMemo(() => [...new Set(guides.map((g) => g.schoolName).filter(Boolean))], [guides]);
  const uniqueGuideDepartments = useMemo(() => [...new Set(guides.map((g) => g.departmentName).filter(Boolean))], [guides]);
  const uniqueRequestTypes = useMemo(() => [...new Set(requests.map((request) => request.requestType).filter(Boolean))], [requests]);
  const uniqueRaisedBy = useMemo(() => [...new Set(requests.map((request) => request.raisedByName).filter(Boolean))], [requests]);
  const uniqueRequestSchools = useMemo(() => [...new Set(requests.map((request) => request.schoolName || '').filter(Boolean))], [requests]);
  const uniqueRequestDepartments = useMemo(() => [...new Set(requests.map((request) => request.departmentName || '').filter(Boolean))], [requests]);
  const uniqueSchoolDeanSchools = useMemo(() => [...new Set(schoolDeans.map((dean) => dean.schoolName).filter(Boolean))], [schoolDeans]);

  const filteredScholars = scholars.filter((scholar) => {
    const fullName = `${scholar.firstName} ${scholar.lastName}`.toLowerCase();
    return (
      (!scholarName || fullName.includes(scholarName.toLowerCase())) &&
      (!scholarRegNo || scholar.registrationNumber.toLowerCase().includes(scholarRegNo.toLowerCase())) &&
      (!scholarSchool || scholar.schoolName === scholarSchool) &&
      (!scholarDepartment || scholar.departmentName === scholarDepartment) &&
      (!scholarGuide || (scholar.guideName || '') === scholarGuide) &&
      (!scholarStage || (scholar.currentWorkflowStage || '') === scholarStage) &&
      (!scholarBatch || (scholar.batch || '') === scholarBatch)
    );
  });

  const filteredGuides = guides.filter((guide) => {
    const fullName = `${guide.firstName} ${guide.lastName}`.toLowerCase();
    return (
      (!guideName || fullName.includes(guideName.toLowerCase())) &&
      (!guideDesignation || guide.designation === guideDesignation) &&
      (!guideSchool || guide.schoolName === guideSchool) &&
      (!guideDepartment || guide.departmentName === guideDepartment)
    );
  });

  const filteredSchoolDeans = schoolDeans.filter((dean) => {
    const fullName = `${dean.firstName} ${dean.lastName}`.toLowerCase();
    return (!schoolDeanName || fullName.includes(schoolDeanName.toLowerCase())) && (!schoolDeanSchool || dean.schoolName === schoolDeanSchool);
  });

  const filteredDeanResearch = deanResearch;

  const getRequestsByType = () => {
    const typeMap: Record<string, string> = {
      'panel-nomination': 'DAC_NOMINATION',
    };
    const stageType = typeMap[activeTab];
    return requests.filter((request) => {
      if (stageType && request.requestType !== stageType && request.workflowStage !== stageType) return false;
      if (requestType && request.requestType !== requestType) return false;
      if (requestRaisedBy && request.raisedByName !== requestRaisedBy) return false;
      if (requestSchool && request.schoolName !== requestSchool) return false;
      if (requestDepartment && request.departmentName !== requestDepartment) return false;
      if (requestStatus && request.status !== requestStatus) return false;
      if (requestDate && request.submittedAt) {
        const submittedDate = request.submittedAt.slice(0, 10);
        if (submittedDate !== requestDate) return false;
      }
      return true;
    });
  };

  const isRequestTab = ['panel-nomination'].includes(activeTab);

  const sectionTitle = activeTab === 'dashboard' ? 'Vice Chancellor — Dashboard' :
    activeTab === 'students' ? 'Vice Chancellor — PhD Students' :
    activeTab === 'guides' ? 'Vice Chancellor — Guides' :
    activeTab === 'school-deans' ? 'Vice Chancellor — Dean of School' :
    activeTab === 'dean-research' ? 'Vice Chancellor — Dean of Research' :
    activeTab === 'panel-nomination' ? 'Vice Chancellor — Panel of DAC Members' :
    activeTab === 'profile' ? 'Vice Chancellor — My Profile' : 'Vice Chancellor — Dashboard';

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-gray-800">{sectionTitle}</h1>

      {activeTab === 'dashboard' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{requests.filter((r) => r.status === 'PENDING_APPROVAL').length}</p>
                  <p className="text-xs text-gray-500">Awaiting Approval</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{requests.filter((r) => r.status === 'APPROVED').length}</p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{scholars.filter(s => s.currentWorkflowStage === 'THESIS_DEFENSE').length}</p>
                  <p className="text-xs text-gray-500">Thesis Defense</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline + Pending */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Scholar Pipeline */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-dsu-maroon" />
                  University Scholar Pipeline
                </h2>
                <span className="text-xs text-gray-400">{scholars.length} scholars • {guides.length} guides</span>
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
                Pending Approvals
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
                  <p className="text-xs text-center text-dsu-maroon mt-2 cursor-pointer hover:underline" onClick={() => setSearchParams({ tab: 'panel-nomination' })}>
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
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">School</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...requests].sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '')).slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-medium text-gray-800">{r.scholarName}</td>
                      <td className="py-2.5 px-3 text-gray-600">{getRequestTypeLabel(r.requestType)}</td>
                      <td className="py-2.5 px-3 text-gray-500">{r.schoolName || '-'}</td>
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

      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vice Chancellor Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <CreditCard className="w-4 h-4 text-dsu-maroon mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Name</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile ? `${profile.firstName} ${profile.lastName}` : '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <Shield className="w-4 h-4 text-purple-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Role</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.role || 'Vice Chancellor'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <CreditCard className="w-4 h-4 text-blue-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Email</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.email || '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <CreditCard className="w-4 h-4 text-green-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Contact</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.phone || '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <CreditCard className="w-4 h-4 text-amber-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Emp. ID</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.empId || '-'}</p></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
            <FilterInput placeholder="Scholar Name" value={scholarName} onChange={setScholarName} />
            <FilterInput placeholder="Registration No" value={scholarRegNo} onChange={setScholarRegNo} />
            <FilterSelect placeholder="School" value={scholarSchool} onChange={setScholarSchool} options={uniqueSchools} />
            <FilterSelect placeholder="Department" value={scholarDepartment} onChange={setScholarDepartment} options={uniqueDepartments} />
            <FilterSelect placeholder="Guide" value={scholarGuide} onChange={setScholarGuide} options={uniqueGuideNames} />
            <FilterSelect placeholder="Stage" value={scholarStage} onChange={setScholarStage} options={uniqueStages} />
            <FilterSelect placeholder="Batch" value={scholarBatch} onChange={setScholarBatch} options={uniqueBatches} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Registration No</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">School</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Guide</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Stage</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Batch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredScholars.map((scholar) => (
                    <tr key={scholar.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{scholar.firstName} {scholar.lastName}</td>
                      <td className="px-4 py-3">{scholar.registrationNumber}</td>
                      <td className="px-4 py-3">{scholar.schoolName}</td>
                      <td className="px-4 py-3">{scholar.departmentName}</td>
                      <td className="px-4 py-3">{scholar.guideName || '-'}</td>
                      <td className="px-4 py-3 text-xs">{scholar.currentWorkflowStage?.replace(/_/g, ' ') || '-'}</td>
                      <td className="px-4 py-3">{scholar.batch || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guides' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
            <FilterInput placeholder="Guide Name" value={guideName} onChange={setGuideName} />
            <FilterSelect placeholder="Designation" value={guideDesignation} onChange={setGuideDesignation} options={uniqueDesignations} />
            <FilterSelect placeholder="School" value={guideSchool} onChange={setGuideSchool} options={uniqueGuideSchools} />
            <FilterSelect placeholder="Department" value={guideDepartment} onChange={setGuideDepartment} options={uniqueGuideDepartments} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Employee ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Designation</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">School</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Specialization</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Scholars</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuides.map((guide) => (
                    <tr key={guide.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{guide.firstName} {guide.lastName}</td>
                      <td className="px-4 py-3">{guide.empId || '-'}</td>
                      <td className="px-4 py-3">{guide.designation}</td>
                      <td className="px-4 py-3">{guide.schoolName}</td>
                      <td className="px-4 py-3">{guide.departmentName}</td>
                      <td className="px-4 py-3">{guide.specialization || '-'}</td>
                      <td className="px-4 py-3">{guide.currentScholarCount}/{guide.maxScholars}</td>
                      <td className="px-4 py-3"><span className={guide.isAvailable ? 'text-green-600 font-medium' : 'text-gray-500'}>{guide.isAvailable ? 'Yes' : 'No'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'school-deans' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
            <FilterInput placeholder="Dean Name" value={schoolDeanName} onChange={setSchoolDeanName} />
            <FilterSelect placeholder="School" value={schoolDeanSchool} onChange={setSchoolDeanSchool} options={uniqueSchoolDeanSchools} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Employee ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">School</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSchoolDeans.map((dean) => (
                    <tr key={dean.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{dean.firstName} {dean.lastName}</td>
                      <td className="px-4 py-3">{dean.empId || dean.username}</td>
                      <td className="px-4 py-3">{dean.username}</td>
                      <td className="px-4 py-3">{dean.email || '-'}</td>
                      <td className="px-4 py-3">{dean.phone || '-'}</td>
                      <td className="px-4 py-3">{dean.schoolName}</td>
                      <td className="px-4 py-3"><span className={dean.isActive ? 'text-green-600 font-medium' : 'text-gray-500'}>{dean.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dean-research' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Employee ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">School</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeanResearch.map((dean) => (
                    <tr key={dean.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{dean.firstName} {dean.lastName}</td>
                      <td className="px-4 py-3">{dean.empId || dean.username}</td>
                      <td className="px-4 py-3">{dean.username}</td>
                      <td className="px-4 py-3">{dean.email || '-'}</td>
                      <td className="px-4 py-3">{dean.phone || '-'}</td>
                      <td className="px-4 py-3">{dean.schoolName}</td>
                      <td className="px-4 py-3">{dean.departmentName || '-'}</td>
                      <td className="px-4 py-3"><span className={dean.isActive ? 'text-green-600 font-medium' : 'text-gray-500'}>{dean.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isRequestTab && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
            <FilterSelect placeholder="Type" value={requestType} onChange={setRequestType} options={uniqueRequestTypes} />
            <FilterSelect placeholder="Raised By" value={requestRaisedBy} onChange={setRequestRaisedBy} options={uniqueRaisedBy} />
            <FilterSelect placeholder="School" value={requestSchool} onChange={setRequestSchool} options={uniqueRequestSchools} />
            <FilterSelect placeholder="Department" value={requestDepartment} onChange={setRequestDepartment} options={uniqueRequestDepartments} />
            <FilterSelect placeholder="Status" value={requestStatus} onChange={setRequestStatus} options={[...new Set(requests.map((request) => request.status).filter(Boolean))]} />
            <div className="w-48">
              <DateInput
                value={requestDate}
                onChange={setRequestDate}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-dsu-maroon/30 focus:border-dsu-maroon/30 outline-none h-10 text-gray-700 hover:border-gray-400 transition-colors"
              />
            </div>
          </div>
          <RequestApprovalTable
            requests={getRequestsByType()}
            role={role!}
            onRefresh={fetchData}
            showSchoolColumn
            showDeptColumn
          />
        </div>
      )}
    </div>
  );
};

export default VcDashboard;
