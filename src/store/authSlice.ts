import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  username: string | null;
  fullName: string | null;
}

const TOKEN_EXPIRY_MS = 3600000; // 1 hour

const isTokenExpired = (): boolean => {
  const loginTime = localStorage.getItem('loginTime');
  if (!loginTime) return false; // If no loginTime stored, don't expire (backward compat)
  return Date.now() - parseInt(loginTime, 10) > TOKEN_EXPIRY_MS;
};

const getValidAuthState = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return { valid: false };
  if (isTokenExpired()) {
    localStorage.clear();
    return { valid: false };
  }
  return {
    valid: true,
    accessToken: token,
    refreshToken: localStorage.getItem('refreshToken'),
    role: localStorage.getItem('role'),
    username: localStorage.getItem('username'),
    fullName: localStorage.getItem('fullName'),
  };
};

const authState = getValidAuthState();

const initialState: AuthState = {
  isAuthenticated: authState.valid,
  accessToken: authState.valid ? authState.accessToken! : null,
  refreshToken: authState.valid ? (authState.refreshToken ?? null) : null,
  role: authState.valid ? (authState.role ?? null) : null,
  username: authState.valid ? (authState.username ?? null) : null,
  fullName: authState.valid ? (authState.fullName ?? null) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
      role: string;
      username: string;
      fullName: string;
    }>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.role = action.payload.role;
      state.username = action.payload.username;
      state.fullName = action.payload.fullName;

      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('role', action.payload.role);
      localStorage.setItem('username', action.payload.username);
      localStorage.setItem('fullName', action.payload.fullName);
      localStorage.setItem('loginTime', Date.now().toString());
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.username = null;
      state.fullName = null;
      localStorage.clear();
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
