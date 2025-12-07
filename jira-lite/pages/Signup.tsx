import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    const success = await signup({ email, name, password });
    if (success) {
      navigate('/login');
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
           </div>
           <h1 className="text-xl font-bold text-white">Join Jira Lite</h1>
           <p className="text-blue-100 text-sm mt-1">Start collaborating with your team today</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            {displayError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {displayError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
                placeholder="john@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-blue-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};