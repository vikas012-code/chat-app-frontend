import React from 'react';
import { FiX, FiCheck, FiUserPlus } from 'react-icons/fi';

const apiUrl = import.meta.env.VITE_API_URL || `https://${window.location.hostname}:5000`;

export default function FriendRequests({ user, requests, onClose, onRequestAccepted, onRequestRejected }) {
  const formatTime = (isoString) => {
    const d = new Date(isoString);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleAccept = async (requestId, username) => {
    try {
      const res = await fetch(`${apiUrl}/api/friends/accept/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await res.json();
      if (res.ok && onRequestAccepted) {
        onRequestAccepted({ requestId, username: data.friend?.username || username });
      }
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleReject = async (requestId, username) => {
    try {
      const res = await fetch(`${apiUrl}/api/friends/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (res.ok && onRequestRejected) {
        onRequestRejected({ requestId, username });
      }
    } catch (err) {
      console.error('Reject error:', err);
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
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold font-['Kalam'] text-[#2D2C2A]">
              Friend Requests
            </h2>
            {requests.length > 0 && (
              <span className="bg-[#991b1b] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/10 transition-colors"
            style={{ borderRadius: '50%' }}
          >
            <FiX className="w-5 h-5 text-[#2D2C2A]" />
          </button>
        </div>

        {/* Requests List */}
        <div className="flex-1 min-h-0">
          {requests.length === 0 && (
            <div className="text-center py-10">
              <FiUserPlus className="w-16 h-16 mx-auto mb-4 text-black/30" />
              <p className="text-lg font-['Kalam'] text-black/60">No pending requests</p>
              <p className="text-sm font-['Kalam'] text-black/40 mt-2">
                When someone sends you a friend request, it will appear here
              </p>
            </div>
          )}

          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.requestId}
                className="flex items-center gap-3 p-4"
                style={{
                  border: '1px solid rgba(45, 44, 42, 0.15)',
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 flex items-center justify-center bg-[#F5F2EB] text-lg font-bold shrink-0"
                  style={{
                    border: '1.5px solid #2D2C2A',
                    borderRadius: '50% 40% 60% 40% / 40% 50% 40% 60%'
                  }}
                >
                  {req.username.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate font-['Kalam']">
                    {req.username}
                  </h3>
                  <p className="text-xs text-black/50 font-['Kalam']">
                    {formatTime(req.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {/* Accept Button */}
                  <button
                    onClick={() => handleAccept(req.requestId, req.username)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-[#166534]/10 transition-colors"
                    style={{
                      border: '1.5px solid #166534',
                      borderRadius: '50% 40% 60% 40% / 40% 50% 40% 60%'
                    }}
                    title="Accept"
                  >
                    <FiCheck className="w-4 h-4 text-[#166534]" />
                  </button>

                  {/* Reject Button */}
                  <button
                    onClick={() => handleReject(req.requestId, req.username)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-[#991b1b]/10 transition-colors"
                    style={{
                      border: '1.5px solid #991b1b',
                      borderRadius: '50% 60% 40% 50% / 50% 40% 60% 40%'
                    }}
                    title="Reject"
                  >
                    <FiX className="w-4 h-4 text-[#991b1b]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}