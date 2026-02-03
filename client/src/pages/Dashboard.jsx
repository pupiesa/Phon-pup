import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import VideoGrid from "../components/VideoGrid";

const API_URL = "http://localhost:5000";

function Dashboard() {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, views: 0 });

  useEffect(() => {
    fetchMyMedia();
  }, [user]);

  const fetchMyMedia = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/media?limit=100`);
      const data = await response.json();

      // Filter to only show user's uploads
      const myMedia = data.media.filter((m) => m.uploadedBy === user.username);
      setMedia(myMedia);

      // Calculate stats
      const totalViews = myMedia.reduce((sum, m) => sum + m.views, 0);
      setStats({ total: myMedia.length, views: totalViews });
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Uploads</h1>
          <p className="text-gray-400">
            Manage your videos, images, and GIFs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-main/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-main"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Uploads</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats.total)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats.views)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Username</p>
                <p className="text-2xl font-bold text-white truncate">
                  {user?.username}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Media Grid */}
        <VideoGrid
          media={media}
          loading={loading}
          emptyMessage="You haven't uploaded anything yet"
        />
      </div>
    </div>
  );
}

export default Dashboard;
