import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [checking, setChecking] = useState(true);

  const checkAdmin = async () => {
    if (adminPassword === 'launchroom2024') {
      setIsAdmin(true);
      setChecking(false);
    } else {
      setMessage('Wrong password');
    }
  };

  const handleCreateAccount = async () => {
    if (!email) return;

    setLoading(true);
    setMessage('');

    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
        options: {
          emailRedirectTo: \`\${window.location.origin}/welcome\`,
        },
      });

      if (error) throw error;

      setMessage(\`Account created! Magic link sent to \${email}\`);
      setEmail('');
    } catch (error: any) {
      console.error('Error:', error);
      if (error.message?.includes('already registered')) {
        setMessage('This email already has an account.');
      } else {
        setMessage('Something went wrong — try again');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking && !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Access</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
            />
            <button
              onClick={checkAdmin}
              className="w-full bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#B8963B] transition-colors text-base"
            >
              Enter
            </button>
            {message && (
              <p className="text-red-600 text-center">{message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Create buyer accounts</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buyer Email
            </label>
            <input
              type="email"
              placeholder="buyer@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
            />
          </div>

          <button
            onClick={handleCreateAccount}
            disabled={loading || !email}
            className="w-full bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#B8963B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Creating...' : 'Create Account & Send Magic Link'}
          </button>

          {message && (
            <p className={\`text-center \${message.includes('sent') ? 'text-green-600' : 'text-red-600'}\`}>
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            This creates a Supabase account and sends a magic link to the buyer.
            They will set their password and go through onboarding.
          </p>
        </div>
      </div>
    </div>
  );
}
