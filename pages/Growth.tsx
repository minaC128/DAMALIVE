
import React, { useState } from 'react';
import { IMAGES } from '../constants';
import { User } from '../services/firebase';

// Added props interface to support standard page props passed from App.tsx
interface GrowthProps {
  user: User;
  onSyncStart: () => void;
  onSyncEnd: () => void;
}

const Growth: React.FC<GrowthProps> = () => {
  const [selectedWeek, setSelectedWeek] = useState(14);
  const weeks = [12, 13, 14, 15, 16];

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="flex items-center p-4 justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold">寶寶成長進度</h2>
        <button className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <div className="py-4">
        <div className="flex overflow-x-auto px-4 gap-4 no-scrollbar items-center">
          {weeks.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`flex-none px-6 py-2 rounded-full font-bold transition-all ${
                selectedWeek === w ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400'
              }`}
            >
              第 {w} 週
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 text-center mt-6">
        <h1 className="text-4xl font-extrabold tracking-tight">第 {selectedWeek} 週</h1>
        <p className="text-gray-500 mt-2 text-lg">妳的寶寶現在像一顆橘子一樣大喔！</p>
      </div>

      <div className="px-6 py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-peach to-secondary opacity-20 blur-3xl rounded-full scale-75"></div>
        <div className="relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white flex justify-center shadow-sm">
          <div className="w-56 h-56">
            <img src={IMAGES.ORANGE} alt="Comparison" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <div className="flex justify-around px-6 mb-8">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">估計體重</p>
          <p className="text-3xl font-bold text-primary">70 <span className="text-sm font-normal">克</span></p>
        </div>
        <div className="w-px h-10 bg-gray-200 self-center"></div>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">估計身長</p>
          <p className="text-3xl font-bold text-primary">9.1 <span className="text-sm font-normal">公分</span></p>
        </div>
      </div>

      <div className="px-6 space-y-6 mb-12">
        <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">temp_preferences_eco</span>
            <h3 className="font-bold text-lg">本週成長亮點</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            寶寶的五官更趨明顯了！現在他已經可以做出微小的面部表情，像是皺眉或瞇眼。大腦的神經連結正在快速建立中。
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/10 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 text-primary opacity-10">
            <span className="material-symbols-outlined text-8xl">lightbulb</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary filled text-xl">verified</span>
            <span className="text-primary font-bold text-xs tracking-wider uppercase">本週互動建議</span>
          </div>
          <h4 className="text-xl font-bold mb-2">跟寶寶說說話</h4>
          <p className="text-gray-700 mb-4">
            今天試著播放輕柔的旋律或對寶寶說說話。寶寶的聽力正在發展，他會慢慢熟悉媽媽溫暖的聲音。
          </p>
          <button className="bg-primary text-white font-bold py-2 px-8 rounded-full text-sm shadow-md active:scale-95 transition-all">
            了解更多
          </button>
        </div>
      </div>
    </div>
  );
};

export default Growth;
