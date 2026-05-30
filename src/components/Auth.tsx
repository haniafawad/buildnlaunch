import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error messages
        if (error.message === 'Invalid login credentials') {
          setMessage('Hmm, that email or password is not right — try again');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          setMessage('Connection error — please check your internet and try again');
        } else if (error.message.includes('JWT') || error.message.includes('API key')) {
          setMessage('Server configuration error — please contact support');
        } else {
          setMessage(error.message || 'Something went wrong — try that again');
        }
        setLoading(false);
        return;
      }

      // Success - the auth state change will redirect
      console.log('Login successful:', data.user?.email);
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      setMessage('An unexpected error occurred — please try again');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#C9A84C] mb-2">
            Build & Launch System
          </h1>
          <p className="text-gray-600 text-lg">
            Your first profitable digital product starts here
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#B8963B] transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {message && (
            <p className="text-center text-red-600 text-base">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
