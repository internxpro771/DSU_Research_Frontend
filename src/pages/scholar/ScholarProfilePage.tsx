import { useEffect, useState } from 'react';
import { scholarService } from '../../services/dataService';
import { Scholar } from '../../types';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Calendar, Landmark, Building2, Home, BadgeCheck } from 'lucide-react';

const PROFILE_FIELD_ICONS: Record<string, React.ReactNode> = {
  'Full Name': <User className="w-4 h-4 text-dsu-maroon mt-0.5" />,
  'Registration Number': <BadgeCheck className="w-4 h-4 text-blue-600 mt-0.5" />,
  'Email': <Mail className="w-4 h-4 text-blue-500 mt-0.5" />,
  'Phone': <Phone className="w-4 h-4 text-green-600 mt-0.5" />,
  'Date of Birth': <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />,
  'Admission Date': <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />,
  'School': <Landmark className="w-4 h-4 text-purple-600 mt-0.5" />,
  'Department': <Building2 className="w-4 h-4 text-cyan-600 mt-0.5" />,
  'Permanent Address': <Home className="w-4 h-4 text-gray-600 mt-0.5" />,
  'Correspondence Address': <Home className="w-4 h-4 text-gray-600 mt-0.5" />,
};

const ScholarProfilePage = () => {
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await scholarService.getProfile();
        setScholar(profile);
      } catch {
        toast.error('Failed to load scholar profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading profile...</div>;
  }

  if (!scholar) {
    return <div className="text-center py-10 text-gray-500">Profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="font-heading text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Complete scholar details captured by R&I Office.</p>
      </div>

      <Section title="Basic Information">
        <ProfileGrid
          items={[
            ['Full Name', `${scholar.firstName} ${scholar.lastName || ''}`.trim()],
            ['Registration Number', scholar.registrationNumber],
            ['Email', scholar.email || '-'],
            ['Phone', scholar.phone || '-'],
            ['Date of Birth', scholar.dateOfBirth || '-'],
            ['Gender', scholar.gender || '-'],
            ['Nationality', scholar.nationality || '-'],
            ['Place of Birth', scholar.placeOfBirth || '-'],
            ['Blood Group', scholar.bloodGroup || '-'],
            ['Marital Status', scholar.maritalStatus || '-'],
          ]}
        />
      </Section>

      <Section title="Admission Information">
        <ProfileGrid
          items={[
            ['Program Name', scholar.programName || '-'],
            ['Degree Level', scholar.degreeLevel || '-'],
            ['Specialization', scholar.specialization || '-'],
            ['Academic Year', scholar.academicYear || '-'],
            ['Semester / Intake', scholar.semester || '-'],
            ['Mode of Study', scholar.modeOfStudy || '-'],
            ['Admission Date', scholar.admissionDate || '-'],
            ['Batch', scholar.batch || '-'],
            ['School', scholar.schoolName || '-'],
            ['Department', scholar.departmentName || '-'],
            ['Aadhaar Number', scholar.aadhaarNumber || '-'],
          ]}
        />
      </Section>

      <Section title="Contact & Address">
        <ProfileGrid
          items={[
            ['Alternate Mobile', scholar.alternateMobile || '-'],
            ['Alternate Email', scholar.alternateEmail || '-'],
            ['City', scholar.city || '-'],
            ['District', scholar.district || '-'],
            ['State', scholar.state || '-'],
            ['Pin Code', scholar.pinCode || '-'],
            ['Country', scholar.country || '-'],
          ]}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Permanent Address</p>
            <p className="font-medium text-gray-800">{scholar.permanentAddress || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Correspondence Address</p>
            <p className="font-medium text-gray-800">{scholar.correspondenceAddress || '-'}</p>
          </div>
        </div>
      </Section>

      <Section title="Parent / Guardian Details">
        <ProfileGrid
          items={[
            ['Father Name', scholar.fatherName || '-'],
            ['Mother Name', scholar.motherName || '-'],
            ['Guardian Name', scholar.guardianName || '-'],
            ['Guardian Occupation', scholar.guardianOccupation || '-'],
            ['Guardian Mobile', scholar.guardianMobile || '-'],
            ['Guardian Email', scholar.guardianEmail || '-'],
            ['Annual Family Income', scholar.annualFamilyIncome || '-'],
          ]}
        />
        <div className="mt-4 text-sm">
          <p className="text-gray-500 mb-1">Guardian Address</p>
          <p className="font-medium text-gray-800">{scholar.guardianAddress || '-'}</p>
        </div>
      </Section>

      <Section title="Academic Qualifications">
        {scholar.qualificationDetails?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-3 py-2 text-left">Level</th>
                  <th className="px-3 py-2 text-left">Board / University</th>
                  <th className="px-3 py-2 text-left">Institution</th>
                  <th className="px-3 py-2 text-left">Degree</th>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Year</th>
                  <th className="px-3 py-2 text-left">Roll No</th>
                  <th className="px-3 py-2 text-left">Score</th>
                  <th className="px-3 py-2 text-left">Division</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scholar.qualificationDetails.map((item, index) => (
                  <tr key={`${item.qualificationLevel}-${item.rollNumber}-${index}`}>
                    <td className="px-3 py-2">{item.qualificationLevel || '-'}</td>
                    <td className="px-3 py-2">{item.boardUniversityName || '-'}</td>
                    <td className="px-3 py-2">{item.institutionCollegeName || '-'}</td>
                    <td className="px-3 py-2">{item.degreeCertificateName || '-'}</td>
                    <td className="px-3 py-2">{item.subjectDiscipline || '-'}</td>
                    <td className="px-3 py-2">{item.yearOfPassing || '-'}</td>
                    <td className="px-3 py-2">{item.rollNumber || '-'}</td>
                    <td className="px-3 py-2">{item.percentageCgpaGrade || '-'}</td>
                    <td className="px-3 py-2">{item.divisionClass || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No qualification details available.</p>
        )}
      </Section>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

const ProfileGrid = ({ items }: { items: Array<[string, string]> }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
    {items.map(([label, value]) => (
      <div key={label} className="rounded-lg bg-gray-50/70 border border-gray-100 p-3">
        <div className="flex items-start gap-2">
          {PROFILE_FIELD_ICONS[label] || <User className="w-4 h-4 text-gray-400 mt-0.5" />}
          <div>
            <p className="text-gray-500">{label}</p>
            <p className="font-medium text-gray-800">{value || '-'}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default ScholarProfilePage;
