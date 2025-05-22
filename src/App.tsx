import React, { useState, useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import MobileMenu from './components/MobileMenu';
import TitleMode from './pages/TitleMode';
import WriteMode from './pages/WriteMode';
import ResearchMode from './pages/ResearchMode';
import URLMode from './pages/URLMode';
import SettingsPage from './pages/SettingsPage';
import { PenLine } from 'lucide-react';

function App() {
  const [activeMode, setActiveMode] = useState<string>('title');
  const { session } = useAppContext();

  // Update active mode to 'title' once the user is logged in
  useEffect(() => {
    if (session) {
      setActiveMode('title'); // Default to 'title' mode after login
    }
  }, [session]);

  // If no session, show the Auth component
  if (!session) {
    return <Auth onLoginSuccess={() => setActiveMode('title')} />;
  }

  // Render the content based on the active mode
  const renderContent = () => {
    switch (activeMode) {
      case 'title':
        return <TitleMode />;
      case 'write':
        return <WriteMode />;
      case 'research':
        return <ResearchMode />;
      case 'url':
        return <URLMode />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <TitleMode />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar activeMode={activeMode} setActiveMode={setActiveMode} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <PenLine className="text-indigo-600" /> BlogGenius
          </h1>
          <MobileMenu activeMode={activeMode} setActiveMode={setActiveMode} />
        </div>
        
        <div className="p-4 md:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
