import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface OnboardingProps {
  user: User;
  onComplete: (user: User) => void;
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [showAudience, setShowAudience] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [error, setError] = useState('');

  const handleTopicSubmit = () => {
    if (topic.trim()) {
      setShowAudience(true);
    }
  };

  const generateTitle = async () => {
    if (!topic.trim() || !audience.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-title', {
        body: { topic, audience }
      });

      if (error) throw error;

      setGeneratedTitle(data.title);
    } catch (err) {
      console.error('Error generating title:', err);
      setError('Something went wrong — tap to try again');
      setLoading(false);
    }
  };

  const handleStartBuilding = async () => {
    if (!generatedTitle) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          topic,
          audience,
          product_title: generatedTitle,
          onboarding_complete: true
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      onComplete(data);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Something went wrong — please try again');
    }
  };

  if (generatedTitle) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <div className="border-2 border-[#C9A84C] rounded-lg p-6 mb-6 bg-white">
            <p className="text-xl font-semibold text-gray-900 mb-2">{generatedTitle}</p>
          </div>
          <p className="text-gray-600 mb-6 text-lg">
            This is your profitable product idea. Ready to build it?
          </p>
          <button
            onClick={handleStartBuilding}
            className="w-full max-w-xs bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-6 rounded-lg hover:bg-[#B8963B] transition-colors text-lg"
          >
            Start Building My PDF
          </button>
          <p className="text-sm text-gray-500 mt-4">
            You can always update this later in settings
          </p>
          {error && (
            <p className="text-red-600 mt-4">{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-xl text-gray-600">Finding your most profitable product idea...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome. Let's build your product.
          </h1>
          <p className="text-gray-600 text-lg">
            Quick question before we get started —
          </p>
        </div>

        {!showAudience ? (
          <div>
            <label className="block text-base font-medium text-gray-900 mb-3">
              What topic or problem do you want to help people with?
            </label>
            <input
              type="text"
              placeholder="e.g. saving money, losing weight, growing on TikTok..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTopicSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base mb-4"
              autoFocus
            />
            <button
              onClick={handleTopicSubmit}
              disabled={!topic.trim()}
              className="w-full bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#B8963B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              Next
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowAudience(false)}
              className="text-[#C9A84C] text-sm mb-4 hover:underline"
            >
              Back
            </button>
            <label className="block text-base font-medium text-gray-900 mb-3">
              And who do you want to help?
            </label>
            <input
              type="text"
              placeholder="e.g. busy mums, complete beginners, young professionals..."
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateTitle()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base mb-4"
              autoFocus
            />
            <button
              onClick={generateTitle}
              disabled={!audience.trim()}
              className="w-full bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#B8963B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              Build My Product Idea
            </button>
          </div>
        )}

        {error && (
          <p className="text-center text-red-600 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
