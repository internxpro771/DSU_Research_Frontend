import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppStore';
import { loginSuccess } from '../store/authSlice';
import { authService } from '../services/authService';
import { ROLE_ROUTES } from '../constants';
import { toast } from 'react-toastify';
import { User, KeyRound, Eye, EyeOff } from 'lucide-react';
import dsuLogo from '../assets/dsu-logo.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      dispatch(loginSuccess({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        role: response.role,
        username: response.username,
        fullName: response.fullName,
      }));
      toast.success('Login successful');
      navigate(ROLE_ROUTES[response.role] || '/');
    } catch {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-dsu-maroon flex-col items-center justify-between p-8 relative">
        <div className="self-start">
          <Link to="/" className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors">
            ← Home
          </Link>
        </div>

        <div className="text-center">
          <img src={dsuLogo} alt="DSU Logo" className="object-contain mx-auto mb-6" style={{ width: '900px', height: '140px' }} />
          <h1 className="text-dsu-gold font-heading text-3xl font-semibold tracking-wide leading-tight">
            DHANALAKSHMI SRINIVASAN UNIVERSITY
          </h1>
          <p className="text-white/90 text-lg mt-3 tracking-widest uppercase">PHD RESEARCH PORTAL</p>
        </div>

        <p className="text-white/50 text-xs">
          © {currentYear} Dhanalakshmi Srinivasan University
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F5F5]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative">
          {/* Pedestal base element */}
          <div className="absolute -bottom-2 left-4 right-4 h-4 bg-gray-200 rounded-b-xl -z-10"></div>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={dsuLogo} alt="DSU Logo" className="object-contain mx-auto mb-3" style={{ width: '900px', height: '140px' }} />
            <p className="text-dsu-maroon font-heading text-lg font-semibold">PHD RESEARCH PORTAL</p>
          </div>

          <h2 className="font-heading text-2xl font-bold text-gray-800 uppercase tracking-wide text-center">
            Portal Account Login
          </h2>
          <p className="text-gray-500 text-sm text-center mt-2 mb-8">Enter your credentials.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-dsu-maroon-light hover:text-dsu-maroon font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsu-maroon/20 focus:border-dsu-maroon outline-none transition-colors [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                  placeholder="Enter your password"
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-dsu-maroon focus:ring-dsu-maroon"
              />
              <span className="text-sm text-gray-600">Remember my session</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dsu-maroon hover:bg-dsu-maroon-hover text-white py-3 px-4 rounded-lg font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
