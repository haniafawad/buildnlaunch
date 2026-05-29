import { User, Progress } from '../../types';

interface HomeTabProps {
  user: User;
  progress: Progress | null;
  onNavigate: (tab: string) => void;
}

const dailyLines = [
  "Every big result started with one small decision to begin.",
  "You do not need to be perfect. You need to be consistent.",
  "The person who posts today is ahead of the person who plans tomorrow.",
  "One video. One product. One link. That is the whole business.",
  "Done is always better than perfect. Always.",
  "Someone out there needs exactly what you are about to build.",
  "Your first sale is closer than it feels right now.",
  "The only thing standing between you and your first sale is starting.",
  "Small steps every day beat big plans that never happen.",
  "You already know enough to help someone who knows less.",
  "The best time to start was a year ago. Second best is right now.",
  "Consistency is the only strategy that never fails.",
  "Your experience has value. Someone will pay for it.",
  "Progress feels invisible until suddenly it is not.",
  "One post today. One step closer.",
  "The people making money online are not smarter. They just started.",
  "Everything feels hard before it feels easy.",
  "You are building something real. That matters.",
  "Show up today even if yesterday felt like nothing happened.",
  "The algorithm rewards people who keep going. Keep going.",
  "Your audience is out there. They just have not found you yet.",
  "Done in an afternoon beats perfect in six months.",
  "Every expert was once a complete beginner. Every single one.",
  "The first sale changes everything. Go get it.",
  "You are closer than you think.",
  "One clear system beats a hundred half-finished ideas.",
  "The only failure is stopping before it works.",
  "Someone needs your product today. Go build it.",
  "This time next month everything could look completely different.",
  "You showed up today. That already puts you ahead.",
];

export default function HomeTab({ user, progress, onNavigate }: HomeTabProps) {
  const today = new Date();
  const dayIndex = today.getDate() % dailyLines.length;
  const dailyLine = dailyLines[dayIndex];

  const getCompletionStatus = () => {
    if (!progress) return { completed: 0, total: 4 };
    let completed = 0;
    if (progress.pdf_outline_approved) completed++;
    if (progress.pdf_downloaded) completed++;
    if (progress.first_content_posted) completed++;
    if (progress.launch_tracker && progress.launch_tracker.filter(Boolean).length >= 13) completed++;
    return { completed, total: 4 };
  };

  const { completed, total } = getCompletionStatus();

  const getNextStep = () => {
    if (!progress || !progress.pdf_outline_approved) return { tab: 'pdf-builder', label: 'Start Your PDF' };
    if (!progress.pdf_downloaded) return { tab: 'pdf-builder', label: 'Finish Your PDF' };
    if (!progress.first_content_posted) return { tab: 'content', label: 'Create Your First Content' };
    return { tab: 'launch', label: 'Complete Your Launch' };
  };

  const nextStep = getNextStep();

  return (
    <div className="space-y-6">
      {/* Daily one-liner */}
      <div className="bg-[#FBF6ED] border-l-4 border-[#C9A84C] p-4 rounded-r">
        <p className="text-base text-gray-800 italic">{dailyLine}</p>
      </div>

      {/* Welcome message */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back{user.first_name ? ` ${user.first_name}` : ''}
        </h2>
      </div>

      {/* Product title */}
      {user.product_title && (
        <div className="border-2 border-[#C9A84C] rounded-lg p-4 bg-white">
          <p className="text-lg font-semibold text-gray-900">{user.product_title}</p>
        </div>
      )}

      {/* Progress dots */}
      <div>
        <p className="text-sm text-gray-600 mb-3">Your progress</p>
        <div className="flex gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < completed ? 'bg-[#C9A84C]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completed === total
            ? 'All done! Your system is ready to launch'
            : `${completed} of ${total} steps completed`
          }
        </p>
      </div>

      {/* Quick action */}
      <div className="pt-4">
        <button
          onClick={() => onNavigate(nextStep.tab)}
          className="w-full max-w-xs bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-6 rounded-lg hover:bg-[#B8963B] transition-colors text-base"
        >
          {nextStep.label}
        </button>
      </div>
    </div>
  );
}
