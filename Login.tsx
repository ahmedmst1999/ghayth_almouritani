
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      onLogin(email);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-in slide-in-from-bottom-10 duration-700">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center shadow-2xl shadow-purple-900/40 relative">
          <div className="absolute inset-0 bg-white/10 rounded-3xl animate-pulse" />
          <span className="text-5xl font-black text-white relative z-10">غ</span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">مرحباً بك في غيث</h2>
          <p className="text-slate-400">مساعدك الشخصي باللهجة الحسانية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 mr-1">البريد الإلكتروني</label>
          <input 
            type="email" 
            placeholder="example@mail.com"
            required
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <button 
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-95 transition-all"
        >
          ابدأ الآن مجاناً
        </button>
      </form>

      <div className="text-center">
        <p className="text-[10px] text-slate-500 leading-relaxed px-8">
          باستخدامك للتطبيق، أنت توافق على معالجة بياناتك الصوتية والنصية لتقديم الخدمة. لا نقوم بمشاركة بياناتك مع أطراف ثالثة.
        </p>
      </div>
    </div>
  );
};

export default Login;
