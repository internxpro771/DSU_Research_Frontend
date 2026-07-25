import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/useAppStore';
import { ROLE_ROUTES } from './constants';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import HomePage from './pages/HomePage';
import ScholarDashboard from './pages/scholar/ScholarDashboard';
import GuideSelectionPage from './pages/scholar/GuideSelectionPage';
import MessagingPage from './pages/scholar/MessagingPage';
import DocumentRepositoryPage from './pages/scholar/DocumentRepositoryPage';
import ScholarProfilePage from './pages/scholar/ScholarProfilePage';
import RiDashboard from './pages/ri/RiDashboard';
import GuideDashboard from './pages/guide/GuideDashboard';
import GuideScholarDetail from './pages/guide/GuideScholarDetail';
import GuideProfilePage from './pages/guide/GuideProfilePage';
import GuideSelectionRequestsPage from './pages/guide/GuideSelectionRequestsPage';
import DeanSchoolDashboard from './pages/approval/DeanSchoolDashboard';
import DeanResearchDashboard from './pages/approval/DeanResearchDashboard';
import DeanSchoolProfilePage from './pages/approval/DeanSchoolProfilePage';
import DeanResearchProfilePage from './pages/approval/DeanResearchProfilePage';
import RegistrarDashboard from './pages/approval/RegistrarDashboard';
import VcDashboard from './pages/approval/VcDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotificationsPage from './pages/common/NotificationsPage';


function App() {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to={role ? ROLE_ROUTES[role] : '/login'} replace /> : <HomePage />
      } />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={role ? ROLE_ROUTES[role] : '/'} replace /> : <LoginPage />
      } />
      <Route path="/forgot-password" element={
        isAuthenticated ? <Navigate to={role ? ROLE_ROUTES[role] : '/'} replace /> : <ForgotPasswordPage />
      } />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Change Password — accessible by all authenticated users */}
        <Route path="/change-password" element={<ChangePasswordPage />} />
        {/* Scholar Routes */}
        <Route path="/scholar/dashboard" element={
          <ProtectedRoute allowedRoles={['SCHOLAR']}><ScholarDashboard /></ProtectedRoute>
        } />
        <Route path="/scholar/profile" element={
          <ProtectedRoute allowedRoles={['SCHOLAR']}><ScholarProfilePage /></ProtectedRoute>
        } />
        <Route path="/scholar/guide-selection" element={
          <ProtectedRoute allowedRoles={['SCHOLAR']}><GuideSelectionPage /></ProtectedRoute>
        } />
        <Route path="/scholar/messaging" element={
          <ProtectedRoute allowedRoles={['SCHOLAR']}><MessagingPage /></ProtectedRoute>
        } />
        <Route path="/scholar/documents" element={
          <ProtectedRoute allowedRoles={['SCHOLAR']}><DocumentRepositoryPage /></ProtectedRoute>
        } />
        <Route path="/scholar/notifications" element={
          <ProtectedRoute allowedRoles={['SCHOLAR']}><NotificationsPage /></ProtectedRoute>
        } />

        {/* R&I Office Routes */}
        <Route path="/ri/dashboard" element={
          <ProtectedRoute allowedRoles={['RI_OFFICE']}><RiDashboard /></ProtectedRoute>
        } />
        <Route path="/ri/notifications" element={
          <ProtectedRoute allowedRoles={['RI_OFFICE']}><NotificationsPage /></ProtectedRoute>
        } />

        {/* Guide Routes */}
        <Route path="/guide/dashboard" element={
          <ProtectedRoute allowedRoles={['GUIDE']}><GuideDashboard /></ProtectedRoute>
        } />
        <Route path="/guide/profile" element={
          <ProtectedRoute allowedRoles={['GUIDE']}><GuideProfilePage /></ProtectedRoute>
        } />
        <Route path="/guide/scholars/:scholarId" element={
          <ProtectedRoute allowedRoles={['GUIDE']}><GuideScholarDetail /></ProtectedRoute>
        } />
        <Route path="/guide/notifications" element={
          <ProtectedRoute allowedRoles={['GUIDE']}><NotificationsPage /></ProtectedRoute>
        } />

          <Route path="/guide/guide-selection-requests" element={
            <ProtectedRoute allowedRoles={['GUIDE']}><GuideSelectionRequestsPage /></ProtectedRoute>
          } />

        {/* Dean of School Routes */}
        <Route path="/dean-school/dashboard" element={
          <ProtectedRoute allowedRoles={['DEAN_OF_SCHOOL']}><DeanSchoolDashboard /></ProtectedRoute>
        } />
        <Route path="/dean-school/notifications" element={
          <ProtectedRoute allowedRoles={['DEAN_OF_SCHOOL']}><NotificationsPage /></ProtectedRoute>
        } />

          <Route path="/dean-school/profile" element={
            <ProtectedRoute allowedRoles={['DEAN_OF_SCHOOL']}><DeanSchoolProfilePage /></ProtectedRoute>
          } />

        {/* Dean of Research Routes */}
        <Route path="/dean-research/dashboard" element={
          <ProtectedRoute allowedRoles={['DEAN_OF_RESEARCH']}><DeanResearchDashboard /></ProtectedRoute>
        } />
        <Route path="/dean-research/notifications" element={
          <ProtectedRoute allowedRoles={['DEAN_OF_RESEARCH']}><NotificationsPage /></ProtectedRoute>
        } />

          <Route path="/dean-research/profile" element={
            <ProtectedRoute allowedRoles={['DEAN_OF_RESEARCH']}><DeanResearchProfilePage /></ProtectedRoute>
          } />

        {/* Registrar Routes */}
        <Route path="/registrar/dashboard" element={
          <ProtectedRoute allowedRoles={['REGISTRAR']}><RegistrarDashboard /></ProtectedRoute>
        } />
        <Route path="/registrar/notifications" element={
          <ProtectedRoute allowedRoles={['REGISTRAR']}><NotificationsPage /></ProtectedRoute>
        } />

        {/* VC Routes */}
        <Route path="/vc/dashboard" element={
          <ProtectedRoute allowedRoles={['VICE_CHANCELLOR']}><VcDashboard /></ProtectedRoute>
        } />
        <Route path="/vc/notifications" element={
          <ProtectedRoute allowedRoles={['VICE_CHANCELLOR']}><NotificationsPage /></ProtectedRoute>
        } />

        {/* Super Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><NotificationsPage /></ProtectedRoute>
        } />

      </Route>

      {/* Fallback */}
      <Route path="/unauthorized" element={<div className="text-center py-20 text-xl text-red-600">Unauthorized Access</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
