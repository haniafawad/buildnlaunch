import { useState } from 'react';

export default function Admin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const checkAdmin = () => {
    if (adminPassword === 'launchroom2024') {
      setIsAdmin(true);
      setMessage('');
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('already registered')) {
          setMessage('This email already has an account. They can login directly.');
        } else {
          setMessage(data.error || 'Failed to create account');
        }
        setMessageType('error');
        return;
      }

      setMessage(data.message || `Account created for ${email}`);
      setMessageType('success');
      setEmail('');
    } catch (error: any) {
      console.error('Error:', error);
      setMessage(`Failed to connect to server. Please try again.`);
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
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
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
              <li>Create a new buyer account</li>
              <li>Auto-confirm their email</li>
              <li>Create their user profile automatically</li>
              <li>Allow them to login immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
