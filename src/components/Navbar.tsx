import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Navbar: React.FC = () => {
  const { username, logout, connectionStatus } = useStore();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'reconnecting':
        return 'text-yellow-500';
      case 'disconnected':
      default:
        return 'text-red-500';
    }
  };

  return (
    <nav className="w-full bg-dark-light bg-opacity-30 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      {/* Logo et Nom de l'application */}
      <div className="flex items-center space-x-2">
        <Shield className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold text-white">Phantom Chat</span>
      </div>
      
      {/* Indicateur de statut de connexion */}
      <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
        <span>
          {connectionStatus === 'connected' && 'Connecté'}
          {connectionStatus === 'reconnecting' && 'Reconnexion...'}
          {connectionStatus === 'disconnected' && 'Déconnecté'}
        </span>
      </div>

      {/* Liens de navigation */}
      <ul className="flex items-center space-x-6">
        <li>
          <a href="#" className="text-gray-300 hover:text-primary transition-colors">
            Accueil
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-300 hover:text-primary transition-colors">
            Contacts
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-300 hover:text-primary transition-colors">
            Paramètres
          </a>
        </li>
      </ul>

      {/* Section utilisateur */}
      <div className="flex items-center space-x-4">
        {username && (
          <span className="text-gray-300">Bonjour, {username}</span>
        )}
        <button
          onClick={logout}
          className="flex items-center space-x-1 text-gray-300 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </nav>
  );
}; 