import { useState, useEffect } from 'react';
import { User, Progress } from '../../types';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Circle, PartyPopper } from 'lucide-react';

interface LaunchTrackerTabProps {
  user: User;
  progress: Progress | null;
  onProgressUpdate: () => void;
}

const launchTrackerItems = [
  'Product title decided',
  'PDF outline approved',
  'Full PDF generated and downloaded',
  'Store set up on Gumroad or Payhip',
  'Product uploaded to store',
  'Price set between $17 and $27',
  'Product description added to store',
  'Cover image uploaded to store',
  'Store link added to TikTok bio',
  'Store link added to Instagram bio',
  'Store link added to Threads bio',
  'First piece of content posted',
  'First comment replied to within 1 hour',
];

const readyChecklistItems = [
  'PDF downloads correctly on my phone',
  'Store page has a cover image',
  'Product description is written',
  'Bio link goes to the right page',
  'I have posted at least one piece of content today',
  'I have replied to every comment on my last post',
];

export default function LaunchTrackerTab({ user, progress, onProgressUpdate }: LaunchTrackerTabProps) {
  const [launchChecked, setLaunchChecked] = useState<boolean[]>([]);
  const [readyChecked, setReadyChecked] = useState<boolean[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (progress) {
      setLaunchChecked(progress.launch_tracker as boolean[] || []);
      setReadyChecked(progress.ready_checklist as boolean[] || []);
    }
  }, [progress]);

  useEffect(() => {
    if (launchChecked.filter(Boolean).length === launchTrackerItems.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [launchChecked]);

  const toggleLaunchItem = async (index: number) => {
    const newChecked = [...launchChecked];
    newChecked[index] = !newChecked[index];
    setLaunchChecked(newChecked);

    await supabase
      .from('progress')
      .update({ launch_tracker: newChecked })
      .eq('user_id', user.id);
  };

  const toggleReadyItem = async (index: number) => {
    const newChecked = [...readyChecked];
    newChecked[index] = !newChecked[index];
    setReadyChecked(newChecked);

    await supabase
      .from('progress')
      .update({ ready_checklist: newChecked })
      .eq('user_id', user.id);
  };

  const launchProgress = launchChecked.filter(Boolean).length / launchTrackerItems.length * 100;

  return (
    <div className="space-y-8">
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
          <div className="text-center bg-white p-8 rounded-xl shadow-2xl">
            <PartyPopper className="w-16 h-16 text-[#C9A84C] mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-900 mb-2">You are live!</p>
            <p className="text-gray-600">Your first sale is on its way.</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Launch Tracker</h2>
        <p className="text-gray-600 mb-4">Your path from zero to first sale.</p>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(launchProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#C9A84C] h-3 rounded-full transition-all duration-300"
              style={{ width: `${launchProgress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {launchTrackerItems.map((item, index) => (
            <button
              key={index}
              onClick={() => toggleLaunchItem(index)}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              {launchChecked[index] ? (
                <CheckCircle className="w-5 h-5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-base ${launchChecked[index] ? 'text-gray-900' : 'text-gray-700'}`}>
                {item}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready To Sell Checklist</h3>
        <p className="text-gray-600 mb-4">Before you hit publish — check these.</p>

        <div className="space-y-2">
          {readyChecklistItems.map((item, index) => (
            <button
              key={index}
              onClick={() => toggleReadyItem(index)}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              {readyChecked[index] ? (
                <CheckCircle className="w-5 h-5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-base ${readyChecked[index] ? 'text-gray-900' : 'text-gray-700'}`}>
                {item}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
