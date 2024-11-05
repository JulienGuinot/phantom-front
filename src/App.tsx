import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Auth } from './components/Auth';
import { Chat } from './components/Chat';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

const App: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<string | undefined>();
  const user = useStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const initialize = useStore(state => state.initialize);
  const wsClient = useStore((state) => state.wsClient);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (wsClient && typeof wsClient.disconnect === 'function') {
        wsClient.disconnect();
      }
    };
  }, [initialize, wsClient]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-dark">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-400">Chargement de vos conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col h-screen bg-dark">
      <Navbar />
      <div className="flex-1 p-4 md:p-8">
        <div className="container mx-auto glass-effect rounded-2xl flex overflow-hidden h-full">
          <Sidebar
            onSelectContact={setSelectedContact}
            selectedContact={selectedContact}
          />
          <Chat selectedContact={selectedContact} />
        </div>
      </div>
    </div>
  );
};

export default App;