
import React, { useState, useEffect } from 'react';
import { IMAGES } from '../constants';
import { User, logout } from '../services/firebase';
import EditProfileModal from '../components/EditProfileModal';
import { cloudStore } from '../services/cloudStore';
import { calculatePregnancyProgress, formatDate } from '../utils/dateUtils';
import { Message, Page } from '../types';

interface ProfileProps {
  user: User;
  onSyncStart: () => void;
  onSyncEnd: () => void;
  setCurrentPage: (page: Page) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onSyncStart, onSyncEnd, setCurrentPage }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [progress, setProgress] = useState({ weeks: 14, days: 3 });
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [moodHistory, setMoodHistory] = useState<{date: string, mood: string}[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const settings = await cloudStore.load(user.uid, 'profile_settings');
      if (settings?.startDate) setProgress(calculatePregnancyProgress(settings.startDate));
      if (settings?.dueDate) setDueDate(settings.dueDate);

      const history = await cloudStore.load(user.uid, 'chat_history');
      if (history) setChatHistory(history.slice(-5).reverse()); // Show last 5 interactions

      const moods = await cloudStore.load(user.uid, 'mood_history');
      if (moods) setMoodHistory(moods);
    };
    loadData();
  }, [user.uid, isEditOpen]);

  // Map mood label to numeric value for chart
  const moodValueMap: Record<string, number> = { '愉快': 4, '平靜': 3, '疲憊': 2, '焦慮': 1 };
  
  const renderMoodCurve = () => {
    const days = 7;
    const width = 380;
    const height = 100;
    const padding = 20;
    const points: string[] = [];
    
    const last7Days = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return formatDate(d);
    });

    last7Days.forEach((date, i) => {
      const entry = moodHistory.find(h => h.date === date);
      const val = entry ? moodValueMap[entry.mood] || 3 : 3;
      const x = (i * (width - padding * 2)) / (days - 1) + padding;
      const y = height - (val * (height - padding * 2)) / 4 - padding;
      points.push(`${x},${y}`);
    });

    const pathData = points.length > 0 ? `M ${points.join(' L ')}` : '';
    const areaData = points.length > 0 ? `M ${padding},${height} L ${points.join(' L ')} L ${width-padding},${height} Z` : '';

    return (
      <div className="bg-white p-5 rounded-3xl border border-peach/20 shadow-sm mt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px]">show_chart</span>
            本週心情趨勢
          </h4>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">最近 7 天</span>
        </div>
        
        <div className="relative h-[120px] w-full">
          <div className="absolute inset-0 flex flex-col justify-between opacity-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-gray-400" />)}
          </div>
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eeb0ac" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#eeb0ac" stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaData && <path d={areaData} fill="url(#curveGradient)" />}
            {pathData && (
              <path 
                d={pathData} 
                fill="none" 
                stroke="#eeb0ac" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="drop-shadow-sm"
              />
            )}
            {points.map((p, i) => {
              const [x, y] = p.split(',');
              return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#eeb0ac" strokeWidth="2" />;
            })}
          </svg>
          
          <div className="flex justify-between mt-2 px-1">
            {last7Days.map((d, i) => (
              <span key={i} className="text-[8px] font-bold text-gray-300">
                {d.split('-').slice(1).join('/')}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const menuItems = [
    { icon: 'favorite', label: '我的收藏', count: 12 },
    { icon: 'calendar_month', label: '重要日程', count: 3 },
    { icon: 'settings', label: '應用程式設定' },
    { icon: 'help', label: '幫助與回饋' },
  ];

  return (
    <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="bg-primary/10 px-6 pt-12 pb-8 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="size-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
            <img 
              src={user.photoURL || IMAGES.USER_AVATAR} 
              className="w-full h-full object-cover" 
              alt={user.displayName || 'User'} 
              onError={(e) => (e.currentTarget.src = IMAGES.USER_AVATAR)}
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-text-main">{user.displayName || '準媽媽'}</h2>
            <div className="flex flex-col items-center gap-1 mt-1">
               <div className="flex items-center justify-center gap-2">
                 <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
                 <p className="text-primary font-bold text-sm">懷孕第 {progress.weeks} 週 {progress.days} 天</p>
               </div>
               {dueDate && (
                 <p className="text-[10px] text-gray-500 font-bold bg-white/50 px-3 py-0.5 rounded-full border border-primary/10">
                   預產期：{new Date(dueDate).toLocaleDateString('zh-TW')}
                 </p>
               )}
            </div>
          </div>
          <button 
            onClick={() => setIsEditOpen(true)}
            className="bg-white text-primary font-bold py-2.5 px-8 rounded-full text-xs shadow-md shadow-primary/5 flex items-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span> 編輯個人資料
          </button>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
        {renderMoodCurve()}

        {/* AI Query History Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">chat_bubble</span>
              AI 諮詢紀錄
            </h3>
            <button 
              onClick={() => setCurrentPage(Page.AI)}
              className="text-primary text-[11px] font-bold"
            >
              查看全部
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {chatHistory.length > 0 ? (
              chatHistory.filter(m => m.role === 'user').map((msg, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentPage(Page.AI)}
                  className="flex-none w-[260px] p-4 bg-white rounded-2xl border border-primary/10 shadow-sm flex flex-col gap-2 relative overflow-hidden group cursor-pointer active:scale-95 active:bg-gray-50 transition-all"
                >
                  <div className="absolute -right-2 -top-2 opacity-5 text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-6xl">forum</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                    <span className="material-symbols-outlined text-primary text-[14px]">smart_toy</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">「{msg.content}」</p>
                  <p className="text-[11px] text-gray-500 line-clamp-2 italic leading-relaxed">
                    點擊以回到對話，繼續向小達詢問細節...
                  </p>
                </div>
              ))
            ) : (
              <div className="w-full py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium">尚無諮詢紀錄</p>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-3">
          {menuItems.map((item, idx) => (
            <button key={idx} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-peach/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <span className="font-bold text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.count && <span className="bg-secondary/10 text-secondary text-[10px] font-extrabold px-2 py-0.5 rounded-full">{item.count}</span>}
                <span className="material-symbols-outlined text-gray-300 text-[20px]">chevron_right</span>
              </div>
            </button>
          ))}
          
          <button 
            onClick={logout}
            className="w-full mt-4 flex items-center justify-center p-4 text-red-400 font-bold text-sm bg-red-50/50 rounded-2xl border border-red-100 active:scale-[0.98] transition-all hover:bg-red-100/50"
          >
            登出帳號
          </button>
        </div>
      </div>

      <div className="px-10 text-center opacity-30 mt-4 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest">DAMALIVE v1.3.0 • Stats & History Ready</p>
      </div>

      <EditProfileModal 
        user={user}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSyncStart={onSyncStart}
        onSyncEnd={onSyncEnd}
      />
    </div>
  );
};

export default Profile;
