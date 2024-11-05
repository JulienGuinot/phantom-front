import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

type AuthMode = 'login' | 'register';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          alert('Les mots de passe ne correspondent pas');
          return;
        }
        await register(username, password);
        setMode('login');
      } else if (mode === 'login') {
        await login(username, password);
      }
      
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Phantom Chat</h1>
          <p className="text-gray-400">Messagerie Sécurisée E2E</p>
        </div>

        <div className="glass-effect rounded-2xl p-8">
          {mode === 'register' && (
            <div className="mb-6 p-4 bg-yellow-500/10 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-yellow-200">
                Important : Votre mot de passe ne peut pas être récupéré. 
                Conservez-le en lieu sûr. Il est utilisé pour chiffrer vos messages.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-light/50 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-light/50 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-dark-light/50 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-3 flex items-center justify-center space-x-2 transition-colors"
            >
              <Lock className="w-5 h-5" />
              <span>{mode === 'register' ? "S'inscrire" : "Se connecter"}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              {mode === 'register' 
                ? "Déjà un compte ? Se connecter" 
                : "Créer un compte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
