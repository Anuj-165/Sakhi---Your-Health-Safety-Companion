import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Heart, 
  LogOut, 
  UserCircle, 
  Mail 
} from 'lucide-react';
import api from '../api/axios';

// Define the User interface based on your FastAPI route
interface UserData {
  id: number;
  username: string;
  email: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Fetch user details
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserData(response.data);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      handleLogout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginParams = new URLSearchParams();
      loginParams.append('username', formData.username);
      loginParams.append('password', formData.password);

      const response = await api.post('/user/login', loginParams, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('token', response.data.access_token);
      await fetchUserProfile();

    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Invalid username or password';
      setError(typeof detail === 'string' ? detail : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/login');
  };

  // ---------------- Logged In View ----------------
  if (isLoggedIn && userData) {
    return (
      <div className="min-h-screen bg-calm-gradient flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-50"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary-gradient p-1 rounded-full mb-4 shadow-lg">
              <div className="bg-white p-2 rounded-full">
                <UserCircle className="h-20 w-20 text-primary" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800">
              Hello, {userData.username}!
            </h2>

            <div className="flex items-center text-gray-500 mt-2 space-x-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{userData.email}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl text-left border border-gray-100 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                User ID
              </p>
              <p className="text-gray-700 font-mono text-sm">
                #SH-{userData.id.toString().padStart(4, '0')}
              </p>
            </div>

            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 bg-primary-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              Enter Dashboard
            </button>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------------- Login Form View ----------------
  return (
    <div className="min-h-screen bg-calm-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-50">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-primary-gradient p-3 rounded-2xl shadow-lg shadow-primary/20">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <span className="font-poppins font-bold text-2xl text-primary">
                Sakhi
              </span>
            </div>

            <h2 className="font-poppins font-semibold text-2xl text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Sign in to continue your wellness journey
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 text-center font-bold"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                UserName
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-300 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-300 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
              type="submit"
              className="w-full bg-primary-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-bold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;