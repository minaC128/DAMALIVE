
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import Home from './pages/Home';
import Growth from './pages/Growth';
import AIAssistant from './pages/AIAssistant';
import Knowledge from './pages/Knowledge';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Login from './components/Login';
import { auth, onAuthStateChanged, User } from './services/firebase';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const triggerSync = (status: 'syncing' | 'success' | 'error') => {
    setSyncStatus(status);
    if (status === 'success') {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center bg-gray-100 min-h-screen">
        <div className="relative w-full max-w-[430px] bg-background shadow-2xl overflow-hidden min-h-screen">
          <Login />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    const props = { 
      user, 
      onSyncStart: () => triggerSync('syncing'), 
      onSyncEnd: () => triggerSync('success'),
      setCurrentPage // Pass navigation capability to subpages
    };
    switch (currentPage) {
      case Page.HOME:
        return <Home {...props} />;
      case Page.GROWTH:
        return <Growth {...props} />;
      case Page.AI:
        return <AIAssistant {...props} />;
      case Page.KNOWLEDGE:
        return <Knowledge />;
      case Page.PROFILE:
        return <Profile {...props} />;
      default:
        return <Home {...props} />;
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <div className="relative w-full max-w-[430px] bg-background shadow-2xl overflow-hidden flex flex-col h-screen">
        <main className={`flex-1 flex flex-col ${currentPage === Page.AI ? 'overflow-hidden' : 'overflow-y-auto pb-24'}`}>
          {renderPage()}
        </main>
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} syncStatus={syncStatus} />
      </div>
    </div>
  );
};

export default App;
