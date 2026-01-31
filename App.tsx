
import React, { useState, useEffect } from 'react';
import { AppMode, UserProfile } from './types';
import Header from './components/Header';
import VoiceMode from './components/VoiceMode';
import ChatMode from './components/ChatMode';
import Subscription from './components/Subscription';
import Login from './components/Login';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.VOICE);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminInput, setAdminInput] = useState('');

  const generateCode = () => `GHAITH-${Math.floor(1000 + Math.random() * 9000)}`;

  useEffect(() => {
    const savedUser = localStorage.getItem('ghaith_user');
    if (savedUser) {
      const parsed: UserProfile = JSON.parse(savedUser);
      const now = new Date();
      
      // Strict expiry check
      if (parsed.subscriptionExpiry && new Date(parsed.subscriptionExpiry) < now && !parsed.isAdmin) {
        if (parsed.isSubscribed) {
          parsed.isSubscribed = false;
          localStorage.setItem('ghaith_user', JSON.stringify(parsed));
          alert('انتهى اشتراكك خو/أختي. كد تجدد من صفحة الاشتراك باش يرجع غيث يتكلم معاك.');
        }
      }
      setUser(parsed);
    } else {
      setMode(AppMode.LOGIN);
    }
  }, []);

  const handleLogin = (email: string) => {
    const existing = localStorage.getItem(`user_${email}`);
    let userData: UserProfile;

    if (existing) {
      userData = JSON.parse(existing);
      // Re-verify expiry on login
      const now = new Date();
      if (userData.subscriptionExpiry && new Date(userData.subscriptionExpiry) < now && !userData.isAdmin) {
        userData.isSubscribed = false;
      }
    } else {
      // New users start with NO subscription for voice
      userData = {
        email,
        isSubscribed: false, // Voice is paid only
        subscriptionExpiry: undefined,
        paymentNoteCode: generateCode()
      };
      localStorage.setItem(`user_${email}`, JSON.stringify(userData));
    }

    setUser(userData);
    localStorage.setItem('ghaith_user', JSON.stringify(userData));
    setMode(AppMode.VOICE);
  };

  const toggleAdmin = () => {
    setShowAdminCode(true);
  };

  const checkAdminCode = (val: string) => {
    if (val === '3070') {
      const adminUser: UserProfile = {
        email: user?.email || 'admin@ghaith.ma',
        isSubscribed: true,
        isAdmin: true,
        paymentNoteCode: 'ADMIN-MODE'
      };
      setUser(adminUser);
      localStorage.setItem('ghaith_user', JSON.stringify(adminUser));
      setShowAdminCode(false);
      alert('تم تفعيل وضع المشرف. جميع الميزات مفتوحة مجاناً.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ghaith_user');
    setUser(null);
    setMode(AppMode.LOGIN);
  };

  const handleVerified = () => {
    if (!user) return;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1); // 1 Month duration
    
    const updated: UserProfile = { 
      ...user, 
      isSubscribed: true, 
      subscriptionExpiry: expiry.toISOString(),
      paymentNoteCode: generateCode()
    };
    
    setUser(updated);
    localStorage.setItem('ghaith_user', JSON.stringify(updated));
    localStorage.setItem(`user_${updated.email}`, JSON.stringify(updated));
    setMode(AppMode.VOICE);
  };

  const renderContent = () => {
    if (!user && mode !== AppMode.LOGIN) return null;

    switch (mode) {
      case AppMode.LOGIN:
        return <Login onLogin={handleLogin} />;
      case AppMode.VOICE:
        return <VoiceMode user={user!} onUpgrade={() => setMode(AppMode.SUBSCRIPTION)} />;
      case AppMode.CHAT:
        return <ChatMode user={user!} />;
      case AppMode.SUBSCRIPTION:
        return <Subscription user={user!} onBack={() => setMode(AppMode.VOICE)} onVerified={handleVerified} />;
      default:
        return <VoiceMode user={user!} onUpgrade={() => setMode(AppMode.SUBSCRIPTION)} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden">
      <Header 
        onTitleClick={toggleAdmin} 
        currentMode={mode} 
        setMode={setMode} 
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24 overflow-y-auto">
        {renderContent()}
      </main>

      {showAdminCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-slate-900 border border-purple-500/30 p-8 rounded-2xl w-full max-w-xs text-center shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-purple-400">الوصول السري</h3>
            <input 
              type="password" 
              placeholder="أدخل الرمز" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              onChange={(e) => {
                const val = e.target.value;
                setAdminInput(val);
                if (val.length === 4) checkAdminCode(val);
              }}
            />
            <button 
              onClick={() => setShowAdminCode(false)}
              className="text-slate-400 text-sm underline"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {user && mode !== AppMode.LOGIN && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 glass border-t border-white/5 flex items-center justify-around px-4 z-40">
          <button 
            onClick={() => setMode(AppMode.CHAT)}
            className={`flex flex-col items-center gap-1 transition-colors ${mode === AppMode.CHAT ? 'text-purple-400' : 'text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[10px] font-bold">الدردشة</span>
          </button>

          <button 
            onClick={() => setMode(AppMode.VOICE)}
            className={`relative -top-6 w-16 h-16 rounded-full glass border-2 flex items-center justify-center transition-all ${mode === AppMode.VOICE ? 'border-purple-500 bg-purple-600/20 scale-110' : 'border-slate-700 text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-8 h-8 ${mode === AppMode.VOICE ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <button 
            onClick={() => setMode(AppMode.SUBSCRIPTION)}
            className={`flex flex-col items-center gap-1 transition-colors ${mode === AppMode.SUBSCRIPTION ? 'text-purple-400' : 'text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-[10px] font-bold">الاشتراك</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
