import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { riService } from '../../services/dataService';
import { DocumentItem, RiApprovedSignedFormItem, Scholar, ScholarCreatedResponse } from '../../types';
import { toast } from 'react-toastify';
import { UserPlus, Users, BookOpen, GraduationCap, RefreshCw, X, Mail, Phone, Building2, CreditCard, Shield, Eye, Download, Printer, CheckCircle, Archive, Trash2, TrendingUp, Clock, UserCheck } from 'lucide-react';
import api from '../../services/api';
import DateInput from '../../components/common/DateInput';
import { WORKFLOW_STAGE_LABELS, WORKFLOW_STAGES } from '../../constants';

interface SchoolOption { id: number; name: string; code: string; }
interface DepartmentOption { id: number; name: string; code: string; }
interface GuideCreatedResult { id: number; firstName: string; lastName: string; empId: string; designation: string; username: string; schoolName: string; departmentName: string; maxScholars: number; }
interface DeanCreatedResult { id: number; firstName: string; lastName: string; empId: string; username: string; schoolName: string; }
interface DeanSummary { id: number; firstName: string; lastName: string; empId?: string; email?: string; phone?: string; username: string; schoolName: string; isActive: boolean; }

interface GuideSummary {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  phone?: string;
  empId: string;
  designation: string;
  specialization: string;
  schoolName: string;
  departmentName: string;
  currentScholarCount: number;
  isActive: boolean;
}

interface RiProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  username: string;
  roleName?: string;
  schoolName?: string;
  departmentName?: string;
  isActive: boolean;
}

interface StagedUploadItem {
  category: string;
  label: string;
  file: File;
}

const DESIGNATION_LABELS: Record<string, string> = {
  PROFESSOR: 'Professor',
  ASSOCIATE_PROFESSOR: 'Associate Professor',
  ASSISTANT_PROFESSOR: 'Assistant Professor',
};

const RiDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['dashboard', 'students', 'completed-scholars', 'archived-scholars', 'guides', 'dean-school-management', 'dean-research-management', 'approved-signed-forms', 'add-student', 'add-guide', 'add-dean', 'add-dean-research', 'scholar-guide-mapping', 'profile'];
  const rawTab = searchParams.get('tab') || 'dashboard';
  const activeTab = validTabs.includes(rawTab) ? rawTab : 'dashboard';
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [guides, setGuides] = useState<GuideSummary[]>([]);
  const [deans, setDeans] = useState<DeanSummary[]>([]);
  const [profile, setProfile] = useState<RiProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [scholarRegistrationSearch, setScholarRegistrationSearch] = useState('');
  const [scholarSchoolFilter, setScholarSchoolFilter] = useState('');
  const [scholarDepartmentFilter, setScholarDepartmentFilter] = useState('');
  const [scholarGuideFilter, setScholarGuideFilter] = useState('');
  const [scholarStageFilter, setScholarStageFilter] = useState('');
  const [scholarBatchFilter, setScholarBatchFilter] = useState('');
  const [guideDesignationFilter, setGuideDesignationFilter] = useState('');
  const [guideSchoolFilter, setGuideSchoolFilter] = useState('');
  const [guideDepartmentFilter, setGuideDepartmentFilter] = useState('');
  const [deanSchoolFilter, setDeanSchoolFilter] = useState('');
  const [editingScholar, setEditingScholar] = useState<Scholar | null>(null);
  const [editingGuide, setEditingGuide] = useState<GuideSummary | null>(null);
  const [editingDean, setEditingDean] = useState<DeanSummary | null>(null);
  const [mappingScholar, setMappingScholar] = useState<Scholar | null>(null);
  const [mappingGuideId, setMappingGuideId] = useState('');
  const [mappingReason, setMappingReason] = useState('');
  const [mappingSubmitting, setMappingSubmitting] = useState(false);
  const [mappingGuides, setMappingGuides] = useState<GuideSummary[]>([]);
  const [showMappingModal, setShowMappingModal] = useState(false);

  // School/Department options
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  // Scholar form
  const [scholarForm, setScholarForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', registrationNumber: '',
    schoolId: '', departmentId: '', dateOfBirth: '', admissionDate: '', batch: '',
  });
  const [createdScholar, setCreatedScholar] = useState<ScholarCreatedResponse | null>(null);
  const [showCreatedScholarBanner, setShowCreatedScholarBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Guide form
  const [guideForm, setGuideForm] = useState({
    firstName: '', lastName: '', empId: '', dateOfBirth: '',
    designation: '', specialization: '', email: '', phone: '',
    schoolId: '', departmentId: '',
  });
  const [guideDepts, setGuideDepts] = useState<DepartmentOption[]>([]);
  const [guideMaxScholars, setGuideMaxScholars] = useState<number | null>(null);
  const [createdGuide, setCreatedGuide] = useState<GuideCreatedResult | null>(null);
  const [submittingGuide, setSubmittingGuide] = useState(false);

  // Dean form
  const [deanForm, setDeanForm] = useState({
    firstName: '', lastName: '', empId: '', dateOfBirth: '',
    email: '', phone: '', schoolId: '',
  });
  const [createdDean, setCreatedDean] = useState<DeanCreatedResult | null>(null);
  const [submittingDean, setSubmittingDean] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [actionModal, setActionModal] = useState<{ open: boolean; type: 'disable' | 'enable' | 'reset'; targetId: number; targetName: string }>({ open: false, type: 'disable', targetId: 0, targetName: '' });

  // Dean of Research form
  const [deanResearchForm, setDeanResearchForm] = useState({
    firstName: '', lastName: '', empId: '', dateOfBirth: '',
    email: '', phone: '',
  });
  const [deanResearch, setDeanResearch] = useState<DeanSummary | null>(null);
  const [submittingDeanResearch, setSubmittingDeanResearch] = useState(false);
  const [approvedSignedForms, setApprovedSignedForms] = useState<RiApprovedSignedFormItem[]>([]);
  const [selectedScholarSignedForms, setSelectedScholarSignedForms] = useState<RiApprovedSignedFormItem | null>(null);
  const [completedScholars, setCompletedScholars] = useState<Scholar[]>([]);
  const [archivedScholars, setArchivedScholars] = useState<Scholar[]>([]);
  const [lifecycleModal, setLifecycleModal] = useState<{
    open: boolean;
    type: 'complete' | 'archive' | 'purge';
    scholarId: number;
    scholarName: string;
    registrationNumber: string;
  }>({ open: false, type: 'complete', scholarId: 0, scholarName: '', registrationNumber: '' });

  // Load schools on mount
  useEffect(() => {
    api.get('/ri/schools').then(res => setSchools(res.data.data || [])).catch(() => {});
  }, []);

  // Load departments when scholar school changes
  useEffect(() => {
    if (scholarForm.schoolId) {
      api.get(`/ri/departments?schoolId=${scholarForm.schoolId}`).then(res => setDepartments(res.data.data || [])).catch(() => {});
    } else { setDepartments([]); }
  }, [scholarForm.schoolId]);

  // Load departments when guide school changes
  useEffect(() => {
    if (guideForm.schoolId) {
      api.get(`/ri/departments?schoolId=${guideForm.schoolId}`).then(res => setGuideDepts(res.data.data || [])).catch(() => {});
    } else { setGuideDepts([]); }
  }, [guideForm.schoolId]);

  // Auto-show capacity when guide designation changes
  useEffect(() => {
    if (guideForm.designation) {
      api.get(`/ri/guide-capacity?designation=${guideForm.designation}`)
        .then(res => setGuideMaxScholars(res.data.data?.maxScholars ?? null))
        .catch(() => setGuideMaxScholars(null));
    } else { setGuideMaxScholars(null); }
  }, [guideForm.designation]);

  const fetchScholars = async () => {
    setLoading(true);
    try {
      const data = await riService.getScholars(0, 50);
      setScholars(data.content);
    } catch {
      toast.error('Failed to load scholars');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ri/deans');
      setDeans(response.data.data || []);
    } catch {
      toast.error('Failed to load dean listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await riService.getProfile();
      setProfile(data);
    } catch {
      toast.error('Failed to load RI profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ri/guides');
      setGuides(response.data.data || []);
    } catch {
      toast.error('Failed to load guide listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMappingGuides = async () => {
    try {
      const response = await api.get('/ri/guides');
      setMappingGuides(response.data.data || []);
    } catch {
      toast.error('Failed to load guides for mapping');
    }
  };

  const fetchApprovedSignedForms = async () => {
    setLoading(true);
    try {
      const data = await riService.getApprovedSignedForms();
      setApprovedSignedForms(data);
    } catch {
      toast.error('Failed to load approved signed forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedScholars = async () => {
    setLoading(true);
    try {
      const data = await riService.getCompletedScholars(0, 50);
      setCompletedScholars(data.content);
    } catch {
      toast.error('Failed to load completed scholars');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedScholars = async () => {
    setLoading(true);
    try {
      const data = await riService.getArchivedScholars(0, 50);
      setArchivedScholars(data.content);
    } catch {
      toast.error('Failed to load archived scholars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'dashboard' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openMappingModal = async (scholar: Scholar) => {
    setMappingScholar(scholar);
    setMappingGuideId('');
    setMappingReason('');
    setShowMappingModal(true);
    await fetchMappingGuides();
  };

  const handleMappingSubmit = async () => {
    if (!mappingScholar || !mappingGuideId || !mappingReason.trim()) {
      toast.error('Select a guide and provide a reason');
      return;
    }
    setMappingSubmitting(true);
    try {
      await riService.transferScholarGuide(mappingScholar.id, Number(mappingGuideId), mappingReason.trim());
      toast.success('Scholar-guide mapping updated');
      setShowMappingModal(false);
      setMappingScholar(null);
      setMappingGuideId('');
      setMappingReason('');
      await fetchScholars();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update scholar-guide mapping');
    } finally {
      setMappingSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'dashboard') fetchScholars();
    if (activeTab === 'completed-scholars') fetchCompletedScholars();
    if (activeTab === 'archived-scholars') fetchArchivedScholars();
    if (activeTab === 'guides') fetchGuides();
    if (activeTab === 'dean-school-management') fetchDeans();
    if (activeTab === 'dean-research-management') fetchDeanResearch();
    if (activeTab === 'approved-signed-forms') fetchApprovedSignedForms();
      if (activeTab === 'scholar-guide-mapping') fetchScholars();
    if (activeTab === 'profile') fetchProfile();
  }, [activeTab]);

  const fetchDeanResearch = async () => {
    try {
      const response = await api.get('/ri/dean-research');
      setDeanResearch(response.data.data || null);
    } catch {
      setDeanResearch(null);
    }
  };

  const handleScholarSubmit = async (additionalInfo?: Record<string, unknown>): Promise<ScholarCreatedResponse | null> => {
    if (!scholarForm.dateOfBirth) { toast.error('Date of birth is required for credential generation'); return null; }
    setSubmitting(true);
    try {
      const payload = {
        ...scholarForm,
        schoolId: Number(scholarForm.schoolId),
        departmentId: Number(scholarForm.departmentId),
        programName: additionalInfo?.programName,
        degreeLevel: additionalInfo?.degreeLevel,
        specialization: additionalInfo?.specialization,
        academicYear: additionalInfo?.academicYear,
        semester: additionalInfo?.semester,
        modeOfStudy: additionalInfo?.modeOfStudy,
        aadhaarNumber: additionalInfo?.aadhaarNumber,
        gender: additionalInfo?.gender,
        nationality: additionalInfo?.nationality,
        placeOfBirth: additionalInfo?.placeOfBirth,
        bloodGroup: additionalInfo?.bloodGroup,
        maritalStatus: additionalInfo?.maritalStatus,
        alternateMobile: additionalInfo?.alternateMobile,
        alternateEmail: additionalInfo?.alternateEmail,
        permanentAddress: additionalInfo?.permanentAddress,
        correspondenceAddress: additionalInfo?.correspondenceAddress,
        city: additionalInfo?.city,
        district: additionalInfo?.district,
        state: additionalInfo?.state,
        pinCode: additionalInfo?.pinCode,
        country: additionalInfo?.country,
        fatherName: additionalInfo?.fatherName,
        motherName: additionalInfo?.motherName,
        guardianName: additionalInfo?.guardianName,
        guardianOccupation: additionalInfo?.guardianOccupation,
        guardianMobile: additionalInfo?.guardianMobile,
        guardianEmail: additionalInfo?.guardianEmail,
        guardianAddress: additionalInfo?.guardianAddress,
        annualFamilyIncome: additionalInfo?.annualFamilyIncome,
        qualificationDetails: Array.isArray(additionalInfo?.qualifications)
          ? (additionalInfo.qualifications as Array<Record<string, unknown>>).map((q) => ({
              qualificationLevel: q.level,
              boardUniversityName: q.boardUniversity,
              institutionCollegeName: q.institution,
              degreeCertificateName: q.degree,
              subjectDiscipline: q.subject,
              yearOfPassing: q.yearOfPassing,
              rollNumber: q.rollNumber,
              percentageCgpaGrade: q.percentageCgpa,
              divisionClass: q.division,
            }))
          : [],
      };
      const result = editingScholar
        ? await riService.updateScholar(editingScholar.id, payload).then(() => ({ ...createdScholar, ...payload } as ScholarCreatedResponse))
        : await riService.createScholar(payload);
      setCreatedScholar(result);
      setShowCreatedScholarBanner(true);
      window.setTimeout(() => setShowCreatedScholarBanner(false), 8000);
      toast.success('Scholar created successfully');
      setScholarForm({ firstName: '', lastName: '', email: '', phone: '', registrationNumber: '', schoolId: '', departmentId: '', dateOfBirth: '', admissionDate: '', batch: '' });
      return result || null;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create scholar');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGuide(true);
    try {
      const res = editingGuide
        ? await riService.updateGuide(editingGuide.id, { ...guideForm, schoolId: Number(guideForm.schoolId), departmentId: Number(guideForm.departmentId) }).then(() => ({ data: { data: null } }))
        : await api.post('/ri/guides', { ...guideForm, schoolId: Number(guideForm.schoolId), departmentId: Number(guideForm.departmentId) });
      setCreatedGuide(res.data.data || null);
      toast.success('Guide created successfully');
      setGuideForm({ firstName: '', lastName: '', empId: '', dateOfBirth: '', designation: '', specialization: '', email: '', phone: '', schoolId: '', departmentId: '' });
      setGuideMaxScholars(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create guide');
    } finally {
      setSubmittingGuide(false);
    }
  };

  const handleDeanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDean(true);
    try {
      const res = editingDean
        ? await riService.updateDean(editingDean.id, { ...deanForm, schoolId: Number(deanForm.schoolId) }).then(() => ({ data: { data: null } }))
        : await api.post('/ri/deans', { ...deanForm, schoolId: Number(deanForm.schoolId) });
      setCreatedDean(res.data.data || null);
      toast.success('Dean of School created successfully');
      setDeanForm({ firstName: '', lastName: '', empId: '', dateOfBirth: '', email: '', phone: '', schoolId: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create dean');
    } finally {
      setSubmittingDean(false);
    }
  };

  const startScholarEdit = (scholar: Scholar) => {
    setEditingScholar(scholar);
    setScholarForm({
      firstName: scholar.firstName,
      lastName: scholar.lastName,
      email: scholar.email || '',
      phone: scholar.phone || '',
      registrationNumber: scholar.registrationNumber,
      schoolId: '',
      departmentId: '',
      dateOfBirth: '',
      admissionDate: scholar.admissionDate || '',
      batch: scholar.batch || '',
    });
    setSearchParams({ tab: 'add-student' });
  };

  const startGuideEdit = (guide: GuideSummary) => {
    setEditingGuide(guide);
    setGuideForm({
      firstName: guide.firstName,
      lastName: guide.lastName,
      empId: guide.empId,
      dateOfBirth: '',
      designation: guide.designation,
      specialization: guide.specialization || '',
      email: guide.email || '',
      phone: guide.phone || '',
      schoolId: '',
      departmentId: '',
    });
    setSearchParams({ tab: 'add-guide' });
  };

  const startDeanEdit = (dean: DeanSummary) => {
    setEditingDean(dean);
    setDeanForm({
      firstName: dean.firstName,
      lastName: dean.lastName,
      empId: dean.username,
      dateOfBirth: '',
      email: dean.email || '',
      phone: dean.phone || '',
      schoolId: '',
    });
    setSearchParams({ tab: 'add-dean' });
  };

  const handleDisableScholar = async (scholar: Scholar) => {
    setActionModal({ open: true, type: scholar.isActive ? 'disable' : 'enable', targetId: scholar.id, targetName: `${scholar.firstName} ${scholar.lastName}` });
  };

  const handleResetPassword = async (userId: number, name?: string) => {
    setActionModal({ open: true, type: 'reset', targetId: userId, targetName: name || '' });
  };

  const handleDisableGuide = async (guide: GuideSummary) => {
    setActionModal({ open: true, type: guide.isActive ? 'disable' : 'enable', targetId: guide.id, targetName: `${guide.firstName} ${guide.lastName}` });
  };

  const handleDisableDean = async (dean: DeanSummary) => {
    setActionModal({ open: true, type: dean.isActive ? 'disable' : 'enable', targetId: dean.id, targetName: `${dean.firstName} ${dean.lastName}` });
  };

  const confirmAction = async () => {
    if (!actionReason.trim()) { toast.error('Please provide a reason'); return; }
    const { type, targetId } = actionModal;
    try {
      if (type === 'reset') {
        await riService.resetPassword(targetId, actionReason.trim());
        toast.success('Password reset to DOB format');
      } else {
        const isEnable = type === 'enable';
        // Determine which tab we're on to call the right account-status endpoint
        if (activeTab === 'students') {
          if (isEnable) {
            await riService.enableScholar(targetId, actionReason.trim());
            toast.success('Scholar enabled');
          } else {
            await riService.disableScholar(targetId, actionReason.trim());
            toast.success('Scholar disabled');
          }
          await fetchScholars();
        } else if (activeTab === 'guides') {
          if (isEnable) {
            await riService.enableGuide(targetId, actionReason.trim());
            toast.success('Guide enabled');
          } else {
            await riService.disableGuide(targetId, actionReason.trim());
            toast.success('Guide disabled');
          }
          await fetchGuides();
        } else {
          if (isEnable) {
            await riService.enableDean(targetId, actionReason.trim());
            toast.success('Dean enabled');
          } else {
            await riService.disableDean(targetId, actionReason.trim());
            toast.success('Dean disabled');
          }
          if (activeTab === 'dean-research-management') {
            await fetchDeanResearch();
          } else {
            await fetchDeans();
          }
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionModal({ open: false, type: 'disable', targetId: 0, targetName: '' });
      setActionReason('');
    }
  };

  const filteredScholars = scholars.filter(s =>
    (!searchName || `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchName.toLowerCase())) &&
    (!scholarRegistrationSearch || s.registrationNumber.toLowerCase().includes(scholarRegistrationSearch.toLowerCase())) &&
    (!scholarSchoolFilter || s.schoolName === scholarSchoolFilter) &&
    (!scholarDepartmentFilter || s.departmentName === scholarDepartmentFilter) &&
    (!scholarGuideFilter || (s.guideName || '') === scholarGuideFilter) &&
    (!scholarStageFilter || (s.currentWorkflowStage || '') === scholarStageFilter) &&
    (!scholarBatchFilter || (s.batch || '') === scholarBatchFilter)
  );

  const handleLifecycleAction = async () => {
    try {
      if (lifecycleModal.type === 'complete') {
        await riService.completeScholar(lifecycleModal.scholarId);
        toast.success('Scholar marked as completed');
        fetchScholars();
        fetchCompletedScholars();
      } else if (lifecycleModal.type === 'archive') {
        await riService.archiveScholar(lifecycleModal.scholarId);
        toast.success('Scholar archived successfully');
        fetchCompletedScholars();
        fetchArchivedScholars();
      } else if (lifecycleModal.type === 'purge') {
        await riService.purgeScholar(lifecycleModal.scholarId);
        toast.success('Scholar data permanently deleted');
        fetchArchivedScholars();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setLifecycleModal({ open: false, type: 'complete', scholarId: 0, scholarName: '', registrationNumber: '' });
    }
  };

  const filteredGuides = guides.filter(g =>
    (!searchName || `${g.firstName} ${g.lastName}`.toLowerCase().includes(searchName.toLowerCase())) &&
    (!guideDesignationFilter || g.designation === guideDesignationFilter) &&
    (!guideSchoolFilter || g.schoolName === guideSchoolFilter) &&
    (!guideDepartmentFilter || g.departmentName === guideDepartmentFilter)
  );

  const filteredDeans = deans.filter(dean =>
    (!searchName || `${dean.firstName} ${dean.lastName}`.toLowerCase().includes(searchName.toLowerCase())) &&
    (!deanSchoolFilter || dean.schoolName === deanSchoolFilter)
  );

  const sectionTitle = activeTab === 'dashboard' ? 'R&I Office — Dashboard' :
    activeTab === 'students' ? 'R&I Office — PhD Students' :
    activeTab === 'completed-scholars' ? 'R&I Office — Completed Scholars' :
    activeTab === 'archived-scholars' ? 'R&I Office — Archived Scholars' :
    activeTab === 'guides' ? 'R&I Office — Guides' :
    activeTab === 'dean-school-management' ? 'R&I Office — Dean of School' :
    activeTab === 'dean-research-management' ? 'R&I Office — Dean of Research' :
    activeTab === 'approved-signed-forms' ? 'R&I Office — Approved Signed Forms' :
    activeTab === 'add-student' ? (editingScholar ? 'R&I Office — Edit PhD Student' : 'R&I Office — Add PhD Student') :
    activeTab === 'add-guide' ? (editingGuide ? 'R&I Office — Edit Guide' : 'R&I Office — Add Guide') :
    activeTab === 'add-dean' ? (editingDean ? 'R&I Office — Edit Dean of School' : 'R&I Office — Add Dean of School') :
    activeTab === 'add-dean-research' ? 'R&I Office — Add Dean of Research' :
    activeTab === 'scholar-guide-mapping' ? 'R&I Office — Scholar-Guide Mapping' :
    activeTab === 'profile' ? 'R&I Office — My Profile' : 'R&I Office — Dashboard';

  const handlePrintDocument = (documentId: number) => {
    // Use /view endpoint (inline) instead of /download (attachment) so browser renders the content
    const printUrl = `/api/v1/documents/${documentId}/view`;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = printUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Remove iframe after print dialog closes
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    };
  };

  const handleViewSignedDocuments = (item: RiApprovedSignedFormItem) => {
    setSelectedScholarSignedForms(item);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-gray-800">{sectionTitle}</h1>

      {/* Dashboard Stats - only on dashboard tab */}
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
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{guides.length}</p>
                <p className="text-xs text-gray-500">Active Guides</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{schools.length}</p>
                <p className="text-xs text-gray-500">Schools</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{scholars.filter(s => s.currentWorkflowStage === 'ADMISSION').length}</p>
                <p className="text-xs text-gray-500">New Admissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline + School Distribution */}
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

          {/* School Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-dsu-maroon" />
              By School
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {schools.map((school) => {
                const count = scholars.filter(s => s.schoolName === school.name).length;
                return (
                  <div key={school.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-600 truncate flex-1" title={school.name}>{school.name}</span>
                    <span className="text-sm font-bold text-dsu-maroon ml-2">{count}</span>
                  </div>
                );
              })}
              {schools.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No schools registered</p>}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button onClick={() => setSearchParams({ tab: 'add-student' })} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-dsu-maroon/30 hover:bg-dsu-maroon/5 transition-colors">
              <UserPlus className="w-5 h-5 text-dsu-maroon" />
              <span className="text-xs font-medium text-gray-700">Add Scholar</span>
            </button>
            <button onClick={() => setSearchParams({ tab: 'add-guide' })} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Add Guide</span>
            </button>
            <button onClick={() => setSearchParams({ tab: 'scholar-guide-mapping' })} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <span className="text-xs font-medium text-gray-700">Map Guide</span>
            </button>
            <button onClick={() => setSearchParams({ tab: 'approved-signed-forms' })} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition-colors">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-medium text-gray-700">Signed Forms</span>
            </button>
          </div>
        </div>
      </>
      )}

      {/* PhD Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <input type="text" placeholder="Scholar Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              <input type="text" placeholder="Registration No" value={scholarRegistrationSearch} onChange={(e) => setScholarRegistrationSearch(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              <select value={scholarSchoolFilter} onChange={(e) => setScholarSchoolFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">School</option>
                {schools.map((school) => <option key={school.id} value={school.name}>{school.name}</option>)}
              </select>
              <select value={scholarDepartmentFilter} onChange={(e) => setScholarDepartmentFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">Department</option>
                {[...new Set(scholars.map(s => s.departmentName).filter(Boolean))].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={scholarGuideFilter} onChange={(e) => setScholarGuideFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">Guide</option>
                {[...new Set(scholars.map(s => s.guideName).filter(Boolean))].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={scholarStageFilter} onChange={(e) => setScholarStageFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">Stage</option>
                {[...new Set(scholars.map(s => s.currentWorkflowStage).filter(Boolean))].map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
              <select value={scholarBatchFilter} onChange={(e) => setScholarBatchFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">Batch</option>
                {[...new Set(scholars.map(s => s.batch).filter(Boolean))].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <button type="button" onClick={() => { setSearchName(''); setScholarRegistrationSearch(''); setScholarSchoolFilter(''); setScholarDepartmentFilter(''); setScholarGuideFilter(''); setScholarStageFilter(''); setScholarBatchFilter(''); }} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">Clear</button>
            </div>
          </div>
          {loading ? <div className="text-center py-10">Loading...</div> : (
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
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredScholars.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="px-4 py-3">{s.registrationNumber}</td>
                        <td className="px-4 py-3">{s.schoolName}</td>
                        <td className="px-4 py-3">{s.departmentName}</td>
                        <td className="px-4 py-3">{s.guideName || '-'}</td>
                        <td className="px-4 py-3 text-xs">{s.currentWorkflowStage?.replace(/_/g, ' ') || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => startScholarEdit(s)} className="px-2 py-1 text-xs text-white rounded bg-[#2563EB] hover:bg-[#1D4ED8]">Edit</button>
                            <button onClick={() => handleDisableScholar(s)} className={`px-2 py-1 text-xs text-white rounded ${s.isActive ? 'bg-[#F87171] hover:bg-[#EF4444]' : 'bg-[#16A34A] hover:bg-[#15803D]'}`}>{s.isActive ? 'Disable' : 'Enable'}</button>
                            <button onClick={() => handleResetPassword(s.userId, `${s.firstName} ${s.lastName}`)} className="px-2 py-1 text-xs text-white rounded bg-[#F59E0B] hover:bg-[#D97706]">Reset</button>
                            {s.currentWorkflowStage === 'THESIS_DEFENSE' && s.isActive && (
                              <button onClick={() => setLifecycleModal({ open: true, type: 'complete', scholarId: s.id, scholarName: `${s.firstName} ${s.lastName}`, registrationNumber: s.registrationNumber })}
                                className="px-2 py-1 text-xs text-white rounded bg-[#16A34A] hover:bg-[#15803D]" title="Mark PhD Complete">
                                <CheckCircle className="w-3 h-3 inline mr-1" />Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredScholars.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No scholars found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Scholars Tab */}
      {activeTab === 'completed-scholars' && (
        <div className="space-y-4">
          {loading ? <div className="text-center py-10">Loading...</div> : (
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
          )}
        </div>
      )}

      {/* Archived Scholars Tab */}
      {activeTab === 'archived-scholars' && (
        <div className="space-y-4">
          {loading ? <div className="text-center py-10">Loading...</div> : (
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
          )}
        </div>
      )}

      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <input type="text" placeholder="Guide Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              <select value={guideDesignationFilter} onChange={(e) => setGuideDesignationFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">Designation</option>
                {Object.keys(DESIGNATION_LABELS).map((value) => <option key={value} value={value}>{DESIGNATION_LABELS[value]}</option>)}
              </select>
              <select value={guideSchoolFilter} onChange={(e) => setGuideSchoolFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">School</option>
                {schools.map((school) => <option key={school.id} value={school.name}>{school.name}</option>)}
              </select>
              <select value={guideDepartmentFilter} onChange={(e) => setGuideDepartmentFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">Department</option>
                {[...new Set(guides.map(g => g.departmentName).filter(Boolean))].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <button type="button" onClick={() => { setSearchName(''); setGuideDesignationFilter(''); setGuideSchoolFilter(''); setGuideDepartmentFilter(''); }} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">Clear</button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Employee ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Designation</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">School</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Specialization</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Current Scholars</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuides.map((guide) => (
                    <tr key={guide.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{guide.firstName} {guide.lastName}</td>
                      <td className="px-4 py-3">{guide.username || '-'}</td>
                      <td className="px-4 py-3">{guide.email || '-'}</td>
                      <td className="px-4 py-3">{guide.phone || '-'}</td>
                      <td className="px-4 py-3">{guide.empId}</td>
                      <td className="px-4 py-3">{DESIGNATION_LABELS[guide.designation] || guide.designation}</td>
                      <td className="px-4 py-3">{guide.schoolName}</td>
                      <td className="px-4 py-3">{guide.departmentName}</td>
                      <td className="px-4 py-3">{guide.specialization || '-'}</td>
                      <td className="px-4 py-3">{guide.currentScholarCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${guide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {guide.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => startGuideEdit(guide)} className="px-2 py-1 text-xs text-white rounded bg-[#2563EB] hover:bg-[#1D4ED8]">Edit</button>
                          <button onClick={() => handleResetPassword(guide.userId, `${guide.firstName} ${guide.lastName}`)} className="px-2 py-1 text-xs text-white rounded bg-[#F59E0B] hover:bg-[#D97706]">Reset</button>
                          <button onClick={() => handleDisableGuide(guide)} className={`px-2 py-1 text-xs text-white rounded ${guide.isActive ? 'bg-[#F87171] hover:bg-[#EF4444]' : 'bg-[#16A34A] hover:bg-[#15803D]'}`}>{guide.isActive ? 'Disable' : 'Enable'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredGuides.length === 0 && <tr><td colSpan={12} className="px-4 py-6 text-center text-gray-500">No guides found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dean of School Management Tab */}
      {activeTab === 'dean-school-management' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Dean of School</h2>
                <p className="text-xs text-gray-500 mt-1">All active and inactive school deans listed from the backend.</p>
              </div>
              <button type="button" onClick={fetchDeans} className="px-3 py-2 text-sm rounded-lg bg-dsu-maroon text-white hover:bg-dsu-maroon-hover">
                Refresh
              </button>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <input type="text" placeholder="Dean Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              <select value={deanSchoolFilter} onChange={(e) => setDeanSchoolFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                <option value="">School</option>
                {schools.map((school) => <option key={school.id} value={school.name}>{school.name}</option>)}
              </select>
              <button type="button" onClick={() => { setSearchName(''); setDeanSchoolFilter(''); }} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">Clear</button>
            </div>
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : (
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
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDeans.map((dean) => (
                      <tr key={dean.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium">{dean.firstName} {dean.lastName}</td>
                        <td className="px-4 py-3">{dean.empId || dean.username}</td>
                        <td className="px-4 py-3">{dean.username}</td>
                        <td className="px-4 py-3">{dean.email || '-'}</td>
                        <td className="px-4 py-3">{dean.phone || '-'}</td>
                        <td className="px-4 py-3">{dean.schoolName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${dean.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {dean.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => startDeanEdit(dean)} className="px-2 py-1 text-xs text-white rounded bg-[#2563EB] hover:bg-[#1D4ED8]">Edit</button>
                            <button onClick={() => handleResetPassword(dean.id, `${dean.firstName} ${dean.lastName}`)} className="px-2 py-1 text-xs text-white rounded bg-[#F59E0B] hover:bg-[#D97706]">Reset</button>
                            <button onClick={() => handleDisableDean(dean)} className={`px-2 py-1 text-xs text-white rounded ${dean.isActive ? 'bg-[#F87171] hover:bg-[#EF4444]' : 'bg-[#16A34A] hover:bg-[#15803D]'}`}>{dean.isActive ? 'Disable' : 'Enable'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredDeans.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No deans found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Student Tab */}
      {activeTab === 'add-student' && (
        <AddStudentForm
          scholarForm={scholarForm}
          setScholarForm={setScholarForm}
          schools={schools}
          departments={departments}
          handleScholarSubmit={handleScholarSubmit}
          submitting={submitting}
          editingScholar={editingScholar}
          createdScholar={createdScholar}
          showCreatedScholarBanner={showCreatedScholarBanner}
          setShowCreatedScholarBanner={setShowCreatedScholarBanner}
        />
      )}

      {/* Add Guide Tab */}
      {activeTab === 'add-guide' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserPlus className="w-5 h-5 text-dsu-maroon" />
              <h2 className="text-lg font-semibold">{editingGuide ? 'Edit Guide' : 'Add New Guide'}</h2>
            </div>
            {!editingGuide && <p className="text-xs text-gray-500 mb-4">Username = Employee ID (lowercase). Password = Date of Birth (DDMMYYYY format). Guide is created immediately.</p>}
            {editingGuide && <p className="text-xs text-amber-600 mb-4 font-medium">Editing guide: {editingGuide.firstName} {editingGuide.lastName} ({editingGuide.empId})</p>}
            <form onSubmit={handleGuideSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" value={guideForm.firstName} onChange={(e) => setGuideForm(p => ({ ...p, firstName: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={guideForm.lastName} onChange={(e) => setGuideForm(p => ({ ...p, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                  <input type="text" value={guideForm.empId} onChange={(e) => setGuideForm(p => ({ ...p, empId: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <DateInput value={guideForm.dateOfBirth} onChange={(value) => setGuideForm(p => ({ ...p, dateOfBirth: value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                  <select value={guideForm.designation} onChange={(e) => setGuideForm(p => ({ ...p, designation: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                    <option value="">Select Designation</option>
                    {Object.entries(DESIGNATION_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Scholars (Auto)</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-medium">
                    {guideMaxScholars !== null ? `${guideMaxScholars} scholars` : 'Select designation first'}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Research Specialization</label>
                <input type="text" value={guideForm.specialization} onChange={(e) => setGuideForm(p => ({ ...p, specialization: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                  <select value={guideForm.schoolId} onChange={(e) => setGuideForm(p => ({ ...p, schoolId: e.target.value, departmentId: '' }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                    <option value="">Select School</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select value={guideForm.departmentId} onChange={(e) => setGuideForm(p => ({ ...p, departmentId: e.target.value }))} required disabled={!guideForm.schoolId} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none disabled:bg-gray-100">
                    <option value="">Select Department</option>
                    {guideDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={guideForm.email} onChange={(e) => setGuideForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={guideForm.phone} onChange={(e) => setGuideForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={submittingGuide} className="w-full bg-dsu-maroon text-white py-2 px-4 rounded-lg font-medium hover:bg-dsu-maroon-hover disabled:opacity-50">
                {submittingGuide ? (editingGuide ? 'Updating...' : 'Creating...') : (editingGuide ? 'Update Guide' : 'Create Guide')}
              </button>
            </form>
          </div>
          {createdGuide && (
            <div className="bg-green-50 border border-green-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Guide Created Successfully</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <p><span className="text-gray-600">Name:</span> <span className="font-medium">{createdGuide.firstName} {createdGuide.lastName}</span></p>
                <p><span className="text-gray-600">Employee ID:</span> <span className="font-medium">{createdGuide.empId}</span></p>
                <p><span className="text-gray-600">Designation:</span> <span className="font-medium">{DESIGNATION_LABELS[createdGuide.designation] || createdGuide.designation}</span></p>
                <p><span className="text-gray-600">Username:</span> <span className="font-mono bg-white px-2 py-1 rounded">{createdGuide.username}</span></p>
                <p><span className="text-gray-600">Password:</span> <span className="font-mono bg-white px-2 py-1 rounded">DOB (DDMMYYYY)</span></p>
                <p><span className="text-gray-600">Max Scholars:</span> <span className="font-medium">{createdGuide.maxScholars}</span></p>
                <p><span className="text-gray-600">School:</span> <span className="font-medium">{createdGuide.schoolName}</span></p>
                <p><span className="text-gray-600">Department:</span> <span className="font-medium">{createdGuide.departmentName}</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Dean Tab */}
      {activeTab === 'add-dean' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="w-5 h-5 text-dsu-maroon" />
              <h2 className="text-lg font-semibold">{editingDean ? 'Edit Dean of School' : 'Add Dean of School'}</h2>
            </div>
            {!editingDean && <p className="text-xs text-gray-500 mb-4">Username = Employee ID (lowercase). Password = Date of Birth (DDMMYYYY format).</p>}
            {editingDean && <p className="text-xs text-amber-600 mb-4 font-medium">Editing dean: {editingDean.firstName} {editingDean.lastName}</p>}
            <form onSubmit={handleDeanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" value={deanForm.firstName} onChange={(e) => setDeanForm(p => ({ ...p, firstName: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={deanForm.lastName} onChange={(e) => setDeanForm(p => ({ ...p, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                  <input type="text" value={deanForm.empId} onChange={(e) => setDeanForm(p => ({ ...p, empId: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <DateInput value={deanForm.dateOfBirth} onChange={(value) => setDeanForm(p => ({ ...p, dateOfBirth: value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                <select value={deanForm.schoolId} onChange={(e) => setDeanForm(p => ({ ...p, schoolId: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none">
                  <option value="">Select School</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={deanForm.email} onChange={(e) => setDeanForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={deanForm.phone} onChange={(e) => setDeanForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={submittingDean} className="w-full bg-dsu-maroon text-white py-2 px-4 rounded-lg font-medium hover:bg-dsu-maroon-hover disabled:opacity-50">
                {submittingDean ? (editingDean ? 'Updating...' : 'Creating...') : (editingDean ? 'Update Dean of School' : 'Create Dean of School')}
              </button>
            </form>
          </div>
          {createdDean && (
            <div className="bg-green-50 border border-green-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Dean of School Created Successfully</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <p><span className="text-gray-600">Name:</span> <span className="font-medium">{createdDean.firstName} {createdDean.lastName}</span></p>
                <p><span className="text-gray-600">Employee ID:</span> <span className="font-medium">{createdDean.empId}</span></p>
                <p><span className="text-gray-600">Username:</span> <span className="font-mono bg-white px-2 py-1 rounded">{createdDean.username}</span></p>
                <p><span className="text-gray-600">Password:</span> <span className="font-mono bg-white px-2 py-1 rounded">DOB (DDMMYYYY)</span></p>
                <p><span className="text-gray-600">School:</span> <span className="font-medium">{createdDean.schoolName}</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dean of Research Management Tab */}
      {activeTab === 'dean-research-management' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Dean of Research</h2>
                <p className="text-xs text-gray-500 mt-1">There can only be one Dean of Research for the university.</p>
              </div>
              <button type="button" onClick={fetchDeanResearch} className="px-3 py-2 text-sm rounded-lg bg-dsu-maroon text-white hover:bg-dsu-maroon-hover">Refresh</button>
            </div>
            {deanResearch ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Employee ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{deanResearch.firstName} {deanResearch.lastName}</td>
                      <td className="px-4 py-3">{deanResearch.empId || deanResearch.username}</td>
                      <td className="px-4 py-3">{deanResearch.username}</td>
                      <td className="px-4 py-3">{deanResearch.email || '-'}</td>
                      <td className="px-4 py-3">{deanResearch.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${deanResearch.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {deanResearch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => startDeanEdit(deanResearch)} className="px-2 py-1 text-xs text-white rounded bg-[#2563EB] hover:bg-[#1D4ED8]">Edit</button>
                          <button onClick={() => handleResetPassword(deanResearch.id, `${deanResearch.firstName} ${deanResearch.lastName}`)} className="px-2 py-1 text-xs text-white rounded bg-[#F59E0B] hover:bg-[#D97706]">Reset</button>
                          <button onClick={() => handleDisableDean(deanResearch)} className={`px-2 py-1 text-xs text-white rounded ${deanResearch.isActive ? 'bg-[#F87171] hover:bg-[#EF4444]' : 'bg-[#16A34A] hover:bg-[#15803D]'}`}>{deanResearch.isActive ? 'Disable' : 'Enable'}</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No Dean of Research found. <button onClick={() => setSearchParams({ tab: 'add-dean-research' })} className="text-dsu-maroon underline">Add one</button></p>
            )}
          </div>
        </div>
      )}

      {/* Approved Signed Forms Tab */}
      {activeTab === 'approved-signed-forms' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Approved Signed Forms</h2>
                <p className="text-xs text-gray-500 mt-1">Scholar-wise signed documents from fully approved requests.</p>
              </div>
              <button type="button" onClick={fetchApprovedSignedForms} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-dsu-maroon text-white hover:bg-dsu-maroon-hover">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading approved signed forms...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Scholar</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Registration No</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">School</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Approved Requests</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Signed Documents</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {approvedSignedForms.map((item) => (
                      <tr key={item.scholarId} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium">{item.scholarName}</td>
                        <td className="px-4 py-3">{item.registrationNumber}</td>
                        <td className="px-4 py-3">{item.schoolName || '-'}</td>
                        <td className="px-4 py-3">{item.departmentName || '-'}</td>
                        <td className="px-4 py-3">{item.approvedRequestCount}</td>
                        <td className="px-4 py-3">{item.signedDocuments.length}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewSignedDocuments(item)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-white rounded bg-[#2563EB] hover:bg-[#1D4ED8]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View signed documents
                          </button>
                        </td>
                      </tr>
                    ))}
                    {approvedSignedForms.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No approved signed documents found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Dean of Research Tab */}
      {activeTab === 'add-dean-research' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <GraduationCap className="w-5 h-5 text-dsu-maroon" />
            <h2 className="text-lg font-semibold">Add Dean of Research</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Username = Employee ID (lowercase). Password = Date of Birth (DDMMYYYY format). Dean of Research role is university-wide. Only one Dean of Research can exist.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!deanResearchForm.dateOfBirth) { toast.error('Date of birth is required'); return; }
            setSubmittingDeanResearch(true);
            try {
              await api.post('/ri/dean-research', deanResearchForm);
              toast.success('Dean of Research created successfully');
              setDeanResearchForm({ firstName: '', lastName: '', empId: '', dateOfBirth: '', email: '', phone: '' });
              setSearchParams({ tab: 'dean-research-management' });
            } catch (err: unknown) {
              const error = err as { response?: { data?: { message?: string } } };
              toast.error(error.response?.data?.message || 'Failed to create Dean of Research');
            } finally {
              setSubmittingDeanResearch(false);
            }
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                <input type="text" required value={deanResearchForm.firstName} onChange={(e) => setDeanResearchForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                <input type="text" required value={deanResearchForm.lastName} onChange={(e) => setDeanResearchForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee ID *</label>
                <input type="text" required value={deanResearchForm.empId} onChange={(e) => setDeanResearchForm(f => ({ ...f, empId: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth *</label>
                <DateInput required value={deanResearchForm.dateOfBirth} onChange={(value) => setDeanResearchForm(f => ({ ...f, dateOfBirth: value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={deanResearchForm.email} onChange={(e) => setDeanResearchForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input type="text" value={deanResearchForm.phone} onChange={(e) => setDeanResearchForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none" />
              </div>
            </div>
            <button type="submit" disabled={submittingDeanResearch} className="px-6 py-2 bg-dsu-maroon text-white rounded-lg text-sm hover:bg-dsu-maroon-hover disabled:opacity-50">
              {submittingDeanResearch ? 'Creating...' : 'Create Dean of Research'}
            </button>
          </form>
        </div>
      )}

      {/* Scholar-Guide Mapping Tab */}
      {activeTab === 'scholar-guide-mapping' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-5 h-5 text-dsu-maroon" />
                  <h2 className="text-lg font-semibold">Scholar-Guide Mapping</h2>
                </div>
                <p className="text-xs text-gray-500">Assign or reassign scholars to guides. Every change is stored with a reason in the RI audit log.</p>
              </div>
              <button type="button" onClick={fetchScholars} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-dsu-maroon text-white hover:bg-dsu-maroon-hover">
                <RefreshCw className="w-4 h-4" />
                Refresh Scholars
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Scholar</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Registration No</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Current Guide</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">School</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scholars.map((scholar) => (
                    <tr key={scholar.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{scholar.firstName} {scholar.lastName}</td>
                      <td className="px-4 py-3">{scholar.registrationNumber}</td>
                      <td className="px-4 py-3">{scholar.guideName || '-'}</td>
                      <td className="px-4 py-3">{scholar.schoolName}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openMappingModal(scholar)} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Reassign</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {showMappingModal && mappingScholar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowMappingModal(false)} />
              <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Reassign Guide</h3>
                    <p className="text-xs text-gray-500">Scholar: {mappingScholar.firstName} {mappingScholar.lastName} ({mappingScholar.registrationNumber})</p>
                  </div>
                  <button onClick={() => setShowMappingModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Guide</label>
                    <select value={mappingGuideId} onChange={(e) => setMappingGuideId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-dsu-maroon/30">
                      <option value="">Select guide</option>
                      {mappingGuides.map((guide) => (
                        <option key={guide.id} value={guide.id}>{guide.firstName} {guide.lastName} - {guide.empId}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea value={mappingReason} onChange={(e) => setMappingReason(e.target.value)} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-dsu-maroon/30" placeholder="Explain why the mapping is being changed" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowMappingModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">Cancel</button>
                    <button type="button" onClick={handleMappingSubmit} disabled={mappingSubmitting} className="px-4 py-2 rounded-lg bg-dsu-maroon text-white hover:bg-dsu-maroon-hover disabled:opacity-50 text-sm">
                      {mappingSubmitting ? 'Saving...' : 'Save Mapping'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">R&I Office Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <CreditCard className="w-4 h-4 text-dsu-maroon mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Name</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile ? `${profile.firstName} ${profile.lastName}` : '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <Users className="w-4 h-4 text-gray-400 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Username</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.username || '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <Mail className="w-4 h-4 text-blue-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Email</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.email || '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <Phone className="w-4 h-4 text-green-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.phone || '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <Shield className="w-4 h-4 text-purple-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Role</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.roleName || 'Research & Innovation Office'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <Building2 className="w-4 h-4 text-teal-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">School</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.schoolName || '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <Building2 className="w-4 h-4 text-cyan-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Department</p><p className="font-medium text-gray-800 text-sm mt-0.5">{profile?.departmentName || '-'}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50/60 rounded-lg">
              <GraduationCap className="w-4 h-4 text-amber-500 mt-0.5" />
              <div><p className="text-xs text-gray-500 uppercase tracking-wider">Status</p><p className={`font-medium text-sm mt-0.5 ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`}>{profile?.isActive ? 'Active' : 'Inactive'}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Action Reason Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setActionModal({ open: false, type: 'disable', targetId: 0, targetName: '' }); setActionReason(''); }} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {actionModal.type === 'reset' ? 'Reset Password' : actionModal.type === 'enable' ? 'Enable Account' : 'Disable Account'}
              </h3>
              <button onClick={() => { setActionModal({ open: false, type: 'disable', targetId: 0, targetName: '' }); setActionReason(''); }} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {actionModal.type === 'reset'
                ? `Reset password for "${actionModal.targetName}" to DOB format (DDMMYYYY)?`
                : actionModal.type === 'enable'
                ? `Enable account for "${actionModal.targetName}"?`
                : `Disable account for "${actionModal.targetName}"?`}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-dsu-maroon/30"
                placeholder="Please provide a reason for this action"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setActionModal({ open: false, type: 'disable', targetId: 0, targetName: '' }); setActionReason(''); }} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">Cancel</button>
              <button type="button" onClick={confirmAction} className={`px-4 py-2 rounded-lg text-white text-sm ${actionModal.type === 'reset' ? 'bg-[#F59E0B] hover:bg-[#D97706]' : actionModal.type === 'enable' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#F87171] hover:bg-[#EF4444]'}`}>
                {actionModal.type === 'reset' ? 'Reset' : actionModal.type === 'enable' ? 'Enable' : 'Disable'}
              </button>
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
                <p className="text-sm text-gray-500">This will mark the scholar's PhD as completed, deactivate their login, and free up the guide's capacity. The scholar's data will be preserved.</p>
              )}
              {lifecycleModal.type === 'archive' && (
                <p className="text-sm text-gray-500">This will archive the scholar. Their data will be hidden from active dashboards but preserved in the database.</p>
              )}
              {lifecycleModal.type === 'purge' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-semibold">⚠️ This action is IRREVERSIBLE!</p>
                  <p className="text-sm text-red-600 mt-1">All records, documents, approvals, and uploaded files for this scholar will be permanently deleted from the database AND file system.</p>
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

      {/* Signed Documents Modal */}
      {selectedScholarSignedForms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedScholarSignedForms(null)} />
          <div className="relative w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Signed Documents</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedScholarSignedForms.scholarName} ({selectedScholarSignedForms.registrationNumber})
                </p>
              </div>
              <button onClick={() => setSelectedScholarSignedForms(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>

            {selectedScholarSignedForms.signedDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No signed documents available for this scholar.</div>
            ) : (
              <div className="space-y-3">
                {selectedScholarSignedForms.signedDocuments.map((doc: DocumentItem) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{doc.originalFileName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Category: {doc.documentCategory?.replace(/_/g, ' ')} | Uploaded: {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '-'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(doc as DocumentItem & { requestType?: string }).requestType && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            Request: {(doc as DocumentItem & { requestType?: string }).requestType?.replace(/_/g, ' ')}
                          </span>
                        )}
                        {(doc as DocumentItem & { approvedAt?: string }).approvedAt && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            Approved: {new Date((doc as DocumentItem & { approvedAt?: string }).approvedAt as string).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/v1/documents/${doc.id}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                      <a
                        href={`/api/v1/documents/${doc.id}/download`}
                        download
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => handlePrintDocument(doc.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs text-purple-700 bg-purple-50 hover:bg-purple-100"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Comprehensive Add Student Form Component
const AddStudentForm = ({ scholarForm, setScholarForm, schools, departments, handleScholarSubmit, submitting, editingScholar, createdScholar, showCreatedScholarBanner, setShowCreatedScholarBanner }: {
  scholarForm: { firstName: string; lastName: string; email: string; phone: string; registrationNumber: string; schoolId: string; departmentId: string; dateOfBirth: string; admissionDate: string; batch: string };
  setScholarForm: (fn: (p: { firstName: string; lastName: string; email: string; phone: string; registrationNumber: string; schoolId: string; departmentId: string; dateOfBirth: string; admissionDate: string; batch: string }) => { firstName: string; lastName: string; email: string; phone: string; registrationNumber: string; schoolId: string; departmentId: string; dateOfBirth: string; admissionDate: string; batch: string }) => void;
  schools: SchoolOption[];
  departments: DepartmentOption[];
  handleScholarSubmit: (additionalInfo?: Record<string, unknown>) => Promise<ScholarCreatedResponse | null>;
  submitting: boolean;
  editingScholar: Scholar | null;
  createdScholar: ScholarCreatedResponse | null;
  showCreatedScholarBanner: boolean;
  setShowCreatedScholarBanner: (show: boolean) => void;
}) => {
  const [additionalInfo, setAdditionalInfo] = useState({
    programName: 'PhD',
    degreeLevel: 'PhD',
    specialization: '',
    academicYear: '',
    semester: '',
    modeOfStudy: 'Full-time',
    aadhaarNumber: '',
    fullName: '',
    gender: '',
    nationality: 'Indian',
    placeOfBirth: '',
    bloodGroup: '',
    maritalStatus: '',
    alternateMobile: '',
    alternateEmail: '',
    permanentAddress: '',
    correspondenceAddress: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    country: 'India',
    fatherName: '',
    motherName: '',
    guardianName: '',
    guardianOccupation: '',
    guardianMobile: '',
    guardianEmail: '',
    guardianAddress: '',
    annualFamilyIncome: '',
  });

  const [qualifications, setQualifications] = useState([
    { level: '', boardUniversity: '', institution: '', degree: '', subject: '', yearOfPassing: '', rollNumber: '', percentageCgpa: '', division: '' }
  ]);
  const [stagedUploads, setStagedUploads] = useState<Record<string, StagedUploadItem>>({});
  const [uploadedCategories, setUploadedCategories] = useState<Record<string, boolean>>({});
  const [uploadingOnSubmit, setUploadingOnSubmit] = useState(false);

  const addQualification = () => {
    setQualifications(prev => [...prev, { level: '', boardUniversity: '', institution: '', degree: '', subject: '', yearOfPassing: '', rollNumber: '', percentageCgpa: '', division: '' }]);
  };

  const removeQualification = (index: number) => {
    setQualifications(prev => prev.filter((_, i) => i !== index));
  };

  const updateQualification = (index: number, field: string, value: string) => {
    setQualifications(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dsu-maroon/30 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const handleStageFile = (file: File, category: string, label: string) => {
    setStagedUploads(prev => ({ ...prev, [category]: { category, label, file } }));
  };

  const handleRemoveStagedFile = (category: string) => {
    setStagedUploads(prev => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  const submitWithUploads = async (e: React.FormEvent) => {
    e.preventDefault();
    const allAdditionalInfo = { ...additionalInfo, qualifications };

    const createResult = await handleScholarSubmit(allAdditionalInfo);
    const scholarId = createResult?.id ?? createdScholar?.id ?? null;
    if (!scholarId) {
      return;
    }

    const filesToUpload = Object.values(stagedUploads);
    if (filesToUpload.length === 0) {
      return;
    }

    setUploadingOnSubmit(true);
    try {
      for (const item of filesToUpload) {
        await riService.uploadScholarDocument(scholarId, item.file, item.category);
        setUploadedCategories(prev => ({ ...prev, [item.category]: true }));
      }
      setStagedUploads({});
      toast.success('Scholar details and documents saved successfully');
    } catch {
      toast.error('Scholar created, but one or more document uploads failed. Please re-upload missing files.');
    } finally {
      setUploadingOnSubmit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit banner */}
      {editingScholar && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium">Editing Scholar: {editingScholar.firstName} {editingScholar.lastName} ({editingScholar.registrationNumber})</p>
        </div>
      )}

      {/* Success Banner */}
      {createdScholar && !editingScholar && showCreatedScholarBanner && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">Scholar Created Successfully</h3>
            <button
              type="button"
              onClick={() => setShowCreatedScholarBanner(false)}
              className="text-sm text-green-700 hover:text-green-900"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <p><span className="text-gray-600">Name:</span> <span className="font-medium">{createdScholar.firstName} {createdScholar.lastName}</span></p>
            <p><span className="text-gray-600">Registration:</span> <span className="font-medium">{createdScholar.registrationNumber}</span></p>
            <p><span className="text-gray-600">Username:</span> <span className="font-mono bg-white px-2 py-1 rounded">{createdScholar.username}</span></p>
            <p><span className="text-gray-600">Password:</span> <span className="font-mono bg-white px-2 py-1 rounded">{createdScholar.temporaryPassword}</span></p>
            <p><span className="text-gray-600">School:</span> <span className="font-medium">{createdScholar.schoolName}</span></p>
            <p><span className="text-gray-600">Department:</span> <span className="font-medium">{createdScholar.departmentName}</span></p>
          </div>
        </div>
      )}

      <form onSubmit={submitWithUploads} className="space-y-6">
        {/* Section 1: Admission Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <span className="w-7 h-7 bg-dsu-maroon text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            Admission Details
          </h2>
          <p className="text-xs text-gray-500 mb-4">Username = Registration Number. Password = Date of Birth (DDMMYYYY).</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Registration Number *</label>
              <input type="text" value={scholarForm.registrationNumber} onChange={(e) => setScholarForm(p => ({ ...p, registrationNumber: e.target.value }))} required disabled={!!editingScholar} className={`${inputClass} disabled:bg-gray-100`} />
            </div>
            <div>
              <label className={labelClass}>Program Name</label>
              <input type="text" value={additionalInfo.programName} onChange={(e) => setAdditionalInfo(p => ({ ...p, programName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>School *</label>
              <select value={scholarForm.schoolId} onChange={(e) => setScholarForm(p => ({ ...p, schoolId: e.target.value, departmentId: '' }))} required className={inputClass}>
                <option value="">Select School</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Department *</label>
              <select value={scholarForm.departmentId} onChange={(e) => setScholarForm(p => ({ ...p, departmentId: e.target.value }))} required disabled={!scholarForm.schoolId} className={`${inputClass} disabled:bg-gray-100`}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Degree Level</label>
              <select value={additionalInfo.degreeLevel} onChange={(e) => setAdditionalInfo(p => ({ ...p, degreeLevel: e.target.value }))} className={inputClass}>
                <option value="PhD">PhD</option>
                <option value="PG">PG</option>
                <option value="UG">UG</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Specialization / Research Area</label>
              <input type="text" value={additionalInfo.specialization} onChange={(e) => setAdditionalInfo(p => ({ ...p, specialization: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Academic Year</label>
              <input type="text" value={additionalInfo.academicYear} onChange={(e) => setAdditionalInfo(p => ({ ...p, academicYear: e.target.value }))} placeholder="e.g. 2025-2026" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Admission Date</label>
              <DateInput value={scholarForm.admissionDate} onChange={(value) => setScholarForm(p => ({ ...p, admissionDate: value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Semester / Intake</label>
              <input type="text" value={additionalInfo.semester} onChange={(e) => setAdditionalInfo(p => ({ ...p, semester: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mode of Study</label>
              <select value={additionalInfo.modeOfStudy} onChange={(e) => setAdditionalInfo(p => ({ ...p, modeOfStudy: e.target.value }))} className={inputClass}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Batch</label>
              <input type="text" value={scholarForm.batch} onChange={(e) => setScholarForm(p => ({ ...p, batch: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Aadhaar Card Number</label>
              <input type="text" value={additionalInfo.aadhaarNumber} onChange={(e) => setAdditionalInfo(p => ({ ...p, aadhaarNumber: e.target.value }))} maxLength={12} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section 2: Candidate Personal Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-dsu-maroon text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            Candidate Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input type="text" value={scholarForm.firstName} onChange={(e) => setScholarForm(p => ({ ...p, firstName: e.target.value }))} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" value={scholarForm.lastName} onChange={(e) => setScholarForm(p => ({ ...p, lastName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth *</label>
              <DateInput value={scholarForm.dateOfBirth} onChange={(value) => setScholarForm(p => ({ ...p, dateOfBirth: value }))} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select value={additionalInfo.gender} onChange={(e) => setAdditionalInfo(p => ({ ...p, gender: e.target.value }))} className={inputClass}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Nationality</label>
              <input type="text" value={additionalInfo.nationality} onChange={(e) => setAdditionalInfo(p => ({ ...p, nationality: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Place of Birth</label>
              <input type="text" value={additionalInfo.placeOfBirth} onChange={(e) => setAdditionalInfo(p => ({ ...p, placeOfBirth: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select value={additionalInfo.bloodGroup} onChange={(e) => setAdditionalInfo(p => ({ ...p, bloodGroup: e.target.value }))} className={inputClass}>
                <option value="">Select</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Marital Status</label>
              <select value={additionalInfo.maritalStatus} onChange={(e) => setAdditionalInfo(p => ({ ...p, maritalStatus: e.target.value }))} className={inputClass}>
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-dsu-maroon text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            Contact Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Mobile Number</label>
              <input type="text" value={scholarForm.phone} onChange={(e) => setScholarForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Alternate Mobile</label>
              <input type="text" value={additionalInfo.alternateMobile} onChange={(e) => setAdditionalInfo(p => ({ ...p, alternateMobile: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" value={scholarForm.email} onChange={(e) => setScholarForm(p => ({ ...p, email: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Alternate Email</label>
              <input type="email" value={additionalInfo.alternateEmail} onChange={(e) => setAdditionalInfo(p => ({ ...p, alternateEmail: e.target.value }))} className={inputClass} />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Permanent Address</label>
              <textarea value={additionalInfo.permanentAddress} onChange={(e) => setAdditionalInfo(p => ({ ...p, permanentAddress: e.target.value }))} rows={2} className={inputClass} />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Correspondence / Current Address</label>
              <textarea value={additionalInfo.correspondenceAddress} onChange={(e) => setAdditionalInfo(p => ({ ...p, correspondenceAddress: e.target.value }))} rows={2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" value={additionalInfo.city} onChange={(e) => setAdditionalInfo(p => ({ ...p, city: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>District</label>
              <input type="text" value={additionalInfo.district} onChange={(e) => setAdditionalInfo(p => ({ ...p, district: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input type="text" value={additionalInfo.state} onChange={(e) => setAdditionalInfo(p => ({ ...p, state: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PIN Code</label>
              <input type="text" value={additionalInfo.pinCode} onChange={(e) => setAdditionalInfo(p => ({ ...p, pinCode: e.target.value }))} maxLength={6} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" value={additionalInfo.country} onChange={(e) => setAdditionalInfo(p => ({ ...p, country: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section 4: Academic Qualifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-dsu-maroon text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            Academic Qualification Details
          </h2>
          {qualifications.map((q, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">Qualification {index + 1}</h4>
                {qualifications.length > 1 && (
                  <button type="button" onClick={() => removeQualification(index)} className="text-xs text-red-600 hover:text-red-800">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Qualification Level</label>
                  <select value={q.level} onChange={(e) => updateQualification(index, 'level', e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    <option value="10th">10th (SSLC)</option>
                    <option value="12th">12th (HSC)</option>
                    <option value="UG">UG (Bachelor's)</option>
                    <option value="PG">PG (Master's)</option>
                    <option value="MPhil">M.Phil</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Board / University</label>
                  <input type="text" value={q.boardUniversity} onChange={(e) => updateQualification(index, 'boardUniversity', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Institution / College</label>
                  <input type="text" value={q.institution} onChange={(e) => updateQualification(index, 'institution', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Degree / Certificate</label>
                  <input type="text" value={q.degree} onChange={(e) => updateQualification(index, 'degree', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Subject / Discipline</label>
                  <input type="text" value={q.subject} onChange={(e) => updateQualification(index, 'subject', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Year of Passing</label>
                  <input type="text" value={q.yearOfPassing} onChange={(e) => updateQualification(index, 'yearOfPassing', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Roll No / Reg No</label>
                  <input type="text" value={q.rollNumber} onChange={(e) => updateQualification(index, 'rollNumber', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Percentage / CGPA / Grade</label>
                  <input type="text" value={q.percentageCgpa} onChange={(e) => updateQualification(index, 'percentageCgpa', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Division / Class</label>
                  <input type="text" value={q.division} onChange={(e) => updateQualification(index, 'division', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addQualification} className="text-sm text-dsu-maroon hover:text-dsu-maroon-hover font-medium">
            + Add Another Qualification
          </button>
        </div>

        {/* Section 5: Parent/Guardian Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-dsu-maroon text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
            Parent / Guardian Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Father's Name</label>
              <input type="text" value={additionalInfo.fatherName} onChange={(e) => setAdditionalInfo(p => ({ ...p, fatherName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mother's Name</label>
              <input type="text" value={additionalInfo.motherName} onChange={(e) => setAdditionalInfo(p => ({ ...p, motherName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Guardian Name</label>
              <input type="text" value={additionalInfo.guardianName} onChange={(e) => setAdditionalInfo(p => ({ ...p, guardianName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Occupation</label>
              <input type="text" value={additionalInfo.guardianOccupation} onChange={(e) => setAdditionalInfo(p => ({ ...p, guardianOccupation: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Guardian Mobile</label>
              <input type="text" value={additionalInfo.guardianMobile} onChange={(e) => setAdditionalInfo(p => ({ ...p, guardianMobile: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Guardian Email</label>
              <input type="email" value={additionalInfo.guardianEmail} onChange={(e) => setAdditionalInfo(p => ({ ...p, guardianEmail: e.target.value }))} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Guardian Address</label>
              <textarea value={additionalInfo.guardianAddress} onChange={(e) => setAdditionalInfo(p => ({ ...p, guardianAddress: e.target.value }))} rows={2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Annual Family Income</label>
              <input type="text" value={additionalInfo.annualFamilyIncome} onChange={(e) => setAdditionalInfo(p => ({ ...p, annualFamilyIncome: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section 6: Document Uploads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-dsu-maroon text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
            Documents Upload
          </h2>
          <p className="text-xs text-gray-500 mb-4">You can select all files now. They will be uploaded automatically once you click Add Scholar.</p>
          <DocumentUploadSection
            stagedUploads={stagedUploads}
            uploadedCategories={uploadedCategories}
            onStageFile={handleStageFile}
            onRemoveStagedFile={handleRemoveStagedFile}
            uploadingOnSubmit={uploadingOnSubmit}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="px-8 py-3 bg-dsu-maroon text-white rounded-lg font-semibold hover:bg-dsu-maroon-hover disabled:opacity-50 transition-colors">
            {submitting || uploadingOnSubmit ? 'Saving...' : editingScholar ? 'Update Scholar' : 'Add Scholar'}
          </button>
        </div>
      </form>
    </div>
  );
};

const ADMISSION_DOCUMENTS = [
  { label: 'Passport-size Photograph', category: 'PHOTOGRAPH' },
  { label: 'Scanned Signature', category: 'SCANNED_SIGNATURE' },
  { label: 'Class 10 Marksheet/Certificate', category: 'CLASS_10_MARKSHEET' },
  { label: 'Class 12 Marksheet/Certificate', category: 'CLASS_12_MARKSHEET' },
  { label: 'UG Degree Certificate', category: 'UG_DEGREE_CERTIFICATE' },
  { label: 'UG Marksheets/Transcripts', category: 'UG_MARKSHEETS' },
  { label: 'PG Degree Certificate', category: 'PG_DEGREE_CERTIFICATE' },
  { label: 'PG Marksheets/Transcripts', category: 'PG_MARKSHEETS' },
  { label: 'Address Proof (Aadhaar/PAN/Passport)', category: 'ADDRESS_PROOF' },
  { label: 'Birth Certificate', category: 'BIRTH_CERTIFICATE' },
  { label: 'Government ID Proof', category: 'GOVERNMENT_ID_PROOF' },
];

const DocumentUploadSection = ({
  stagedUploads,
  uploadedCategories,
  onStageFile,
  onRemoveStagedFile,
  uploadingOnSubmit,
}: {
  stagedUploads: Record<string, StagedUploadItem>;
  uploadedCategories: Record<string, boolean>;
  onStageFile: (file: File, category: string, label: string) => void;
  onRemoveStagedFile: (category: string) => void;
  uploadingOnSubmit: boolean;
}) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ADMISSION_DOCUMENTS.map(doc => (
        <div key={doc.category} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${uploadedCategories[doc.category] ? 'bg-green-500' : stagedUploads[doc.category] ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
          <span className="text-xs text-gray-600 flex-1">{doc.label}</span>
          {uploadingOnSubmit && stagedUploads[doc.category] ? (
            <span className="text-xs text-blue-600">Uploading...</span>
          ) : uploadedCategories[doc.category] ? (
            <span className="text-xs text-green-700">Uploaded</span>
          ) : stagedUploads[doc.category] ? (
            <button
              type="button"
              onClick={() => onRemoveStagedFile(doc.category)}
              className="text-xs text-amber-700 hover:underline"
            >
              Selected ({stagedUploads[doc.category].file.name}) - Remove
            </button>
          ) : (
            <label className="text-xs text-dsu-maroon cursor-pointer hover:underline">
              Select File
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onStageFile(f, doc.category, doc.label);
                e.target.value = '';
              }} />
            </label>
          )}
        </div>
      ))}
    </div>
  );
};

export default RiDashboard;
