import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services/dataService';
import { AdminCreateUserRequest, AdminUpdateUserRequest, AdminUserSummary, Scholar } from '../../types';
import { CheckCircle, Archive, Trash2, Users, UserCheck, Shield, GraduationCap, UserPlus, Building2 } from 'lucide-react';
import DateInput from '../../components/common/DateInput';

interface SchoolOption {
  id: number;
  name: string;
  code: string;
}

interface DepartmentOption {
  id: number;
  name: string;
  code: string;
}

const MANAGEABLE_ROLES = [
  'SCHOLAR',
  'GUIDE',
  'DEAN_OF_SCHOOL',
  'DEAN_OF_RESEARCH',
  'RI_OFFICE',
  'VICE_CHANCELLOR',
  'REGISTRAR',
];

const ROLE_LABELS: Record<string, string> = {
  SCHOLAR: 'PhD Scholar',
  GUIDE: 'Guide',
  DEAN_OF_SCHOOL: 'Dean of School',
  DEAN_OF_RESEARCH: 'Dean of Research',
  RI_OFFICE: 'R&I Office',
  VICE_CHANCELLOR: 'Vice Chancellor',
  REGISTRAR: 'Registrar',
  SUPER_ADMIN: 'Super Admin',
};

const designationOptions = ['PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR'];

const emptyCreateForm: AdminCreateUserRequest = {
  roleName: 'SCHOLAR',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  schoolId: undefined,
  departmentId: undefined,
  designation: '',
  empId: '',
  registrationNumber: '',
  batch: '',
};

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['dashboard', 'users', 'create', 'completed-scholars', 'archived-scholars', 'settings'];
  const activeTab = validTabs.includes(searchParams.get('tab') || '') ? (searchParams.get('tab') as string) : 'dashboard';

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const [createForm, setCreateForm] = useState<AdminCreateUserRequest>(emptyCreateForm);
  const [editUser, setEditUser] = useState<AdminUserSummary | null>(null);
  const [editForm, setEditForm] = useState<AdminUpdateUserRequest>({});

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: AdminUserSummary | null; hardDelete: boolean }>({ open: false, user: null, hardDelete: false });
  const [deleteReason, setDeleteReason] = useState('');

  const [resetModal, setResetModal] = useState<{ open: boolean; user: AdminUserSummary | null }>({ open: false, user: null });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const [completedScholars, setCompletedScholars] = useState<Scholar[]>([]);
  const [archivedScholars, setArchivedScholars] = useState<Scholar[]>([]);
  const [lifecycleModal, setLifecycleModal] = useState<{
    open: boolean;
    type: 'complete' | 'archive' | 'purge';
    scholarId: number;
    scholarName: string;
    registrationNumber: string;
  }>({ open: false, type: 'complete', scholarId: 0, scholarName: '', registrationNumber: '' });

  const loadUsers = async (showErrorToast = false) => {
    try {
      const userData = await adminService.getUsers();
      setUsers(userData);
    } catch {
      if (showErrorToast) {
        toast.error('Failed to load admin data');
      }
    }
  };

  const loadSchools = async (showErrorToast = false) => {
    try {
      const schoolData = await adminService.getSchools();
      setSchools(schoolData);
    } catch {
      if (showErrorToast) {
        toast.error('Failed to load school data');
      }
    }
  };

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'dashboard' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await Promise.all([loadUsers(true), loadSchools(true)]);
      setLoading(false);
      setIsBootstrapped(true);
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }
    if (activeTab === 'users' || activeTab === 'dashboard') {
      loadUsers(true);
    }
    if (activeTab === 'completed-scholars') {
      adminService.getCompletedScholars(0, 50).then(data => setCompletedScholars(data.content)).catch(() => toast.error('Failed to load completed scholars'));
    }
    if (activeTab === 'archived-scholars') {
      adminService.getArchivedScholars(0, 50).then(data => setArchivedScholars(data.content)).catch(() => toast.error('Failed to load archived scholars'));
    }
  }, [activeTab, isBootstrapped]);

  useEffect(() => {
    const schoolId = createForm.schoolId;
    if (!schoolId) {
      setDepartments([]);
      return;
    }
    adminService.getDepartments(schoolId).then(setDepartments).catch(() => setDepartments([]));
  }, [createForm.schoolId]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || user.roleName === roleFilter;
      const matchesStatus = !statusFilter || (statusFilter === 'active' ? user.isActive : !user.isActive);
      const matchesSchool = !schoolFilter || (user.schoolName || '') === schoolFilter;
      const matchesDepartment = !departmentFilter || (user.departmentName || '') === departmentFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesSchool && matchesDepartment;
    });
  }, [users, searchTerm, roleFilter, statusFilter, schoolFilter, departmentFilter]);

  const roleCounts = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach((u) => {
      map[u.roleName] = (map[u.roleName] || 0) + 1;
    });
    return map;
  }, [users]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) return 'Password must contain at least 1 special character';
    return null;
  };

  const refreshUsers = async () => {
    await loadUsers(true);
  };

  const createUser = async () => {
    if (!createForm.username || !createForm.password || !createForm.firstName || !createForm.roleName) {
      toast.error('Username, password, first name, and role are required');
      return;
    }

    if (!createForm.email || !createForm.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (createForm.roleName === 'SCHOLAR' && (!createForm.registrationNumber || !createForm.schoolId || !createForm.departmentId)) {
      toast.error('Scholar requires registration number, school, and department');
      return;
    }

    if (createForm.roleName === 'GUIDE' && (!createForm.empId || !createForm.designation || !createForm.schoolId || !createForm.departmentId)) {
      toast.error('Guide requires emp ID, designation, school, and department');
      return;
    }

    const pwdError = validatePassword(createForm.password);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }

    setSaving(true);
    try {
      await adminService.createUser(createForm);
      toast.success('User created successfully');
      setCreateForm(emptyCreateForm);
      await refreshUsers();
      setSearchParams({ tab: 'users' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (user: AdminUserSummary) => {
    setEditUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminService.updateUser(editUser.id, editForm);
      toast.success('User updated successfully');
      setEditUser(null);
      await refreshUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    if (!deleteReason.trim()) {
      toast.error(`${deleteModal.hardDelete ? 'Delete' : 'Disable'} reason is required`);
      return;
    }

    setSaving(true);
    try {
      if (deleteModal.hardDelete) {
        await adminService.hardDeleteUser(deleteModal.user.id, deleteReason.trim());
        toast.success('User deleted permanently');
      } else if (deleteModal.user.isActive) {
        await adminService.deleteUser(deleteModal.user.id, deleteReason.trim());
        toast.success('User disabled successfully');
      } else {
        await adminService.enableUser(deleteModal.user.id, deleteReason.trim());
        toast.success('User enabled successfully');
      }
      setDeleteModal({ open: false, user: null, hardDelete: false });
      setDeleteReason('');
      await refreshUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || `Failed to ${deleteModal.hardDelete ? 'delete' : deleteModal.user.isActive ? 'disable' : 'enable'} user`);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!resetModal.user) return;
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }

    setSaving(true);
    try {
      await adminService.resetPassword(resetModal.user.username, newPassword);
      toast.success(`Password reset for ${resetModal.user.username}`);
      setResetModal({ open: false, user: null });
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = Object.keys(roleCounts).sort();

  const isScholarRole = createForm.roleName === 'SCHOLAR';
  const isGuideRole = createForm.roleName === 'GUIDE';
  const needsEmpId = ['GUIDE', 'DEAN_OF_SCHOOL', 'DEAN_OF_RESEARCH', 'VICE_CHANCELLOR', 'REGISTRAR'].includes(createForm.roleName);
  const needsSchoolDept = ['SCHOLAR', 'GUIDE', 'DEAN_OF_SCHOOL'].includes(createForm.roleName);

  const headerTitle =
    activeTab === 'users'
      ? 'User Management'
      : activeTab === 'create'
      ? 'Create User'
      : activeTab === 'completed-scholars'
      ? 'Completed Scholars'
      : activeTab === 'archived-scholars'
      ? 'Archived Scholars'
      : activeTab === 'settings'
      ? 'Admin Settings'
      : 'Super Admin Dashboard';

  const headerDescription =
    activeTab === 'users'
      ? 'Search, filter, edit, reset password, and disable user accounts'
      : activeTab === 'create'
      ? 'Create platform users with role-specific metadata'
      : activeTab === 'completed-scholars'
      ? 'Scholars who have completed their PhD degree'
      : activeTab === 'archived-scholars'
      ? 'Archived scholars — data preserved but hidden from active dashboards'
      : activeTab === 'settings'
      ? 'Operational guidance and security policies for account management'
      : 'Role distribution and account status overview across the PhD portal';

  const handleLifecycleAction = async () => {
    try {
      if (lifecycleModal.type === 'complete') {
        await adminService.completeScholar(lifecycleModal.scholarId);
        toast.success('Scholar marked as completed');
        loadUsers(false);
        adminService.getCompletedScholars(0, 50).then(data => setCompletedScholars(data.content)).catch(() => {});
      } else if (lifecycleModal.type === 'archive') {
        await adminService.archiveScholar(lifecycleModal.scholarId);
        toast.success('Scholar archived successfully');
        adminService.getCompletedScholars(0, 50).then(data => setCompletedScholars(data.content)).catch(() => {});
        adminService.getArchivedScholars(0, 50).then(data => setArchivedScholars(data.content)).catch(() => {});
      } else if (lifecycleModal.type === 'purge') {
        await adminService.purgeScholar(lifecycleModal.scholarId);
        toast.success('Scholar data permanently deleted');
        adminService.getArchivedScholars(0, 50).then(data => setArchivedScholars(data.content)).catch(() => {});
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setLifecycleModal({ open: false, type: 'complete', scholarId: 0, scholarName: '', registrationNumber: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dsu-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-800">{headerTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{headerDescription}</p>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dsu-maroon/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-dsu-maroon" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                  <p className="text-xs text-gray-500">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{users.filter(u => !u.isActive).length}</p>
                  <p className="text-xs text-gray-500">Inactive</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{schools.length}</p>
                  <p className="text-xs text-gray-500">Schools</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Distribution + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Role Distribution */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Users by Role</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {roleOptions.map((roleName, idx) => {
                  const count = roleCounts[roleName] || 0;
                  const colors = ['border-dsu-maroon/20 bg-dsu-maroon/5', 'border-blue-200 bg-blue-50', 'border-amber-200 bg-amber-50', 'border-green-200 bg-green-50', 'border-teal-200 bg-teal-50', 'border-orange-200 bg-orange-50', 'border-rose-200 bg-rose-50'];
                  const textColors = ['text-dsu-maroon', 'text-blue-700', 'text-amber-700', 'text-green-700', 'text-teal-700', 'text-orange-700', 'text-rose-700'];
                  return (
                    <div key={roleName} className={`p-3 rounded-lg border ${colors[idx % colors.length]} transition-all`}>
                      <p className={`text-xl font-bold ${textColors[idx % textColors.length]}`}>{count}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-tight">{ROLE_LABELS[roleName] || roleName}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button onClick={() => setSearchParams({ tab: 'create' })} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-dsu-maroon/30 hover:bg-dsu-maroon/5 transition-colors text-left">
                  <UserPlus className="w-5 h-5 text-dsu-maroon" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Create User</p>
                    <p className="text-xs text-gray-500">Add a new user to the system</p>
                  </div>
                </button>
                <button onClick={() => setSearchParams({ tab: 'users' })} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-left">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Manage Users</p>
                    <p className="text-xs text-gray-500">Edit, disable, or reset accounts</p>
                  </div>
                </button>
                <button onClick={() => setSearchParams({ tab: 'completed-scholars' })} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors text-left">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Completed Scholars</p>
                    <p className="text-xs text-gray-500">View scholars who finished PhD</p>
                  </div>
                </button>
                <button onClick={() => setSearchParams({ tab: 'archived-scholars' })} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-colors text-left">
                  <Archive className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Archived Scholars</p>
                    <p className="text-xs text-gray-500">View discontinued scholars</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-700">User Management</h2>
            <p className="text-xs text-gray-500 mt-1">Manage user lifecycle actions from one place: edit details, reset credentials, disable/enable accounts, and hard-delete users.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
              placeholder="Search by username, name, or email..."
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
            >
              <option value="">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role] || role}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
            >
              <option value="">All Schools</option>
              {schools.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
            >
              <option value="">All Departments</option>
              {[...new Set(users.map(u => u.departmentName).filter(Boolean))].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Username</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">School</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Department</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{user.username}</td>
                      <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500">{user.email || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-dsu-maroon/10 text-dsu-maroon px-2 py-0.5 rounded-full">
                          {ROLE_LABELS[user.roleName] || user.roleName}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs">{user.schoolName || '-'}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs">{user.departmentName || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="px-2.5 py-1 text-xs font-medium text-white rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setResetModal({ open: true, user })}
                            className="px-2.5 py-1 text-xs font-medium text-white rounded-lg bg-[#F59E0B] hover:bg-[#D97706]"
                          >
                            Reset
                          </button>
                          {user.roleName !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => setDeleteModal({ open: true, user, hardDelete: false })}
                              className={`px-2.5 py-1 text-xs font-medium text-white rounded-lg ${user.isActive ? 'bg-[#F87171] hover:bg-[#EF4444]' : 'bg-[#16A34A] hover:bg-[#15803D]'}`}
                            >
                              {user.isActive ? 'Disable' : 'Enable'}
                            </button>
                          )}
                          {user.roleName !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => setDeleteModal({ open: true, user, hardDelete: true })}
                              className="px-2.5 py-1 text-xs font-medium text-white rounded-lg bg-[#DC2626] hover:bg-[#B91C1C]"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">No users found</div>
            )}
          </div>
        </>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Add User</h2>
          <p className="text-xs text-gray-500">Create users for Scholar, Guide, Dean of School, Dean of Research, R&I Office, Registrar, and Vice Chancellor.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role *</label>
              <select
                value={createForm.roleName}
                onChange={(e) => setCreateForm((p) => ({ ...p, roleName: e.target.value, schoolId: undefined, departmentId: undefined, designation: '', empId: '', registrationNumber: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {MANAGEABLE_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Username *</label>
              <input
                type="text"
                value={createForm.username}
                onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={createForm.firstName}
                onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={createForm.lastName || ''}
                onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={createForm.email || ''}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={createForm.phone || ''}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Date of Birth</label>
              <DateInput
                value={createForm.dateOfBirth || ''}
                onChange={(value) => setCreateForm((p) => ({ ...p, dateOfBirth: value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {isScholarRole && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Registration Number *</label>
                  <input
                    type="text"
                    value={createForm.registrationNumber || ''}
                    onChange={(e) => setCreateForm((p) => ({ ...p, registrationNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Batch</label>
                  <input
                    type="text"
                    value={createForm.batch || ''}
                    onChange={(e) => setCreateForm((p) => ({ ...p, batch: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </>
            )}

            {needsEmpId && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  value={createForm.empId || ''}
                  onChange={(e) => setCreateForm((p) => ({ ...p, empId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}

            {isGuideRole && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Designation *</label>
                <select
                  value={createForm.designation || ''}
                  onChange={(e) => setCreateForm((p) => ({ ...p, designation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select</option>
                  {designationOptions.map((d) => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            )}

            {needsSchoolDept && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">School {isScholarRole || isGuideRole ? '*' : ''}</label>
                  <select
                    value={createForm.schoolId || ''}
                    onChange={(e) => setCreateForm((p) => ({ ...p, schoolId: Number(e.target.value) || undefined, departmentId: undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select School</option>
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {(isScholarRole || isGuideRole) && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Department *</label>
                    <select
                      value={createForm.departmentId || ''}
                      onChange={(e) => setCreateForm((p) => ({ ...p, departmentId: Number(e.target.value) || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end">
            <button
              disabled={saving}
              onClick={createUser}
              className="px-5 py-2 bg-dsu-maroon text-white rounded-lg font-semibold hover:bg-dsu-maroon-hover disabled:opacity-60"
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800">Security Policy</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc pl-5">
              <li>Password must be at least 8 characters with one special character.</li>
              <li>Disable action performs soft disable to preserve workflow and audit integrity.</li>
              <li>Hard Delete permanently removes a user account from the application.</li>
              <li>Primary super admin account cannot be deleted.</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            <p className="text-sm text-gray-500 mt-1">Jump directly to operational sections.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'users' })}
                className="px-4 py-2 text-sm rounded-lg bg-dsu-maroon text-white hover:bg-dsu-maroon-hover"
              >
                Open User Management
              </button>
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'create' })}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Open Create User
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await refreshUsers();
                    toast.success('User list refreshed');
                  } catch {
                    toast.error('Failed to refresh users');
                  }
                }}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Refresh User Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Scholars Tab */}
      {activeTab === 'completed-scholars' && (
        <div className="space-y-4">
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
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedScholars.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                      <td className="px-4 py-3">{s.registrationNumber}</td>
                      <td className="px-4 py-3">{s.schoolName}</td>
                      <td className="px-4 py-3">{s.departmentName}</td>
                      <td className="px-4 py-3">{s.guideName || '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setLifecycleModal({ open: true, type: 'archive', scholarId: s.id, scholarName: `${s.firstName} ${s.lastName}`, registrationNumber: s.registrationNumber })}
                          className="px-2 py-1 text-xs text-white rounded bg-amber-600 hover:bg-amber-700">
                          <Archive className="w-3 h-3 inline mr-1" />Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                  {completedScholars.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No completed scholars found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Archived Scholars Tab */}
      {activeTab === 'archived-scholars' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Registration No</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">School</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {archivedScholars.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                      <td className="px-4 py-3">{s.registrationNumber}</td>
                      <td className="px-4 py-3">{s.schoolName}</td>
                      <td className="px-4 py-3">{s.departmentName}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setLifecycleModal({ open: true, type: 'purge', scholarId: s.id, scholarName: `${s.firstName} ${s.lastName}`, registrationNumber: s.registrationNumber })}
                          className="px-2 py-1 text-xs text-white rounded bg-red-600 hover:bg-red-700">
                          <Trash2 className="w-3 h-3 inline mr-1" />Purge
                        </button>
                      </td>
                    </tr>
                  ))}
                  {archivedScholars.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No archived scholars found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Confirmation Modal */}
      {lifecycleModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              {lifecycleModal.type === 'purge' ? (
                <div className="p-2 bg-red-100 rounded-full"><Trash2 className="w-6 h-6 text-red-600" /></div>
              ) : lifecycleModal.type === 'archive' ? (
                <div className="p-2 bg-amber-100 rounded-full"><Archive className="w-6 h-6 text-amber-600" /></div>
              ) : (
                <div className="p-2 bg-green-100 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
              )}
              <h3 className="text-lg font-bold text-gray-900">
                {lifecycleModal.type === 'complete' ? 'Mark PhD as Completed' :
                 lifecycleModal.type === 'archive' ? 'Archive Scholar' : 'Permanently Delete Scholar Data'}
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">{lifecycleModal.scholarName}</span> ({lifecycleModal.registrationNumber})
              </p>
              {lifecycleModal.type === 'complete' && (
                <p className="text-sm text-gray-500">This will mark the scholar's PhD as completed, deactivate their login, and free up the guide's capacity.</p>
              )}
              {lifecycleModal.type === 'archive' && (
                <p className="text-sm text-gray-500">This will archive the scholar. Their data will be hidden from active dashboards but preserved in the database.</p>
              )}
              {lifecycleModal.type === 'purge' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-semibold">⚠️ This action is IRREVERSIBLE!</p>
                  <p className="text-sm text-red-600 mt-1">All records, documents, approvals, and uploaded files for this scholar will be permanently deleted.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setLifecycleModal({ ...lifecycleModal, open: false })} className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleLifecycleAction}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  lifecycleModal.type === 'purge' ? 'bg-red-600 hover:bg-red-700' :
                  lifecycleModal.type === 'archive' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-green-600 hover:bg-green-700'
                }`}>
                {lifecycleModal.type === 'complete' ? 'Confirm Completion' :
                 lifecycleModal.type === 'archive' ? 'Archive' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit User: {editUser.username}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={editForm.firstName || ''} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} className="px-3 py-2 border rounded-lg" placeholder="First Name" />
              <input value={editForm.lastName || ''} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} className="px-3 py-2 border rounded-lg" placeholder="Last Name" />
              <input value={editForm.email || ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} className="px-3 py-2 border rounded-lg" placeholder="Email" />
              <input value={editForm.phone || ''} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} className="px-3 py-2 border rounded-lg" placeholder="Phone" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="px-4 py-2 text-white rounded-lg disabled:opacity-60 bg-[#2563EB] hover:bg-[#1D4ED8]">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{deleteModal.hardDelete ? 'Confirm Delete' : deleteModal.user.isActive ? 'Confirm Disable' : 'Confirm Enable'}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {deleteModal.hardDelete
                ? <>Delete user <span className="font-semibold">{deleteModal.user.username}</span> permanently from the application?</>
                : deleteModal.user.isActive
                ? <>Disable user <span className="font-semibold">{deleteModal.user.username}</span>?</>
                : <>Enable user <span className="font-semibold">{deleteModal.user.username}</span>?</>}
            </p>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
              placeholder={deleteModal.hardDelete ? 'Reason for delete...' : deleteModal.user.isActive ? 'Reason for disable...' : 'Reason for enable...'}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setDeleteModal({ open: false, user: null, hardDelete: false }); setDeleteReason(''); }} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={confirmDelete} disabled={saving} className={`px-4 py-2 text-white rounded-lg disabled:opacity-60 ${deleteModal.hardDelete ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : deleteModal.user.isActive ? 'bg-[#F87171] hover:bg-[#EF4444]' : 'bg-[#16A34A] hover:bg-[#15803D]'}`}>
                {saving ? (deleteModal.hardDelete ? 'Deleting...' : deleteModal.user.isActive ? 'Disabling...' : 'Enabling...') : (deleteModal.hardDelete ? 'Delete' : deleteModal.user.isActive ? 'Disable' : 'Enable')}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetModal.open && resetModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">Reset password for <span className="font-semibold">{resetModal.user.username}</span></p>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="New password" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Confirm password" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setResetModal({ open: false, user: null }); setNewPassword(''); setConfirmPassword(''); }} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={resetPassword} disabled={saving} className="px-4 py-2 text-white rounded-lg disabled:opacity-60 bg-[#F59E0B] hover:bg-[#D97706]">{saving ? 'Resetting...' : 'Reset'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
