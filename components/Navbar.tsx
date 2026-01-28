
import React from 'react';
import { Page } from '../types';
import SyncIndicator from './SyncIndicator';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, syncStatus }) => {
  const navItems = [
    { id: Page.HOME, icon: 'home', label: '首頁' },
    { id: Page.GROWTH, icon: 'auto_graph', label: '成長' },
    { id: Page.AI, icon: 'smart_toy', label: 'AI 助手', isMain: true },
    { id: Page.KNOWLEDGE, icon: 'menu_book', label: '百科' },
    { id: Page.PROFILE, icon: 'person', label: '我的' },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-[430px] flex flex-col z-50">
      {/* Top Floating Sync Status */}
      <div className="px-4 flex justify-end mb-2 pointer-events-none">
        <SyncIndicator status={syncStatus} />
      </div>
      
      <nav className="bg-white/95 backdrop-blur-xl border-t border-peach/30 px-4 pt-3 pb-8 flex justify-between items-end">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              item.isMain ? 'relative -top-6' : ''
            } ${currentPage === item.id ? 'text-primary' : 'text-gray-400'}`}
          >
            {item.isMain ? (
              <div className={`size-14 rounded-full shadow-lg shadow-primary/40 flex items-center justify-center transition-transform active:scale-90 ${currentPage === Page.AI ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
              </div>
            ) : (
              <span className={`material-symbols-outlined text-[24px] ${currentPage === item.id ? 'filled' : ''}`}>
                {item.icon}
              </span>
            )}
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;
