import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const checkAdmin = async () => {
    if (adminPassword === 'launchroom2024') {
      setIsAdmin(true);
    } else {
      setMessage('Wrong password');
      setMessageType('error');
    }
  };

  const handleCreateAccount = async () => {
    if (!email) return;

    setLoading(true);
    setMessage('');

    try {
      // Generate a random password that meets requirements
      const password = 'Launch' + Math.random().toString(36).slice(-8) + '!';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            from_admin: true
          }
        },
      });

      if (error) {
        console.error('Supabase signUp error:', error);
        
        if (error.message.includes('already registered')) {
          setMessage('This email already has an account. They can login directly.');
          setMessageType('error');
        } else if (error.message.includes('unable to get email')) {
          setMessage('Invalid email address — please check and try again.');
          setMessageType('error');
        } else if (error.message.includes('signup disabled')) {
          setMessage('Signups are currently disabled. Check Supabase Auth settings.');
          setMessageType('error');
        } else {
          setMessage(`Error: ${error.message}`);
          setMessageType('error');
        }
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          setMessage('This email already has an account. They can login directly.');
          setMessageType('error');
        } else if (!data.session) {
          setMessage(`Account created! A confirmation email has been sent to ${email}. The buyer must click the link to activate their account.`);
          setMessageType('success');
          setEmail('');
        } else {
          setMessage(`Account created and logged in! The buyer can now access the system with ${email}`);
          setMessageType('success');
          setEmail('');
          
          // Sign out the admin we just created (we don't want to stay logged in as them)
          await supabase.auth.signOut();
        }
      } else {
        setMessage('Account creation failed — no user returned. Please try again.');
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setMessage(`Something went wrong: ${error.message || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
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
              onKeyDown={(e) => e.key === 'Enter' && checkAdmin()}
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
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          {message && (
            <p className={`text-center text-sm ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-medium mb-2">
              This will:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create a new account in Supabase Auth</li>
              <li>• Send a confirmation email (if enabled in Supabase)</li>
              <li>• Create user profile and progress records automatically</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Need to disable email confirmation? Go to Supabase Dashboard → Authentication → Providers → Email → Disable "Confirm email"
          </p>
        </div>
      </div>
    </div>
  );
}
