import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { User, KeyRound, Calendar, Eye, EyeOff, CheckCircle } from 'lucide-react';
import DateInput from '../components/common/DateInput';
import dsuLogo from '../assets/dsu-logo.png';

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) return 'Password must contain at least 1 special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(username, dateOfBirth, newPassword);
      setSuccess(true);
      toast.success('Password reset successfully');
    } catch {
      toast.error('Invalid username or date of birth');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-1 bg-dsu-maroon flex-col items-center justify-between p-8">
          <div className="self-start">
            <Link to="/" className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors">
              ← Home
            </Link>
          </div>
          <div className="text-center">
            <img src={dsuLogo} alt="DSU Logo" className="object-contain mx-auto mb-6" style={{ width: '900px', height: '140px' }} />
            <h1 className="text-dsu-gold font-heading text-xl font-semibold tracking-wide">
              DHANALAKSHMI SRINIVASAN UNIVERSITY
            </h1>
            <p className="text-white/90 text-sm mt-2 tracking-widest uppercase">PHD RESEARCH PORTAL</p>
          </div>
          <p className="text-white/50 text-xs">© {currentYear} Dhanalakshmi Srinivasan University</p>
        </div>

        {/* Right Panel - Success */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">Password Reset Successful</h2>
            <p className="text-gray-600 mb-8">Your password has been updated. You can now sign in with your new password.</p>
            <Link
              to="/login"
              className="inline-block w-full bg-dsu-maroon hover:bg-dsu-maroon-hover text-white py-3 px-4 rounded-lg font-semibold uppercase tracking-wider transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-dsu-maroon flex-col items-center justify-between p-8">
        <div className="self-start">
          <Link to="/" className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors">
            ← Home
          </Link>
        </div>
        <div className="text-center">
          <img src={dsuLogo} alt="DSU Logo" className="object-contain mx-auto mb-6" style={{ width: '900px', height: '140px' }} />
          <h1 className="text-dsu-gold font-heading text-xl font-semibold tracking-wide">
            DHANALAKSHMI SRINIVASAN UNIVERSITY
          </h1>
          <p className="text-white/90 text-sm mt-2 tracking-widest uppercase">PHD RESEARCH PORTAL</p>
        </div>
        <p className="text-white/50 text-xs">© {currentYear} Dhanalakshmi Srinivasan University</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={dsuLogo} alt="DSU Logo" className="object-contain mx-auto mb-6" style={{ width: '900px', height: '140px' }} />
            <p className="text-dsu-maroon font-heading text-sm font-semibold">PHD RESEARCH PORTAL</p>
          </div>

          <h2 className="font-heading text-2xl font-bold text-gray-800 uppercase tracking-wide text-center">
            Reset Password
          </h2>
          <p className="text-gray-500 text-sm text-center mt-2 mb-8">Verify your identity using your date of birth</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
                  placeholder="Registration No. or Employee ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <DateInput
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
                  placeholder="Min 8 chars, 1 special character"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dsu-maroon hover:bg-dsu-maroon-hover text-white py-3 px-4 rounded-lg font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-dsu-maroon-light hover:text-dsu-maroon font-medium">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
