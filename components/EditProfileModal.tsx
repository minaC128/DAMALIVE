
import React, { useState, useEffect, useRef } from 'react';
import { User, updateMockProfile } from '../services/firebase';
import { cloudStore } from '../services/cloudStore';
import { calculateDueDateFromLMP, calculateLMPFromDueDate } from '../utils/dateUtils';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSyncStart: () => void;
  onSyncEnd: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose, onSyncStart, onSyncEnd }) => {
  const [name, setName] = useState(user.displayName || '');
  const [selectedPhoto, setSelectedPhoto] = useState(user.photoURL || '');
  const [startDate, setStartDate] = useState(''); // LMP
  const [dueDate, setDueDate] = useState(''); // Expected Delivery Date
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset avatars + user's current photo
  const [presetAvatars, setPresetAvatars] = useState<string[]>([
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBpG9yWL_l_8M77rEUq9GkNpEHAXuVpsMnZ5RXhf21TxVJzkQz76-lpHQ_Qm8meorxPOqqBdLHIlq7CN3otV0Pbnt5CE79RgyFLgGML9CuVq6Eq749WnTkQM6NjLIk4_BPUWOG29_vRZQ8Wu_kVOzS9oQjyj_bK7IOpF5hoB9b0pJWmqtIHI-pzo5KIksTy84bJsepe4WJkgdRSrqFUkOXk-cL8tl3TiWNdDw9VRchpr-67yxyP22Hvz9QcbU8Kt9N2mfl_-9vKUA4U",
    "https://ui-avatars.com/api/?name=Sarah&background=eeb0ac&color=fff&size=128",
    "https://ui-avatars.com/api/?name=Mom&background=4f7870&color=fff&size=128"
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await cloudStore.load(user.uid, 'profile_settings');
      if (settings?.startDate) {
        setStartDate(settings.startDate);
        setDueDate(calculateDueDateFromLMP(settings.startDate));
      } else if (settings?.dueDate) {
        setDueDate(settings.dueDate);
        setStartDate(calculateLMPFromDueDate(settings.dueDate));
      }
      
      // If user has a custom uploaded photo, make sure it's in the list
      if (user.photoURL && !presetAvatars.includes(user.photoURL)) {
        setPresetAvatars(prev => [user.photoURL!, ...prev]);
      }
    };
    if (isOpen) loadSettings();
  }, [isOpen, user.uid, user.photoURL]);

  const handleLMPChange = (val: string) => {
    setStartDate(val);
    if (val) setDueDate(calculateDueDateFromLMP(val));
  };

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    if (val) setStartDate(calculateLMPFromDueDate(val));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedPhoto(base64);
        setPresetAvatars(prev => [base64, ...prev.filter(url => url !== base64)]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    onSyncStart();
    updateMockProfile({ displayName: name, photoURL: selectedPhoto });
    await cloudStore.save(user.uid, 'profile_settings', {
      startDate: startDate,
      dueDate: dueDate,
      updatedAt: new Date().toISOString()
    });
    onSyncEnd();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[2.5rem] shadow-2xl p-8 pb-12 animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
        
        <h3 className="text-xl font-bold mb-6 text-center">個人化設定</h3>
        
        <div className="space-y-6">
          {/* Avatar Picker with Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">頭像設定</label>
            <div className="flex gap-4 py-2 no-scrollbar overflow-x-auto">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="size-16 rounded-full shrink-0 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all bg-gray-50"
              >
                <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                <span className="text-[8px] font-bold mt-1">上傳</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              
              {presetAvatars.map((url, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedPhoto(url)}
                  className={`size-16 rounded-full shrink-0 overflow-hidden border-2 transition-all ${
                    selectedPhoto === url ? 'border-primary scale-105 shadow-md' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={url} className="w-full h-full object-cover" alt="avatar" />
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">您的暱稱</label>
            <div className="relative">
               <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
               <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="媽媽的名字"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* LMP Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">最後月經第一天 (LMP)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">event_repeat</span>
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => handleLMPChange(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-center -my-2">
               <span className="material-symbols-outlined text-gray-300">sync_alt</span>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">預計生產日期 (Due Date)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">baby_changing_station</span>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={e => handleDueDateChange(e.target.value)}
                  className="w-full bg-primary/5 border-primary/20 border-2 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
             <span className="material-symbols-outlined text-blue-500 text-[20px]">info</span>
             <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
               輸入任一日期，系統將自動為您推算懷孕週數與預產期。我們建議使用「預計生產日期」以獲得更精確的提醒。
             </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full mt-8 bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          確認更新並同步
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;
