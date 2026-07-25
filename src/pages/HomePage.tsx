import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Target,
  FileText,
  Shield,
  CheckSquare,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import dsuLogo from '../assets/dsu-logo.png';

const HomePage = () => {
  const currentYear = new Date().getFullYear();

  const phdStages = [
    { icon: <CheckSquare className="w-6 h-6" />, title: 'Admission', description: 'Registration and enrollment into the PhD program' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'First DAC Meeting', description: 'Course work approval and doctoral advisory committee formation' },
    { icon: <Award className="w-6 h-6" />, title: 'Comprehensive Viva', description: 'Oral examination to assess research readiness' },
    { icon: <Target className="w-6 h-6" />, title: 'Colloquium', description: 'Research progress presentation and peer review' },
    { icon: <FileText className="w-6 h-6" />, title: 'Inch Committee', description: 'Pre-synopsis evaluation and research completeness review' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'Synopsis', description: 'Thesis summary submission and approval' },
    { icon: <Shield className="w-6 h-6" />, title: 'Thesis Defense', description: 'Final oral defense of the doctoral thesis' },
    { icon: <GraduationCap className="w-6 h-6" />, title: 'PhD Degree', description: 'Conferment of the doctoral degree' },
  ];

  const researchDomains = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
    'Management Studies',
  ];

  return (
    <div className="min-h-screen font-body scroll-smooth">
      <header className="sticky top-0 z-30 bg-dsu-maroon/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={dsuLogo} alt="DSU Logo" className="object-contain" style={{ width: '100px', height: '50px' }} />
            <p className="text-dsu-gold font-heading text-sm tracking-wide">DSU PHD RESEARCH PORTAL</p>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/85">
            <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-dsu-gold transition-colors">About Us</a>
            <a href="#domains" onClick={(e) => { e.preventDefault(); document.getElementById('domains')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-dsu-gold transition-colors">Research Domains</a>
            <a href="#lifecycle" onClick={(e) => { e.preventDefault(); document.getElementById('lifecycle')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-dsu-gold transition-colors">PhD Lifecycle</a>
            <a href="#vision-mission" onClick={(e) => { e.preventDefault(); document.getElementById('vision-mission')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-dsu-gold transition-colors">Vision & Mission</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-dsu-maroon min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dsu-maroon via-dsu-maroon-light to-dsu-maroon opacity-90" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <img src={dsuLogo} alt="DSU Logo" className="object-contain mx-auto mb-8" style={{ width: '1200px', height: '200px' }} />
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Dhanalakshmi Srinivasan University
          </h1>
          <p className="text-dsu-gold text-xl md:text-2xl font-heading mb-8">PhD Research Portal</p>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            A comprehensive digital platform for managing the entire PhD lifecycle — from admission to degree conferment.
          </p>
          <Link
            to="/login"
            className="inline-block bg-dsu-gold hover:bg-dsu-gold-light text-dsu-maroon font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Login to Portal
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white scroll-mt-24">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold text-gray-800 mb-6">About Us</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            Dhanalakshmi Srinivasan University is committed to fostering academic excellence and cutting-edge research.
            Our PhD program provides scholars with a structured pathway for research and innovation, guided by experienced
            faculty and supported by state-of-the-art facilities. The university promotes interdisciplinary research
            that addresses real-world challenges and contributes to the advancement of knowledge.
          </p>
        </div>
      </section>

      {/* Research Domains */}
      <section id="domains" className="py-20 px-6 bg-[#F5F5F5] scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-gray-800 text-center mb-12">Research Domains</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchDomains.map((domain) => (
              <div key={domain} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-dsu-maroon/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-dsu-maroon" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-gray-800">{domain}</h3>
                <p className="text-gray-500 text-sm mt-2">Active research programs with experienced guides</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PhD Lifecycle */}
      <section id="lifecycle" className="py-20 px-6 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-gray-800 text-center mb-4">PhD Lifecycle</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            The structured journey from admission to degree conferment
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {phdStages.map((stage, index) => (
              <div key={stage.title} className="relative bg-[#F5F5F5] rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-dsu-maroon rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    {stage.icon}
                  </div>
                  <span className="text-xs font-bold text-dsu-gold bg-dsu-maroon/5 px-2 py-0.5 rounded">
                    Stage {index + 1}
                  </span>
                </div>
                <h3 className="font-heading text-base font-semibold text-gray-800 mb-1">{stage.title}</h3>
                <p className="text-gray-500 text-sm">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="vision-mission" className="py-20 px-6 bg-[#F5F5F5] scroll-mt-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-heading text-2xl font-bold text-dsu-maroon mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To be a globally recognized university that nurtures innovative researchers and thought leaders
              who contribute to the betterment of society through impactful doctoral research and academic excellence.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-heading text-2xl font-bold text-dsu-maroon mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide a supportive research ecosystem that empowers scholars with mentorship, resources, and
              a structured framework to pursue groundbreaking research, while maintaining the highest standards of
              academic integrity and scholarly excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dsu-maroon text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Contact Us - Left */}
            <div className="h-full rounded-xl border border-white/20 p-6 bg-white/5">
              <h4 className="font-heading text-xl font-semibold text-dsu-gold mb-5">Contact Us</h4>
              <div className="space-y-4 text-white/80 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-dsu-gold" />
                  <div>
                    <p>NH-45, Trichy Chennai Trunk Road,</p>
                    <p>Samayapuram (Near Samayapuram Toll Plaza),</p>
                    <p>Tiruchirappalli - 621 112.</p>
                    <p>Tamil Nadu, India.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0 text-dsu-gold" />
                  <span>Toll Free Number: 1800-5322-222</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0 text-dsu-gold" />
                  <span>+91 63841 76766 | +91 63841 76769</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0 text-dsu-gold" />
                  <a href="mailto:enquiry@dsuniversity.ac.in" className="hover:text-white transition-colors">
                    enquiry@dsuniversity.ac.in
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 flex-shrink-0 text-dsu-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href="https://www.dsuniversity.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    www.dsuniversity.ac.in
                  </a>
                </div>
              </div>
            </div>

            {/* Google Map - Right */}
            <div className="h-full rounded-xl border border-white/20 p-6 bg-white/5">
              <h4 className="font-heading text-xl font-semibold text-dsu-gold mb-5">Our Location</h4>
              <div className="rounded-xl overflow-hidden border border-white/20 shadow-lg h-[300px]">
                <iframe
                  src="https://maps.google.com/maps?q=Dhanalakshmi+Srinivasan+University,Samayapuram,Tiruchirappalli+621112&output=embed"
                  width="100%"
                  height="340"
                  style={{ border: 0, transform: 'translateY(-20px)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="DSU University Location"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 text-center text-white/50 text-sm">
            © {currentYear} Dhanalakshmi Srinivasan University. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
