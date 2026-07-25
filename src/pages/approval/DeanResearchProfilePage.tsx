import { useEffect, useState } from 'react';
import { useAppSelector } from '../../hooks/useAppStore';
import { approvalService } from '../../services/dataService';
import { DeanProfileDetails } from '../../types';
import { toast } from 'react-toastify';
import { User, Mail, Phone, GraduationCap, CreditCard } from 'lucide-react';

const DeanResearchProfilePage = () => {
  const { role } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<DeanProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await approvalService.getDeanProfile(role!);
        setProfile(data);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (role) load();
  }, [role]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-dsu-maroon rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">
              {profile?.firstName?.charAt(0)?.toUpperCase() || 'D'}
            </span>
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-800">My Profile</h1>
            <p className="text-sm text-gray-500">Dean of Research — Personal Information</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dsu-maroon"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-heading text-lg font-semibold text-gray-800 mb-5">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow icon={<CreditCard className="w-4 h-4 text-dsu-maroon" />} label="Full Name" value={profile ? `${profile.firstName} ${profile.lastName}` : '-'} />
            <InfoRow icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email Address" value={profile?.email || '-'} />
            <InfoRow icon={<Phone className="w-4 h-4 text-green-500" />} label="Phone Number" value={profile?.phone || '-'} />
            <InfoRow icon={<CreditCard className="w-4 h-4 text-gray-400" />} label="Username" value={profile?.username || '-'} />
            <InfoRow icon={<GraduationCap className="w-4 h-4 text-purple-500" />} label="Role" value={profile?.role || 'Dean of Research'} />
            <InfoRow icon={<User className="w-4 h-4 text-amber-500" />} label="Account Status" value="Active" />
          </div>
        </div>
      )}
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

export default DeanResearchProfilePage;
