
import React, { useState } from 'react';
import { loginWithGoogle } from '../services/firebase';

const Login: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const handleMockLogin = async (data?: { name: string, email: string }) => {
    setIsLoggingIn(true);
    await loginWithGoogle(data);
    setIsLoggingIn(false);
    setShowModal(false);
  };

  const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-8 text-center relative">
      <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
        <span className="material-symbols-outlined text-primary text-5xl">child_care</span>
      </div>
      
      <h1 className="text-3xl font-black text-text-main mb-3 tracking-tight">DAMALIVE</h1>
      <p className="text-gray-500 mb-12 leading-relaxed">
        妳的專屬孕期伴侶<br/>
        開啟這段充滿愛的成長旅程
      </p>

      <button 
        onClick={() => setShowModal(true)}
        className="w-full bg-white border border-gray-200 py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition-all hover:border-peach"
      >
        <GoogleLogo />
        <span className="font-bold text-gray-700">使用 Google 帳號登入</span>
      </button>

      <p className="mt-8 text-[11px] text-gray-400 max-w-[200px]">
        登入即代表您同意我們的服務條款與隱私權政策
      </p>

      {/* Realistic Google Account Chooser Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[360px] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-8 pb-4">
              <div className="flex justify-center mb-4">
                <GoogleLogo />
              </div>
              <h2 className="text-center text-xl font-medium text-gray-900 mb-1">選擇帳戶</h2>
              <p className="text-center text-sm text-gray-600 mb-6">繼續前往 DAMALIVE</p>

              {isLoggingIn ? (
                <div className="py-12 flex flex-col items-center gap-4">
                   <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-1/2 animate-[progress_1s_infinite_linear]"></div>
                   </div>
                   <p className="text-xs text-blue-600 font-medium">正在驗證身分...</p>
                </div>
              ) : showCustomForm ? (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">姓名</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="您的姓名"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="w-full border-b border-gray-300 py-2 px-1 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Email</label>
                    <input 
                      type="email" 
                      placeholder="example@gmail.com"
                      value={customEmail}
                      onChange={e => setCustomEmail(e.target.value)}
                      className="w-full border-b border-gray-300 py-2 px-1 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={() => setShowCustomForm(false)}
                      className="text-blue-600 text-sm font-bold hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                    >
                      返回
                    </button>
                    <button 
                      onClick={() => customName && customEmail && handleMockLogin({ name: customName, email: customEmail })}
                      disabled={!customName || !customEmail}
                      className="bg-blue-600 text-white text-sm font-bold px-6 py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      確認登入
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5 -mx-8">
                  <button 
                    onClick={() => handleMockLogin()}
                    className="w-full px-8 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <div className="size-8 rounded-full overflow-hidden border">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpG9yWL_l_8M77rEUq9GkNpEHAXuVpsMnZ5RXhf21TxVJzkQz76-lpHQ_Qm8meorxPOqqBdLHIlq7CN3otV0Pbnt5CE79RgyFLgGML9CuVq6Eq749WnTkQM6NjLIk4_BPUWOG29_vRZQ8Wu_kVOzS9oQjyj_bK7IOpF5hoB9b0pJWmqtIHI-pzo5KIksTy84bJsepe4WJkgdRSrqFUkOXk-cL8tl3TiWNdDw9VRchpr-67yxyP22Hvz9QcbU8Kt9N2mfl_-9vKUA4U" alt="Sarah" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700">準媽媽 Sarah</p>
                      <p className="text-xs text-gray-500">sarah.mom@example.com</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setShowCustomForm(true)}
                    className="w-full px-8 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-t border-b border-gray-100"
                  >
                    <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <span className="material-symbols-outlined text-[20px]">account_circle</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">使用其他帳戶</p>
                  </button>
                </div>
              )}
            </div>
            {!showCustomForm && !isLoggingIn && (
              <div className="p-8 pt-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  為了繼續操作，Google 會向 DAMALIVE 分享您的姓名、電子郵件地址、語言偏好設定及個人資料相片。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default Login;
