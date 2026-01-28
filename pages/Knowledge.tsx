
import React from 'react';
import { IMAGES } from '../constants';

const Knowledge: React.FC = () => {
  const categories = [
    { title: '身體變化', sub: '了解生理轉變階段', icon: 'child_care', progress: 65 },
    { title: '產後心情', sub: '心理健康與情緒支持', icon: 'favorite', progress: 30, active: true },
    { title: '睡眠調整', sub: '建立寶寶與媽咪作息', icon: 'dark_mode', progress: 10 },
    { title: '育兒技巧', sub: '新手爸媽實戰指南', icon: 'stroller', progress: 85 },
  ];

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md flex items-center p-4 justify-between">
        <button className="size-10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">arrow_back_ios</span></button>
        <h1 className="text-lg font-bold">知識百科館</h1>
        <button className="size-10 rounded-full bg-peach flex items-center justify-center text-primary"><span className="material-symbols-outlined">notifications</span></button>
      </header>

      <div className="px-4 py-3">
        <div className="flex items-center bg-white border border-peach/50 rounded-full h-12 px-4 shadow-sm">
          <span className="material-symbols-outlined text-secondary">search</span>
          <input placeholder="搜尋孕期與產後知識..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2" />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="relative rounded-2xl bg-secondary p-6 overflow-hidden shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="size-12 rounded-full bg-white flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl">restaurant</span>
            </div>
            <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest">本日焦點</span>
          </div>
          <h2 className="text-white text-xl font-extrabold">營養與運動</h2>
          <p className="text-white/90 text-sm mt-1">關鍵營養補充：葉酸、碘、鐵質</p>
          <div className="flex gap-2 mt-4">
            {['葉酸', '鐵質'].map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">check_circle</span> {t}
              </span>
            ))}
          </div>
          <button className="w-full mt-6 bg-white py-3 rounded-full text-secondary font-bold text-sm shadow-sm active:scale-95 transition-all">
            閱讀完整指南
          </button>
          <div className="absolute -bottom-6 -right-6 size-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="flex justify-between items-center px-4 mt-4">
        <h3 className="text-xl font-bold">知識分類</h3>
        <button className="text-secondary text-sm font-bold">查看全部</button>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4">
        {categories.map((cat, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border flex flex-col gap-3 active:scale-95 transition-all shadow-sm ${
            cat.active ? 'bg-secondary/10 border-secondary/20' : 'bg-white border-gray-100'
          }`}>
            <div className={`size-12 rounded-full flex items-center justify-center ${cat.active ? 'bg-secondary text-white' : 'bg-peach/30 text-secondary'}`}>
              <span className="material-symbols-outlined">{cat.icon}</span>
            </div>
            <div>
              <h4 className="font-bold text-sm">{cat.title}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{cat.sub}</p>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-secondary" style={{ width: `${cat.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-4">
        <h3 className="text-xl font-bold mb-4">熱門推薦文章</h3>
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
          {[
            { title: '孕期一定要吃的五種超級食物', cat: '營養知識', img: IMAGES.NUTRITION },
            { title: '產後憂鬱與壓力舒緩的練習', cat: '心情指南', img: IMAGES.POSTPARTUM },
          ].map((art, idx) => (
            <div key={idx} className="flex-none w-64 rounded-2xl overflow-hidden bg-white shadow-md border border-peach/10">
              <div className="h-32">
                <img src={art.img} className="w-full h-full object-cover" alt={art.title} />
              </div>
              <div className="p-4">
                <p className="text-secondary font-bold text-[10px] mb-1">{art.cat}</p>
                <h4 className="text-sm font-bold line-clamp-2">{art.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
