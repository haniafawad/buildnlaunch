import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { User, Progress } from '../types';
import { supabase } from '../lib/supabase';
import { Home, FileText, MessageSquare, CheckCircle, UserCircle, MessageCircle, Rocket, Settings, LogOut, Menu, X } from 'lucide-react';
import HomeTab from './tabs/HomeTab';
import PDFBuilderTab from './tabs/PDFBuilderTab';
import ContentGeneratorTab from './tabs/ContentGeneratorTab';
import LaunchTrackerTab from './tabs/LaunchTrackerTab';
import FacelessGuideTab from './tabs/FacelessGuideTab';
import AskHaniaTab from './tabs/AskHaniaTab';
import DoneForYouTab from './tabs/DoneForYouTab';
import SettingsModal from './SettingsModal';

interface DashboardProps {
  user: User;
  session: Session;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'pdf-builder', label: 'PDF Builder', icon: FileText },
  { id: 'content', label: 'Content Generator', icon: MessageSquare },
  { id: 'launch', label: 'Launch Tracker', icon: CheckCircle },
  { id: 'faceless', label: 'Faceless Guide', icon: UserCircle },
  { id: 'ask-hania', label: 'Ask Hania', icon: MessageCircle },
  { id: 'done', label: 'Done For You', icon: Rocket },
];

export default function Dashboard({ user, session }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [progress, setProgress] = useState<Progress | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [user.id]);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProgress(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab user={user} progress={progress} onNavigate={setActiveTab} />;
      case 'pdf-builder':
        return <PDFBuilderTab user={user} progress={progress} onProgressUpdate={fetchProgress} />;
      case 'content':
        return <ContentGeneratorTab user={user} progress={progress} onProgressUpdate={fetchProgress} />;
      case 'launch':
        return <LaunchTrackerTab user={user} progress={progress} onProgressUpdate={fetchProgress} />;
      case 'faceless':
        return <FacelessGuideTab />;
      case 'ask-hania':
        return <AskHaniaTab user={user} />;
      case 'done':
        return <DoneForYouTab />;
      default:
        return <HomeTab user={user} progress={progress} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 -ml-2"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-bold text-[#C9A84C] ml-2">Build & Launch System</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 bg-[#1A1A1A] flex-col">
          <nav className="flex-1 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-[#C9A84C] text-[#1A1A1A] font-semibold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMenuOpen(false)}>
            <aside
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#1A1A1A] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold text-[#C9A84C]">Menu</h2>
                <button onClick={() => setMenuOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <nav className="flex-1 py-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                        isActive
                          ? 'bg-[#C9A84C] text-[#1A1A1A] font-semibold'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {renderTab()}
          </div>
        </main>
      </div>

      {/* Bottom nav - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-gray-800 z-40">
        <div className="flex justify-around py-2">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-3 ${
                  isActive ? 'text-[#C9A84C]' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center py-1 px-3 text-gray-500"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdate={(updatedUser) => {
            // User state will be updated via the parent component
          }}
        />
      )}
    </div>
  );
}
