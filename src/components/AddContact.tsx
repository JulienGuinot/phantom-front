import React, { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';

export const AddContact: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    username: string;
    publicKey: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      
      const response = await api.searchUsers(searchQuery, token);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async (user: { id: string; username: string; publicKey: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      
      await api.addContact(user.id, token);
      useStore.getState().addContact({
        id: user.id,
        username: user.username,
        publicKey: user.publicKey,
        lastSeen: Date.now()
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-light rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Ajouter un contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher par nom d'utilisateur..."
            className="w-full bg-dark/50 text-white rounded-xl px-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark"
          >
            Rechercher
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {searchResults.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-dark/50">
              <div>
                <h3 className="font-medium">{user.username}</h3>
                <p className="text-sm text-gray-400">ID: {user.id}</p>
              </div>
              <button
                onClick={() => handleAddContact(user)}
                className="p-2 rounded-full hover:bg-primary/10 text-primary"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 