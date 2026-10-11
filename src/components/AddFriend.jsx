import React, { useState } from 'react';
import { FiX, FiUserPlus, FiSearch } from 'react-icons/fi';

const apiUrl = import.meta.env.VITE_API_URL || `https://${window.location.hostname}:5000`;

export default function AddFriend({ user, onClose, onFriendRequestSent }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [error, setError] = useState('');

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setError('');

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`${apiUrl}/api/friends/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ query: query.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Search failed');
        setSearchResults([]);
      } else {
        setSearchResults(data.users || []);
      }
    } catch (err) {
      setError('Error searching users');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (username) => {
    try {
      const res = await fetch(`${apiUrl}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ username })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send request');
      } else {
        setSentRequests(prev => new Set([...prev, username]));
        if (onFriendRequestSent) {
          onFriendRequestSent({ username });
        }
      }
    } catch (err) {
      setError('Error sending friend request');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-[#F4EFE6] p-6 md:p-10 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
        style={{
          border: '1.5px solid #2D2C2A',
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold font-['Kalam'] text-[#2D2C2A]">Add Friend</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/10 transition-colors"
            style={{ borderRadius: '50%' }}
          >
            <FiX className="w-5 h-5 text-[#2D2C2A]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6 shrink-0">
          <div className="relative">
            <div className="flex items-center gap-2 bg-transparent border-b-2 border-[#2D2C2A] pb-2">
              <FiSearch className="w-5 h-5 text-[#2D2C2A] opacity-70" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none placeholder-black/50 font-['Kalam'] text-base"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-[#991b1b] text-[#991b1b] text-sm font-['Kalam'] rounded">
            {error}
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 min-h-0">
          {searching && (
            <p className="text-center text-black/50 py-8 font-['Kalam']">Searching...</p>
          )}

          {!searching && searchResults.length === 0 && searchQuery && (
            <p className="text-center text-black/50 py-8 font-['Kalam']">No users found</p>
          )}

          {!searching && searchQuery === '' && (
            <p className="text-center text-black/50 py-8 font-['Kalam']">Type a username to search</p>
          )}

          <div className="space-y-3">
            {searchResults.map((u) => {
              const isRequested = sentRequests.has(u.username);
              return (
                <div
                  key={u._id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 transition-colors"
                  style={{
                    border: '1px solid rgba(45, 44, 42, 0.2)',
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center bg-[#F5F2EB] text-base font-bold shrink-0"
                    style={{
                      border: '1.5px solid #2D2C2A',
                      borderRadius: '50% 40% 60% 40% / 40% 50% 40% 60%'
                    }}
                  >
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate font-['Kalam']">{u.username}</h3>
                    <p className="text-xs text-black/50">
                      {u.status === 'online' ? '🟢 Online' : '⚪ Offline'}
                    </p>
                  </div>
                  <button
                    disabled={isRequested}
                    onClick={() => handleSendRequest(u.username)}
                    className={`px-3 py-1.5 text-sm font-bold font-['Kalam'] transition-all shrink-0 ${
                      isRequested
                        ? 'opacity-50 cursor-default bg-black/10 text-black/60'
                        : 'hover:bg-[#2D2C2A] hover:text-[#F4EFE6] text-[#2D2C2A] hover:scale-105'
                    }`}
                    style={{
                      border: '1.5px solid #2D2C2A',
                      borderRadius: '60% 40% 50% 50% / 40% 50% 60% 40%'
                    }}
                  >
                    {isRequested ? 'Sent' : <FiUserPlus className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}