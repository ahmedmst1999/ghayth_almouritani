
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { GoogleGenAI } from '@google/genai';

interface SubscriptionProps {
  user: UserProfile;
  onBack: () => void;
  onVerified: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ user, onBack, onVerified }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!file) return;
    setIsVerifying(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const now = new Date();
      const dateString = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            { text: `
              أنت نظام تحقق آلي من إيصالات الدفع البنكي لتطبيق "غيث الموريتاني".
              تحقق بدقة من الصورة بناءً على المعايير التالية:
              1. رمز الملاحظة (Note Code): يجب أن يكون مكتوباً بالضبط "${user.paymentNoteCode}".
              2. الرقم المرسل إليه: يجب أن يكون "26005365".
              3. المبلغ المالي: يجب أن يكون 100 أوقية (MRU) أو أكثر.
              4. تاريخ العملية: يجب أن يكون اليوم (${dateString}) أو خلال آخر 48 ساعة.
              
              النتيجة المطلوبة:
              - إذا تحققت كافة الشروط (الرمز، الرقم، المبلغ، التاريخ) أجب بكلمة 'VALID' فقط لا غير.
              - إذا نقص شرط واحد، اشرح السبب باختصار شديد باللهجة الحسانية الموريتانية (مثلاً: الرمز ماهو هو، المبلغ ناقص، الرقم غلط).
            ` }
          ]
        }
      });

      const responseText = result.text?.toUpperCase() || '';
      
      if (responseText.includes('VALID')) {
        onVerified();
        alert('تم التحقق بنجاح! اشتراكك مفعل لمدة شهر كامل. ميرسي ونبيك.');
      } else {
        setError(result.text || 'الإيصال غير صالح. تأكد من كتابة رمز الملاحظة الصحيح وتحويل المبلغ المطلوب.');
      }
    } catch (err) {
      console.error(err);
      setError('وقع مشكل في التحقق، حاول مرة ثانية.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyCode = () => {
    if (user.paymentNoteCode) {
      navigator.clipboard.writeText(user.paymentNoteCode);
      alert('تم نسخ الرمز: ' + user.paymentNoteCode);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      <div className="text-center">
        <h2 className="text-2xl font-black mb-2 text-white">تفعيل اشتراك غيث</h2>
        <p className="text-slate-400 text-sm">التحدث الصوتي المباشر لمدة شهر كامل</p>
      </div>

      <div className="glass p-6 rounded-3xl border-purple-500/20 shadow-xl space-y-5 bg-slate-900/40">
        <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-2xl text-center space-y-2">
          <p className="text-[10px] text-purple-300 font-bold">رمز الملاحظة الخاص بك (ضروري جداً)</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-black text-white tracking-widest">{user.paymentNoteCode}</span>
            <button onClick={copyCode} className="p-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-bold text-sm text-purple-400 border-r-2 border-purple-500 pr-2">خطوات التفعيل:</p>
          <ol className="text-xs space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white">1</span>
              <span>حول <strong className="text-white">100 MRU</strong> للرقم <strong className="text-purple-400 font-bold">26005365</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white">2</span>
              <span>أكتب الرمز <strong className="text-white bg-slate-800 px-1 rounded">{user.paymentNoteCode}</strong> في خانة الملاحظة.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white">3</span>
              <span>ارفع لقطة شاشة للوصل للمراجعة الفورية.</span>
            </li>
          </ol>
        </div>

        <div className="pt-2">
          <label className="block w-full cursor-pointer">
            <div className={`
              border-2 border-dashed rounded-2xl p-6 text-center transition-all
              ${file ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-purple-500/50 bg-slate-800/20'}
            `}>
              {file ? (
                <div className="space-y-1">
                  <p className="text-green-400 font-bold text-sm">تم اختيار الوصل ✓</p>
                  <p className="text-[10px] text-slate-500 truncate">{file.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-slate-400 text-xs">ارفع لقطة شاشة الوصل</p>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={isVerifying}
              />
            </div>
          </label>
        </div>

        {error && <p className="text-red-400 text-[11px] text-center bg-red-400/5 p-3 rounded-xl border border-red-400/20 leading-relaxed">{error}</p>}

        <button 
          onClick={handleVerify}
          disabled={!file || isVerifying}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl font-bold text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              جاري مراجعة الوصل...
            </>
          ) : 'تحقق وتفعيل الآن'}
        </button>
      </div>

      <button onClick={onBack} className="text-slate-500 text-sm font-bold flex items-center justify-center gap-2 hover:text-slate-300 transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        رجوع للرئيسية
      </button>
    </div>
  );
};

export default Subscription;
