import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

export default function SettingsModal({ user, onClose, onUpdate }: SettingsModalProps) {
  const [brandHandle, setBrandHandle] = useState(user.brand_handle || '@yourbrand');
  const [productTitle, setProductTitle] = useState(user.product_title || '');
  const [topic, setTopic] = useState(user.topic || '');
  const [audience, setAudience] = useState(user.audience || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          brand_handle: brandHandle,
          product_title: productTitle,
          topic,
          audience,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setMessage('Saved!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Something went wrong — try again');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) {
      setMessage('Something went wrong — try again');
    } else {
      setMessage('Check your email for a password reset link');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Handle
            </label>
            <input
              type="text"
              value={brandHandle}
              onChange={(e) => setBrandHandle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
            />
            <p className="text-sm text-gray-500 mt-1">
              Appears in your PDF footer
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-base"
            />
          </div>

          <div>
            <button
              onClick={handleChangePassword}
              className="text-[#C9A84C] hover:underline text-base"
            >
              Change Password
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Product Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audience
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#B8963B] transition-colors disabled:opacity-50 text-base"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {message && (
              <p className="text-center text-sm text-gray-600 mt-2">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
