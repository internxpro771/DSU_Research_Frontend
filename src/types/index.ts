export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  role: string;
  username: string;
  fullName: string;
}

export interface Scholar {
  id: number;
  userId: number;
  isActive?: boolean;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  schoolName: string;
  departmentName: string;
  dateOfBirth: string;
  admissionDate: string;
  batch: string;
  researchTitle: string;
  objectiveAndScope: string;
  guideName: string;
  guideEmpId: string;
  guideUserId: number;
  programName: string;
  degreeLevel: string;
  specialization: string;
  academicYear: string;
  semester: string;
  modeOfStudy: string;
  aadhaarNumber: string;
  gender: string;
  nationality: string;
  placeOfBirth: string;
  bloodGroup: string;
  maritalStatus: string;
  alternateMobile: string;
  alternateEmail: string;
  permanentAddress: string;
  correspondenceAddress: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianOccupation: string;
  guardianMobile: string;
  guardianEmail: string;
  guardianAddress: string;
  annualFamilyIncome: string;
  currentWorkflowStage: string;
  status?: string;
  workflowProgress: WorkflowStageProgress[];
  qualificationDetails: ScholarQualification[];
}

export interface ScholarQualification {
  qualificationLevel: string;
  boardUniversityName: string;
  institutionCollegeName: string;
  degreeCertificateName: string;
  subjectDiscipline: string;
  yearOfPassing: string;
  rollNumber: string;
  percentageCgpaGrade: string;
  divisionClass: string;
}

export interface WorkflowStageProgress {
  stageName: string;
  status: string;
  completedAt: string | null;
}

export interface GuideInfo {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  designation: string;
  empId: string;
  specialization: string;
  schoolName: string;
  departmentName: string;
  currentScholarCount: number;
  maxScholars: number;
  isAvailable: boolean;
}

export interface GuideProfileDetails {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  empId: string;
  designation: string;
  specialization: string;
  schoolName: string;
  departmentName: string;
  currentScholarCount: number;
  username: string;
}

export interface DeanProfileDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  schoolName: string;
  departmentName: string;
  role: string;
}

export interface RequestItem {
  id: number;
  requestType: string;
  scholarName: string;
  scholarRegistrationNumber: string;
  raisedByName: string;
  status: string;
  currentApproverRole: string;
  workflowStage: string;
  formData: Record<string, unknown>;
  remarks: string;
  submittedAt: string;
  completedAt: string;
  createdAt: string;
  approvals: Approval[];
  documents: DocumentItem[];
  departmentName?: string;
  schoolName?: string;
}

export interface Approval {
  id: number;
  approverRole: string;
  approverName: string;
  approvalOrder: number;
  status: string;
  comments: string;
  recommendationStatus?: string;
  actedAt: string;
}

export interface DocumentItem {
  id: number;
  uploadedById?: number;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  fileSize: number;
  documentCategory: string;
  isSigned: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  editable: boolean;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  referenceId: number;
  referenceType: string;
  isRead: boolean;
  createdAt: string;
}

export interface RiApprovedSignedFormItem {
  scholarId: number;
  scholarName: string;
  registrationNumber: string;
  schoolName: string;
  departmentName: string;
  approvedRequestCount: number;
  signedDocuments: Array<DocumentItem & {
    requestType?: string;
    approvedAt?: string;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ScholarCreatedResponse {
  id: number;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  username: string;
  temporaryPassword: string;
  schoolName: string;
  departmentName: string;
}

export interface AdminUserSummary {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  isActive: boolean;
  schoolName?: string;
  departmentName?: string;
}

export interface AdminCreateUserRequest {
  roleName: string;
  username: string;
  password: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  schoolId?: number;
  departmentId?: number;
  designation?: string;
  empId?: string;
  registrationNumber?: string;
  batch?: string;
}

export interface AdminUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  schoolId?: number;
  departmentId?: number;
  designation?: string;
  empId?: string;
  batch?: string;
}

export interface SubRequestItem {
  id: number;
  requestType: string;
  displayLabel: string;
  status: string;
  documents: DocumentItem[];
  formData?: Record<string, unknown>;
}

export interface GroupedRequestItem {
  minutesRequestId: number;
  requestType: string;
  displayTitle: string;
  status: string;
  currentApproverRole: string;
  workflowStage: string;
  scholarName: string;
  scholarRegistrationNumber: string;
  raisedByName: string;
  departmentName?: string;
  schoolName?: string;
  submittedAt: string;
  remarks?: string;
  subRequests: SubRequestItem[];
  allDocuments: DocumentItem[];
  approvals: Approval[];
  formData?: Record<string, unknown>;
}
