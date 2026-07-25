import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { guideService } from '../../services/dataService';
import { Scholar } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import { Users, UserCheck, Clock, Award, Eye, TrendingUp, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../hooks/useAppStore';
import { WORKFLOW_STAGE_LABELS, WORKFLOW_STAGES } from '../../constants';

const GuideDashboard = () => {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fullName } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        const data = await guideService.getScholars();
        setScholars(data);
      } catch {
        toast.error('Failed to load scholars');
      } finally {
        setLoading(false);
      }
    };
    fetchScholars();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dsu-maroon"></div></div>;

  const activeTab = searchParams.get('tab');
  // Calculate metrics
  const totalScholars = scholars.length;
  const pendingActions = scholars.filter(s => s.currentWorkflowStage !== 'THESIS_DEFENSE').length;
  const completedScholars = scholars.filter(s => s.currentWorkflowStage === 'THESIS_DEFENSE').length;

  // Scholars tab
  if (activeTab === 'scholars') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold text-gray-800">My Supervised Scholars</h1>
            <span className="text-xs bg-dsu-maroon/10 text-dsu-maroon px-3 py-1 rounded-full font-medium">
              {totalScholars} Total
            </span>
          </div>
        </div>
        {scholars.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">No scholars assigned yet</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-dsu-maroon text-white">
                    <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">Scholar</th>
                    <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">Research Topic</th>
                    <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">Milestone</th>
                    <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">Progress</th>
                    <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scholars.map((scholar) => {
                    const completedCount = scholar.workflowProgress?.filter(s => s.status === 'COMPLETED').length || 0;
                    const progressPct = Math.round((completedCount / 8) * 100);
                    return (
                      <tr key={scholar.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">{scholar.firstName} {scholar.lastName}</p>
                            <p className="text-xs text-gray-500">{scholar.registrationNumber}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-gray-600">{scholar.researchTitle || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-dsu-maroon/10 text-dsu-maroon rounded">
                            {WORKFLOW_STAGE_LABELS[scholar.currentWorkflowStage] || scholar.currentWorkflowStage}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[80px]">
                              <div className="h-2 bg-dsu-maroon rounded-full" style={{ width: `${progressPct}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-600">{progressPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={scholar.currentWorkflowStage === 'THESIS_DEFENSE' ? 'COMPLETED' : 'ACTIVE'} /></td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => navigate(`/guide/scholars/${scholar.id}`)}
                            className="inline-flex items-center gap-1 text-dsu-maroon hover:text-dsu-maroon-light text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: Dashboard view
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="font-heading text-2xl font-bold text-gray-800">
          Welcome, <span className="text-dsu-maroon">{fullName || 'Guide'}</span>
        </h1>
        <p className="text-gray-500 mt-1">Research Guide Portfolio — {totalScholars} scholar{totalScholars !== 1 ? 's' : ''} under supervision</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dsu-maroon/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-dsu-maroon" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalScholars}</p>
              <p className="text-xs text-gray-500">Total Scholars</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{pendingActions}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completedScholars}</p>
              <p className="text-xs text-gray-500">PhD Awarded</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{scholars.filter(s => s.currentWorkflowStage === 'ADMISSION' || s.currentWorkflowStage === 'NOMINATION_OF_EXPERT_MEMBERS').length}</p>
              <p className="text-xs text-gray-500">Early Stage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scholar Progress + Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Scholars */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-dsu-maroon" />
              My Scholars
            </h2>
            <button
              onClick={() => navigate('/guide/dashboard?tab=scholars')}
              className="text-xs text-dsu-maroon hover:underline font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {scholars.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No scholars assigned yet</p>
            ) : (
              scholars.map((scholar) => {
                const completedCount = scholar.workflowProgress?.filter(s => s.status === 'COMPLETED').length || 0;
                const progressPct = Math.round((completedCount / 8) * 100);
                return (
                  <div key={scholar.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 bg-dsu-maroon/10 rounded-full flex items-center justify-center text-dsu-maroon font-bold text-xs shrink-0">
                      {scholar.firstName?.[0]}{scholar.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 truncate">{scholar.firstName} {scholar.lastName}</p>
                        <span className="text-xs text-gray-400 ml-2">{progressPct}%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[120px]">
                          <div className="h-1.5 bg-dsu-maroon rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 truncate">{WORKFLOW_STAGE_LABELS[scholar.currentWorkflowStage] || '-'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/guide/scholars/${scholar.id}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-dsu-maroon"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Stage Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-dsu-maroon" />
            By Stage
          </h2>
          <div className="space-y-3">
            {WORKFLOW_STAGES.map((stage) => {
              const count = scholars.filter(s => s.currentWorkflowStage === stage).length;
              if (count === 0) return null;
              return (
                <div key={stage} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-600 truncate" title={WORKFLOW_STAGE_LABELS[stage]}>{WORKFLOW_STAGE_LABELS[stage]}</span>
                  <span className="text-sm font-bold text-dsu-maroon ml-2">{count}</span>
                </div>
              );
            })}
            {scholars.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GuideDashboard;
