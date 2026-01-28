
import React from 'react';

interface SyncIndicatorProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({ status }) => {
  if (status === 'idle') return null;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-300 ${
      status === 'syncing' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
    }`}>
      <span className={`material-symbols-outlined text-[14px] ${status === 'syncing' ? 'animate-spin' : ''}`}>
        {status === 'syncing' ? 'sync' : 'cloud_done'}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wider">
        {status === 'syncing' ? '雲端同步中' : '備份完成'}
      </span>
    </div>
  );
};

export default SyncIndicator;
