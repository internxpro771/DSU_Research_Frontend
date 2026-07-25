export const API_BASE_URL = '/api/v1';

export const WORKFLOW_STAGES = [
  'ADMISSION',
  'NOMINATION_OF_EXPERT_MEMBERS',
  'FIRST_DAC_MEETING',
  'COMPREHENSIVE_VIVA',
  'COLLOQUIUM',
  'INCH_COMMITTEE',
  'SYNOPSIS',
  'THESIS_DEFENSE',
] as const;

export const WORKFLOW_STAGE_LABELS: Record<string, string> = {
  ADMISSION: 'Admission',
  NOMINATION_OF_EXPERT_MEMBERS: 'Nomination of Expert Members',
  FIRST_DAC_MEETING: 'First DAC Meeting',
  COMPREHENSIVE_VIVA: 'Comprehensive Viva',
  COLLOQUIUM: 'Colloquium',
  INCH_COMMITTEE: 'Inch Committee / Pre-Synopsis',
  SYNOPSIS: 'Synopsis',
  THESIS_DEFENSE: 'Thesis Defense',
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RECOMMENDED: 'Recommended',
  NOT_RECOMMENDED: 'Not Recommended',
};

export const ROLE_LABELS: Record<string, string> = {
  SCHOLAR: 'Scholar',
  GUIDE: 'Guide',
  DEAN_OF_SCHOOL: 'Dean of School',
  DEAN_OF_RESEARCH: 'Dean of Research',
  RI_OFFICE: 'R&I Office',
  REGISTRAR: 'Registrar',
  VICE_CHANCELLOR: 'Vice Chancellor',
  SUPER_ADMIN: 'Super Admin',
};

export const ROLE_ROUTES: Record<string, string> = {
  SCHOLAR: '/scholar/dashboard',
  GUIDE: '/guide/dashboard',
  DEAN_OF_SCHOOL: '/dean-school/dashboard',
  DEAN_OF_RESEARCH: '/dean-research/dashboard',
  RI_OFFICE: '/ri/dashboard',
  REGISTRAR: '/registrar/dashboard',
  VICE_CHANCELLOR: '/vc/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
};

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  INITIAL_DAC_REQUEST: 'Requisition for First DAC Meeting',
  COMPREHENSIVE_VIVA_REQUEST: 'Requisition for Comprehensive Viva Meeting',
  COLLOQUIUM_REQUEST: 'Requisition for Colloquium Meeting',
  INCH_COMMITTEE_REQUEST: 'Requisition for Inch Committee Meeting',
  SYNOPSIS_REQUEST: 'Requisition for Synopsis Meeting',
  THESIS_DEFENSE_REQUEST: 'Requisition for Thesis Defense Meeting',
  DAC_NOMINATION: 'Nomination of Expert Members',
  FIRST_DAC_MINUTES: 'Minutes of First Doctoral Committee Meeting',
  CV_MINUTES: 'Minutes of Comprehensive Viva',
  COLLOQUIUM_MINUTES: 'Minutes of Colloquium',
  COURSE_WORK: 'Course Work',
  SELF_STUDY_COURSE: 'Self-Study Course / Special Elective',
  CV_SYLLABUS: 'CV Syllabus',
  COLLOQUIUM_ATTENDANCE: 'Colloquium Attendance',
};

export const getRequestTypeLabel = (requestType: string): string => {
  return REQUEST_TYPE_LABELS[requestType] || requestType.replace(/_/g, ' ');
};
