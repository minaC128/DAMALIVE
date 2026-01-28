
import React, { useState, useEffect } from 'react';
import { IMAGES } from '../constants';
import { User } from '../services/firebase';
import { cloudStore } from '../services/cloudStore';
import { calculatePregnancyProgress, formatDate } from '../utils/dateUtils';

interface HomeProps {
  user: User;
  onSyncStart: () => void;
  onSyncEnd: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onSyncStart, onSyncEnd }) => {
  const [activeMood, setActiveMood] = useState<string>('平靜');
  const [progress, setProgress] = useState({ weeks: 14, days: 3 });

  useEffect(() => {
    const loadData = async () => {
      const mood = await cloudStore.load(user.uid, 'daily_mood');
      if (mood) setActiveMood(mood);
      
      const settings = await cloudStore.load(user.uid, 'profile_settings');
      if (settings?.startDate) {
        setProgress(calculatePregnancyProgress(settings.startDate));
      }
    };
    loadData();
  }, [user.uid]);

  const moods = [
    { label: '愉快', img: IMAGES.MOOD_SMILE },
    { label: '疲憊', img: IMAGES.MOOD_TIRED },
    { label: '平靜', img: IMAGES.MOOD_CALM },
    { label: '焦慮', img: IMAGES.MOOD_ANXIOUS },
  ];

  const handleMoodSelect = async (label: string) => {
    setActiveMood(label);
    onSyncStart();
    
    // Save current mood
    await cloudStore.save(user.uid, 'daily_mood', label);
    
    // Update mood history for the weekly chart
    const today = formatDate(new Date());
    const history = await cloudStore.load(user.uid, 'mood_history') || [];
    const updatedHistory = [...history.filter((h: any) => h.date !== today), { date: today, mood: label }];
    // Keep only last 14 days to keep storage clean
    const trimmedHistory = updatedHistory.slice(-14);
    await cloudStore.save(user.uid, 'mood_history', trimmedHistory);
    
    onSyncEnd();
  };

  return (
    <div className="flex flex-col">
      <header className="flex items-center p-5 justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
            <img src={user.photoURL || IMAGES.USER_AVATAR} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              第 {progress.weeks} 週 {progress.days} 天
            </p>
            <h2 className="text-lg font-bold">嗨，{user.displayName?.split(' ')[0] || '準媽媽'}</h2>
          </div>
        </div>
        <button className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary hover:text-secondary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-secondary rounded-full border-2 border-white"></span>
        </button>
      </header>

      <section className="mt-4 px-5">
        <h3 className="text-xl font-bold mb-4">今天心情如何？</h3>
        <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar">
          {moods.map((mood, idx) => (
            <div 
              key={idx} 
              onClick={() => handleMoodSelect(mood.label)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${activeMood === mood.label ? 'border-secondary scale-105 shadow-lg shadow-secondary/20' : 'border-transparent shadow-sm grayscale opacity-70'}`}>
                <img src={mood.img} className="w-full h-full object-cover" alt={mood.label} />
              </div>
              <p className={`text-[13px] font-medium transition-colors ${activeMood === mood.label ? 'text-primary font-bold' : 'text-gray-400'}`}>{mood.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">每日小卡</h3>
          <span className="text-primary font-bold text-sm">查看歷史</span>
        </div>
        <div className="rounded-2xl overflow-hidden bg-white border border-peach/30 shadow-sm">
          <div className="relative aspect-video">
            <img src={IMAGES.CRIB} className="w-full h-full object-cover" alt="Daily Card" />
            <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full">
              <span className="text-primary font-bold text-[10px] tracking-widest uppercase">育兒知識</span>
            </div>
          </div>
          <div className="p-6">
            <p className="text-secondary text-xs font-bold tracking-wider mb-1 uppercase">第 10 個月：育嬰用品採買清單</p>
            <h4 className="text-2xl font-extrabold mb-3">為寶寶準備最貼心的開端</h4>
            <div className="bg-peach/10 p-4 rounded-lg italic text-gray-500 text-sm border-l-4 border-secondary mb-4">
              「開始為大日子準備生活必需品。為了心愛的小寶貝，妳做得非常出色。」
            </div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`size-6 rounded-full border-2 border-white bg-peach flex items-center justify-center text-[10px] font-bold text-white`}>
                    {i === 3 ? '+12' : ''}
                  </div>
                ))}
              </div>
              <button className="bg-primary text-white font-bold py-2 px-6 rounded-full text-sm shadow-md active:scale-95 transition-all">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 px-5 mb-10">
        <h3 className="text-xl font-bold mb-4">今日概況</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-peach/20 flex flex-col gap-2">
            <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500 text-lg">water_drop</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">飲水量</p>
            <p className="text-lg font-bold">1.2L <span className="text-xs font-normal text-gray-400">/ 2.5L</span></p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-peach/20 flex flex-col gap-2">
            <div className="size-8 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-500 text-lg">bedtime</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">睡眠時間</p>
            <p className="text-lg font-bold">7小時 20分</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
