import React, { useState, useEffect } from 'react';
import { Task, HistoryLog, ChatMessage, UserProfile, AI_NAME, INSTAGRAM_LINK } from './types';
import { TaskList, ChatWidget, StatsView, Card, ProgressBar } from './components/Components';
import { generateTextResponse, playMotivator } from './services/gemini';
import { Settings, LogOut, Moon, Sun, Dumbbell, BookOpen, Laptop, Power, Target, History } from 'lucide-react';

// --- Animated Loading Screen ---
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[100] flex flex-col items-center justify-center transition-all duration-500">
    <div className="relative mb-8">
      <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-ping absolute inset-0"></div>
      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center relative z-10 shadow-xl">
         <Dumbbell className="text-white w-10 h-10 animate-bounce" />
      </div>
    </div>
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Elevate1401</h1>
    <p className="text-blue-500 animate-pulse">Preparing your growth journey...</p>
  </div>
);

// --- Focus Mode Overlay ---
const FocusOverlay = ({ isActive, onExit }: { isActive: boolean; onExit: () => void }) => {
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 bg-gray-900 z-[60] flex flex-col items-center justify-center text-white p-6">
      <h2 className="text-4xl font-bold mb-8 tracking-widest">FOCUS MODE</h2>
      <p className="text-gray-400 mb-12 text-center max-w-md">Distractions are hidden. Only you and your goals remain.</p>
      <div className="animate-pulse mb-12 text-6xl">
        <Target size={80} />
      </div>
      <button 
        onClick={onExit}
        className="border border-white/20 hover:bg-white/10 px-8 py-3 rounded-full transition-all text-sm tracking-wider"
      >
        EXIT FOCUS
      </button>
    </div>
  );
};

// --- Auth / Onboarding ---
const AuthScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full py-10 px-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Elevate1401</h1>
        <p className="text-center text-gray-500 mb-8">Powered by {AI_NAME}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What should we call you?</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              placeholder="e.g. Pranto"
            />
          </div>
          <button 
            onClick={() => name && onLogin(name)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95"
          >
            Start Journey
          </button>
          <div className="mt-4 text-center">
            <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-blue-500 transition-colors">
              Follow Creator
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  // Initialize from LocalStorage
  useEffect(() => {
    setTimeout(() => {
      const savedUser = localStorage.getItem('elevate_user');
      const savedTasks = localStorage.getItem('elevate_tasks');
      const savedHistory = localStorage.getItem('elevate_history');
      const savedChat = localStorage.getItem('elevate_chat');

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedChat) setChatMessages(JSON.parse(savedChat));

      // Theme initialization
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.preferences.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }

      setLoading(false);
    }, 2000); // Fake load time for animation
  }, []);

  // Persistence Effects
  useEffect(() => { if (user) localStorage.setItem('elevate_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('elevate_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('elevate_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('elevate_chat', JSON.stringify(chatMessages)); }, [chatMessages]);

  const toggleTheme = () => {
    if (!user) return;
    const newTheme = user.preferences.theme === 'light' ? 'dark' : 'light';
    setUser({ ...user, preferences: { ...user.preferences, theme: newTheme } });
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLogin = (name: string) => {
    const newUser: UserProfile = {
      name,
      isLoggedIn: true,
      onboarded: true,
      preferences: { theme: 'light', voice: 'female', notifications: true }
    };
    setUser(newUser);
    // Welcome message from AI
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      role: 'model',
      text: `Hello ${name}! I am ${AI_NAME}. I'm here to push you to your limits and celebrate your wins. Let's get to work.`,
      timestamp: new Date().toISOString()
    };
    setChatMessages([welcomeMsg]);
    playMotivator(`Welcome ${name}. I am ready.`, 'female');
  };

  const endDay = () => {
    if (tasks.length === 0) return;

    const totalGoal = tasks.reduce((sum, t) => sum + t.goal, 0);
    const totalDone = tasks.reduce((sum, t) => sum + t.completed, 0);
    const rate = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;

    const log: HistoryLog = {
      date: new Date().toISOString().split('T')[0],
      tasks: [...tasks],
      completionRate: rate
    };

    setHistory([log, ...history]);
    
    // Reset tasks for tomorrow
    const resetTasks = tasks.map(t => ({ ...t, completed: 0, lastUpdated: new Date().toISOString() }));
    setTasks(resetTasks);

    // AI Celebration/Judgment
    setIsChatOpen(true);
    const msg = `Ending the day with ${rate}% completion. ${rate > 80 ? "Excellent work!" : rate > 50 ? "Solid effort, but we can do better." : "We need to step it up tomorrow."}`;
    
    const aiMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'model',
      text: msg,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, aiMsg]);
    playMotivator(msg, user?.preferences.voice || 'female');
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiThinking(true);

    const responseText = await generateTextResponse(text, tasks, history, user?.preferences.voice || 'female');
    
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, aiMsg]);
    setIsAiThinking(false);
    
    // Auto-read response if it's short or explicitly motivational
    if (responseText.length < 100 || responseText.toLowerCase().includes('congratulations') || responseText.toLowerCase().includes('push')) {
        playMotivator(responseText, user?.preferences.voice || 'female');
    }
  };

  const handleTaskComplete = (task: Task) => {
    // Motivation popup logic could go here, or just a quick voice note
    if (user?.preferences.notifications) {
        playMotivator(`Task ${task.title} completed. Great job!`, user?.preferences.voice || 'female');
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user || !user.isLoggedIn) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans overflow-x-hidden">
      <FocusOverlay isActive={focusMode} onExit={() => setFocusMode(false)} />

      {/* Background Animated Icons */}
      <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden z-0">
         <BookOpen className="absolute top-20 left-10 w-24 h-24 animate-bounce duration-[3000ms]" />
         <Dumbbell className="absolute bottom-40 right-20 w-32 h-32 animate-pulse duration-[4000ms]" />
         <Laptop className="absolute top-1/2 left-1/3 w-16 h-16 animate-bounce duration-[5000ms]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex flex-col h-screen">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Elevate1401</h1>
            <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setFocusMode(true)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="Focus Mode"
            >
              <Target size={20} />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {user.preferences.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Tab Nav (Mobile Friendly) */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
            <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`pb-2 px-4 font-medium transition-colors relative ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
            >
                Dashboard
                {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
            </button>
             <button 
                onClick={() => setActiveTab('history')} 
                className={`pb-2 px-4 font-medium transition-colors relative ${activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
            >
                History
                {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
            {activeTab === 'dashboard' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                         <StatsView history={history} tasks={tasks} />
                         <div className="flex justify-end">
                            <button 
                                onClick={endDay}
                                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Power size={18} /> End Day & Archive
                            </button>
                         </div>
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <TaskList 
                            tasks={tasks} 
                            onUpdate={setTasks} 
                            onComplete={handleTaskComplete}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <History className="text-blue-500" /> Past Logs
                    </h2>
                    {history.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No history available yet.</p>
                    ) : (
                        history.map((log, idx) => (
                            <Card key={idx} className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <div className="text-sm text-gray-400">{log.date}</div>
                                    <div className="font-bold text-lg">{log.tasks.length} Goals Tracked</div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-1/2">
                                     <div className="flex-1">
                                        <ProgressBar percentage={log.completionRate} />
                                     </div>
                                     <div className="font-mono font-bold text-xl">{log.completionRate}%</div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <p>Elevate1401 © {new Date().getFullYear()}</p>
            <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">
                Created by {user.name === 'Pranto' ? 'You' : 'Pranto Rahman'}
            </a>
        </footer>

        {/* Chat Widget */}
        <ChatWidget 
            messages={chatMessages} 
            onSendMessage={handleSendMessage} 
            isLoading={isAiThinking}
            isOpen={isChatOpen}
            setIsOpen={setIsChatOpen}
            voiceGender={user.preferences.voice}
            setVoiceGender={(v) => setUser({...user, preferences: {...user.preferences, voice: v}})}
        />

      </div>
    </div>
  );
}