import React, { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Message } from '../types/types';

export const SearchMessages: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const searchMessages = useStore(state => state.searchMessages);
  const [results, setResults] = useState<Message[]>([]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const searchResults = searchMessages(searchQuery);
    
    // Appliquer le filtre de date si nécessaire
    let filteredResults = searchResults;
    const now = Date.now();

    if (dateFilter === 'today') {
      filteredResults = searchResults.filter(msg => 
        new Date(msg.timestamp).toDateString() === new Date().toDateString()
      );
    } else if (dateFilter === 'week') {
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filteredResults = searchResults.filter(msg => msg.timestamp >= oneWeekAgo);
    } else if (dateFilter === 'month') {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filteredResults = searchResults.filter(msg => msg.timestamp >= oneMonthAgo);
    }

    setResults(filteredResults);
  };

  return (
    <div className="p-4 glass-effect">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher dans les messages..."
          className="w-full bg-dark-light/50 text-gray-100 rounded-full px-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-4">
            <Calendar className="w-4 h-4 text-primary" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-dark-light/50 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">Toute période</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      )}

      <div className="mt-4">
        {query && results.length === 0 && (
          <p className="text-gray-400">Aucun message trouvé pour "{query}".</p>
        )}
        {results.length > 0 && (
          <ul className="space-y-2">
            {results.map(msg => (
              <li key={msg.id} className="p-2 bg-dark-light/30 rounded-lg">
                <p className="text-sm text-gray-300">{msg.decryptedContent}</p>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 