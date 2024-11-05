import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface NewConversationModalProps {
  onClose: () => void;
  onSubmit: (username: string) => Promise<void>;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({ onClose, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isLoading) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Veuillez vous connecter pour créer une conversation');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(username);
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création de la conversation:', error);
      alert(error.message || 'Une erreur est survenue lors de la création de la conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-light rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Nouvelle conversation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur..."
              className="w-full bg-dark/50 text-white rounded-xl px-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-3 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <span>{isLoading ? 'Création...' : 'Démarrer la conversation'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}; 