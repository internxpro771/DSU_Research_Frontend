import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  User,
  LayoutDashboard,
  CheckSquare,
  Award,
  Calendar,
  FileText,
  BookOpen,
  GraduationCap,
  Shield,
  FolderOpen,
  Bell,
  Settings,
  Users,
  UserCheck,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  CheckCircle,
  Archive,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppStore';
import { logout } from '../../store/authSlice';
import { ROLE_LABELS, ROLE_ROUTES } from '../../constants';
import NotificationBell from '../common/NotificationBell';
import dsuLogo from '../../assets/dsu-logo.png';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const getNavItems = (role: string | null, dashboardRoute: string): NavItem[] => {
  const iconSize = 'w-5 h-5';

  if (role === 'SCHOLAR') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard className={iconSize} />, path: dashboardRoute },
      { label: 'Select Guide', icon: <UserCheck className={iconSize} />, path: '/scholar/guide-selection' },
      { label: 'Document Repository', icon: <FolderOpen className={iconSize} />, path: '/scholar/documents' },
      { label: 'Messaging', icon: <MessageSquare className={iconSize} />, path: '/scholar/messaging' },
      { label: 'My Profile', icon: <User className={iconSize} />, path: '/scholar/profile' },
      { label: 'Notifications', icon: <Bell className={iconSize} />, path: '/scholar/notifications' },
    ];
  }

  if (role === 'GUIDE') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard className={iconSize} />, path: dashboardRoute },
      { label: 'Scholars', icon: <Users className={iconSize} />, path: '/guide/dashboard?tab=scholars' },
      { label: 'Guide Selection Requests', icon: <UserCheck className={iconSize} />, path: '/guide/guide-selection-requests' },
      { label: 'My Profile', icon: <User className={iconSize} />, path: '/guide/profile' },
      { label: 'Notifications', icon: <Bell className={iconSize} />, path: '/guide/notifications' },
    ];
  }

  if (role === 'RI_OFFICE') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard className={iconSize} />, path: '/ri/dashboard?tab=dashboard' },
      { label: 'PhD Students', icon: <Users className={iconSize} />, path: '/ri/dashboard?tab=students' },
      { label: 'Guides', icon: <UserCheck className={iconSize} />, path: '/ri/dashboard?tab=guides' },
      { label: 'Dean of School', icon: <GraduationCap className={iconSize} />, path: '/ri/dashboard?tab=dean-school-management' },
      { label: 'Dean of Research', icon: <GraduationCap className={iconSize} />, path: '/ri/dashboard?tab=dean-research-management' },
      { label: 'Approved Signed Forms', icon: <FileText className={iconSize} />, path: '/ri/dashboard?tab=approved-signed-forms' },
      { label: 'Add PhD Student', icon: <UserPlus className={iconSize} />, path: '/ri/dashboard?tab=add-student' },
      { label: 'Add Guide', icon: <UserPlus className={iconSize} />, path: '/ri/dashboard?tab=add-guide' },
      { label: 'Add Dean of School', icon: <UserPlus className={iconSize} />, path: '/ri/dashboard?tab=add-dean' },
      { label: 'Add Dean of Research', icon: <UserPlus className={iconSize} />, path: '/ri/dashboard?tab=add-dean-research' },
      { label: 'Scholar-Guide Mapping', icon: <Users className={iconSize} />, path: '/ri/dashboard?tab=scholar-guide-mapping' },
      { label: 'Completed Scholars', icon: <CheckCircle className={iconSize} />, path: '/ri/dashboard?tab=completed-scholars' },
      { label: 'Archived Scholars', icon: <Archive className={iconSize} />, path: '/ri/dashboard?tab=archived-scholars' },
      { label: 'My Profile', icon: <User className={iconSize} />, path: '/ri/dashboard?tab=profile' },
      { label: 'Notifications', icon: <Bell className={iconSize} />, path: '/ri/notifications' },
    ];
  }

  if (role === 'SUPER_ADMIN') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard className={iconSize} />, path: '/admin/dashboard?tab=dashboard' },
      { label: 'User Management', icon: <Users className={iconSize} />, path: '/admin/dashboard?tab=users' },
      { label: 'Add Users', icon: <UserPlus className={iconSize} />, path: '/admin/dashboard?tab=create' },
      { label: 'Completed Scholars', icon: <CheckCircle className={iconSize} />, path: '/admin/dashboard?tab=completed-scholars' },
      { label: 'Archived Scholars', icon: <Archive className={iconSize} />, path: '/admin/dashboard?tab=archived-scholars' },
      { label: 'Settings', icon: <Settings className={iconSize} />, path: '/admin/dashboard?tab=settings' },
      { label: 'Notifications', icon: <Bell className={iconSize} />, path: '/admin/notifications' },
    ];
  }

  if (role === 'REGISTRAR' || role === 'VICE_CHANCELLOR') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard className={iconSize} />, path: `${dashboardRoute}?tab=dashboard` },
      { label: 'PhD Students', icon: <Users className={iconSize} />, path: `${dashboardRoute}?tab=students` },
      { label: 'Guides', icon: <UserCheck className={iconSize} />, path: `${dashboardRoute}?tab=guides` },
      { label: 'School Deans', icon: <GraduationCap className={iconSize} />, path: `${dashboardRoute}?tab=school-deans` },
      { label: 'Dean of Research', icon: <GraduationCap className={iconSize} />, path: `${dashboardRoute}?tab=dean-research` },
      { label: 'Panel of DAC Members', icon: <Users className={iconSize} />, path: `${dashboardRoute}?tab=panel-nomination` },
      { label: 'My Profile', icon: <User className={iconSize} />, path: `${dashboardRoute}?tab=profile` },
      { label: 'Notifications', icon: <Bell className={iconSize} />, path: `${dashboardRoute.split('/dashboard')[0]}/notifications` },
    ];
  }

  // DEAN_OF_SCHOOL, DEAN_OF_RESEARCH
  if (role === 'DEAN_OF_SCHOOL') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard className={iconSize} />, path: dashboardRoute },
      { label: 'PhD Students', icon: <Users className={iconSize} />, path: `${dashboardRoute}?tab=students` },
      { label: 'Guides', icon: <UserCheck className={iconSize} />, path: `${dashboardRoute}?tab=guides` },
      { label: 'Meeting Requests', icon: <Calendar className={iconSize} />, path: `${dashboardRoute}?tab=meeting-requests` },
      { label: 'Panel of DAC Members', icon: <Users className={iconSize} />, path: `${dashboardRoute}?tab=nomination-expert-members` },
      { label: 'First DAC Meeting', icon: <CheckSquare className={iconSize} />, path: `${dashboardRoute}?tab=first-dac` },
      { label: 'Comprehensive Viva', icon: <Award className={iconSize} />, path: `${dashboardRoute}?tab=comprehensive-viva` },
      { label: 'Colloquium', icon: <Calendar className={iconSize} />, path: `${dashboardRoute}?tab=colloquium` },
      { label: 'Inch Committee', icon: <FileText className={iconSize} />, path: `${dashboardRoute}?tab=inch-committee` },
      { label: 'Synopsis', icon: <BookOpen className={iconSize} />, path: `${dashboardRoute}?tab=synopsis` },
      { label: 'Thesis Defense', icon: <Shield className={iconSize} />, path: `${dashboardRoute}?tab=thesis-defense` },
      { label: 'My Profile', icon: <User className={iconSize} />, path: '/dean-school/profile' },
      { label: 'Notifications', icon: <Bell className={iconSize} />, path: '/dean-school/notifications' },
    ];
  }

  if (role === 'DEAN_OF_RESEARCH') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard className={iconSize} />, path: dashboardRoute },
      { label: 'PhD Students', icon: <Users className={iconSize} />, path: `${dashboardRoute}?tab=students` },
      { label: 'Guides', icon: <UserCheck className={iconSize} />, path: `${dashboardRoute}?tab=guides` },
      { label: 'Dean of School', icon: <GraduationCap className={iconSize} />, path: `${dashboardRoute}?tab=school-deans` },
      { label: 'Meeting Requests', icon: <Calendar className={iconSize} />, path: `${dashboardRoute}?tab=meeting-requests` },
      { label: 'Panel of DAC Members', icon: <Users className={iconSize} />, path: `${dashboardRoute}?tab=nomination-expert-members` },
      { label: 'First DAC Meeting', icon: <CheckSquare className={iconSize} />, path: `${dashboardRoute}?tab=first-dac` },
      { label: 'Comprehensive Viva', icon: <Award className={iconSize} />, path: `${dashboardRoute}?tab=comprehensive-viva` },
      { label: 'Colloquium', icon: <Calendar className={iconSize} />, path: `${dashboardRoute}?tab=colloquium` },
      { label: 'Inch Committee', icon: <FileText className={iconSize} />, path: `${dashboardRoute}?tab=inch-committee` },
      { label: 'Synopsis', icon: <BookOpen className={iconSize} />, path: `${dashboardRoute}?tab=synopsis` },
      { label: 'Thesis Defense', icon: <Shield className={iconSize} />, path: `${dashboardRoute}?tab=thesis-defense` },
      { label: 'My Profile', icon: <User className={iconSize} />, path: '/dean-research/profile' },
      { label: 'Notifications', icon: <Bell className={iconSize} />, path: '/dean-research/notifications' },
    ];
  }

  return [
    { label: 'Dashboard', icon: <LayoutDashboard className={iconSize} />, path: dashboardRoute },
    { label: 'PhD Students', icon: <Users className={iconSize} />, path: `${dashboardRoute}?tab=students` },
    { label: 'Guides', icon: <UserCheck className={iconSize} />, path: `${dashboardRoute}?tab=guides` },
    { label: 'First DAC Meeting', icon: <CheckSquare className={iconSize} />, path: `${dashboardRoute}?tab=first-dac` },
    { label: 'Comprehensive Viva', icon: <Award className={iconSize} />, path: `${dashboardRoute}?tab=comprehensive-viva` },
    { label: 'Colloquium', icon: <Calendar className={iconSize} />, path: `${dashboardRoute}?tab=colloquium` },
    { label: 'Inch Committee', icon: <FileText className={iconSize} />, path: `${dashboardRoute}?tab=inch-committee` },
    { label: 'Synopsis', icon: <BookOpen className={iconSize} />, path: `${dashboardRoute}?tab=synopsis` },
    { label: 'Thesis Defense', icon: <Shield className={iconSize} />, path: `${dashboardRoute}?tab=thesis-defense` },
    { label: 'Notifications', icon: <Bell className={iconSize} />, path: `${dashboardRoute.split('/dashboard')[0]}/notifications` },
  ];
};

const Layout = () => {
  const { fullName, role, username } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const dashboardRoute = role ? ROLE_ROUTES[role] || '/' : '/';
  const navItems = getNavItems(role, dashboardRoute);

  const isActive = (path: string) => {
    const [pathname, search] = path.split('?');
    if (search) {
      return location.pathname === pathname && location.search === `?${search}`;
    }
    return location.pathname === pathname && !location.search;
  };

  const roleLabel = role ? ROLE_LABELS[role] : '';

  const sidebarRoleLabel = (() => {
    switch (role) {
      case 'SCHOLAR': return 'PhD Research Scholar';
      case 'GUIDE': return 'Research Supervisor';
      case 'DEAN_OF_SCHOOL': return 'Dean of School';
      case 'DEAN_OF_RESEARCH': return 'Dean of Research';
      case 'RI_OFFICE': return 'R&I Office';
      case 'REGISTRAR': return 'Registrar';
      case 'VICE_CHANCELLOR': return 'Vice Chancellor';
      case 'SUPER_ADMIN': return 'Super Admin';
      default: return '';
    }
  })();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-dsu-maroon z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo section */}
        <div className="px-6 py-6 text-center border-b border-white/10">
          <img src={dsuLogo} alt="DSU Logo" className="object-contain mx-auto mb-4" style={{ width: '900px', height: '140px' }} />
          <h1 className="text-dsu-gold font-heading text-sm font-semibold tracking-wide leading-tight">
            DHANALAKSHMI SRINIVASAN UNIVERSITY
          </h1>
          <p className="text-dsu-gold/80 text-xs mt-1 tracking-wider">PHD RESEARCH PORTAL</p>
          <p className="text-white/70 text-xs mt-2 bg-white/10 rounded-full py-1 px-3 inline-block">
            {sidebarRoleLabel}
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={isActive(item.path) ? 'sidebar-item-active' : 'sidebar-item'}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-red-300 hover:text-red-200 hover:bg-red-900/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <p className="text-xs text-gray-500 uppercase tracking-wider">DSU PHD RESEARCH PORTAL</p>
                <h2 className="text-sm font-semibold text-gray-800">
                  {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <NotificationBell />

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-dsu-maroon rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-700 leading-tight">{fullName}</p>
                    <p className="text-xs text-gray-500">{roleLabel}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{fullName}</p>
                        <p className="text-xs text-gray-500">{username}</p>
                        <p className="text-xs text-gray-500">{roleLabel}</p>
                      </div>
                      <Link
                        to="/change-password"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        Change Password
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile close sidebar */}
              {sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
