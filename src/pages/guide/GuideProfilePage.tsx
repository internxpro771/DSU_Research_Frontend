import { useEffect, useState } from 'react';
import { useAppSelector } from '../../hooks/useAppStore';
import { guideService } from '../../services/dataService';
import { Scholar, GuideProfileDetails } from '../../types';
import { toast } from 'react-toastify';
import { Users, UserCheck, Award, Briefcase, Phone, Mail, GraduationCap, Building2, BookOpen, CreditCard } from 'lucide-react';

const GuideProfilePage = () => {
  const { role } = useAppSelector((state) => state.auth);
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [profile, setProfile] = useState<GuideProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [scholarData, profileData] = await Promise.all([
          guideService.getScholars(),
          guideService.getProfile(),
        ]);
        setScholars(scholarData);
        setProfile(profileData);
      } catch {
        toast.error('Failed to load guide profile data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeScholars = scholars.filter((item) => item.currentWorkflowStage !== 'THESIS_DEFENSE').length;
  const completedScholars = scholars.filter((item) => item.currentWorkflowStage === 'THESIS_DEFENSE').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="font-heading text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Guide account details and supervision metrics.</p>
      </div>

      {/* Stat Cards with icons and colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-dsu-maroon/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-dsu-maroon" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{scholars.length}</p>
          <p className="text-xs text-gray-500 mt-1">Assigned Scholars</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{activeScholars}</p>
          <p className="text-xs text-gray-500 mt-1">In Progress</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Done</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{completedScholars}</p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Role</span>
          </div>
          <p className="text-sm font-bold text-gray-800 mt-1">{role?.replace(/_/g, ' ') || '-'}</p>
          <p className="text-xs text-gray-500 mt-1">Your Role</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-800 mb-5">Personal Information</h2>
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading profile details...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow icon={<CreditCard className="w-4 h-4 text-dsu-maroon" />} label="Full Name" value={profile ? `${profile.firstName} ${profile.lastName}` : '-'} />
            <InfoRow icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email Address" value={profile?.email || '-'} />
            <InfoRow icon={<Phone className="w-4 h-4 text-green-500" />} label="Phone Number" value={profile?.phone || '-'} />
            <InfoRow icon={<CreditCard className="w-4 h-4 text-amber-500" />} label="Employee ID" value={profile?.empId || '-'} />
            <InfoRow icon={<GraduationCap className="w-4 h-4 text-purple-500" />} label="Designation" value={profile?.designation?.replace(/_/g, ' ') || '-'} />
            <InfoRow icon={<BookOpen className="w-4 h-4 text-indigo-500" />} label="Specialization" value={profile?.specialization || '-'} />
            <InfoRow icon={<Building2 className="w-4 h-4 text-teal-500" />} label="School" value={profile?.schoolName || '-'} />
            <InfoRow icon={<Building2 className="w-4 h-4 text-cyan-500" />} label="Department" value={profile?.departmentName || '-'} />
            <InfoRow icon={<CreditCard className="w-4 h-4 text-gray-400" />} label="Username" value={profile?.username || '-'} />
            <InfoRow icon={<Users className="w-4 h-4 text-dsu-maroon" />} label="Current Scholar Load" value={`${profile?.currentScholarCount ?? 0} scholars`} />
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="font-medium text-gray-800 text-sm mt-0.5">{value}</p>
    </div>
  </div>
);

export default GuideProfilePage;
