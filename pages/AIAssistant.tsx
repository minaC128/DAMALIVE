
import React, { useState, useRef, useEffect } from 'react';
import { IMAGES } from '../constants';
import { generateAIResponse } from '../services/geminiService';
import { Message } from '../types';
import { User } from '../services/firebase';
import { cloudStore } from '../services/cloudStore';

interface AIAssistantProps {
  user: User;
  onSyncStart: () => void;
  onSyncEnd: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ user, onSyncStart, onSyncEnd }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [allHistory, setAllHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'chat' | 'history'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load: Prepare a fresh chat and fetch history for the list
  useEffect(() => {
    const fetchAllData = async () => {
      const stored = await cloudStore.load(user.uid, 'chat_history');
      if (stored) {
        const formatted = stored.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        setAllHistory(formatted);
      }
      
      // Default to a fresh chat session as requested
      setMessages([{
        role: 'model',
        content: `準媽媽 ${user.displayName?.split(' ')[0]} 妳好！我是小達 🐻‍❄️ 很高興能為妳服務，今天想聊聊什麼呢？`,
        timestamp: new Date()
      }]);
      
      setIsInitialLoading(false);
    };
    fetchAllData();
  }, [user.uid]);

  useEffect(() => {
    if (scrollRef.current && viewMode === 'chat') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, viewMode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Update session messages and persistent history
    const updatedAllHistory = [...allHistory, userMessage];
    setAllHistory(updatedAllHistory);

    onSyncStart();
    await cloudStore.save(user.uid, 'chat_history', updatedAllHistory);
    onSyncEnd();

    try {
      const historyForAI = newMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await generateAIResponse(historyForAI, input);
      
      const modelMessage: Message = {
        role: 'model',
        content: response || '抱歉，我現在遇到一點問題。',
        timestamp: new Date()
      };
      
      const finalMessages = [...newMessages, modelMessage];
      setMessages(finalMessages);
      
      const finalAllHistory = [...updatedAllHistory, modelMessage];
      setAllHistory(finalAllHistory);

      onSyncStart();
      await cloudStore.save(user.uid, 'chat_history', finalAllHistory);
      onSyncEnd();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopic = (timestamp: Date) => {
    // Basic heuristic: load messages around that specific timestamp (e.g., that session)
    // For now, let's load all history but scroll to that context, or simply load full history
    setMessages(allHistory);
    setViewMode('chat');
  };

  const startNewChat = () => {
    setMessages([{
      role: 'model',
      content: `好的！我們開始一個新的話題。請問有什麼我可以幫妳的嗎？`,
      timestamp: new Date()
    }]);
    setViewMode('chat');
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background">
        <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">正在同步小達的筆記...</p>
      </div>
    );
  }

  // Filter last 7 days of unique user queries
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentQueries = allHistory
    .filter(m => m.role === 'user' && m.timestamp >= sevenDaysAgo)
    .reverse();

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* HEADER */}
      <header className="flex-none flex items-center p-4 justify-between bg-white z-20 shadow-sm">
        <button 
          onClick={() => setViewMode(viewMode === 'chat' ? 'history' : 'chat')}
          className="text-primary flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-colors"
        >
          <span className="material-symbols-outlined">
            {viewMode === 'chat' ? 'history' : 'arrow_back_ios'}
          </span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold tracking-tight text-text-main">
            {viewMode === 'chat' ? '小達助手' : '諮詢紀錄'}
          </h2>
          <div className="flex items-center gap-1">
             <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-primary font-bold uppercase tracking-widest">AI 護理師 在線中</span>
          </div>
        </div>
        <button 
          onClick={startNewChat}
          className="text-primary w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          title="新對話"
        >
          <span className="material-symbols-outlined">add_comment</span>
        </button>
      </header>

      {viewMode === 'chat' ? (
        <>
          {/* CHAT VIEW */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth no-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ paddingBottom: '20px' }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'animate-in fade-in slide-in-from-left-2'}`}>
                <div className={`size-10 rounded-full border-2 border-primary/10 overflow-hidden shrink-0 bg-white ${msg.role === 'user' ? 'hidden' : ''}`}>
                  <img src={IMAGES.BEAR_AVATAR} className="w-full h-full object-cover" alt="Avatar" />
                </div>
                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                  {msg.role === 'model' && <p className="text-primary text-[11px] font-bold ml-1 uppercase tracking-wider">小達</p>}
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-primary/5'
                  }`}>
                    {msg.content}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-pulse">
                 <div className="size-10 rounded-full border-2 border-primary/10 overflow-hidden shrink-0 bg-white">
                    <img src={IMAGES.BEAR_AVATAR} className="w-full h-full object-cover" alt="Avatar" />
                 </div>
                 <div className="p-4 bg-white rounded-2xl rounded-tl-none border border-primary/5 flex gap-1 items-center">
                   <div className="size-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                   <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                 </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="flex-none bg-white border-t border-peach/20 pb-28">
            <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              {['如何緩解背痛', '孕期營養清單', '寶寶心跳頻率'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setInput(tag)}
                  className="flex-none px-4 py-1.5 rounded-full bg-gray-50 border border-primary/5 text-primary text-[11px] font-bold shadow-sm active:bg-primary active:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-3xl px-4 py-2 border border-gray-100 shadow-inner">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="詢問小達關於懷孕的任何事..." 
                  className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-gray-400 py-2"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`size-9 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${
                    input.trim() ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* HISTORY VIEW */
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="mb-6">
            <h3 className="text-xl font-black text-text-main">最近一週紀錄</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">您可以點擊紀錄並繼續之前的對話</p>
          </div>

          {recentQueries.length > 0 ? (
            recentQueries.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => loadTopic(q.timestamp)}
                className="w-full flex flex-col gap-2 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm active:scale-[0.98] active:bg-gray-50 transition-all text-left relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                    {q.timestamp.toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-gray-300 font-bold">
                    {q.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-700 line-clamp-2 leading-relaxed">
                  「{q.content}」
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mt-1">
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  繼續諮詢話題
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
              <span className="material-symbols-outlined text-6xl text-gray-200">folder_off</span>
              <p className="text-sm font-bold text-gray-400">目前尚無最近一週的諮詢紀錄</p>
              <button 
                onClick={() => setViewMode('chat')}
                className="text-primary font-bold text-xs underline underline-offset-4"
              >
                回到對話介面
              </button>
            </div>
          )}
          
          <div className="pt-10 pb-20 text-center">
            <button 
              onClick={startNewChat}
              className="px-8 py-3 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-95"
            >
              開啟全新對話
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
