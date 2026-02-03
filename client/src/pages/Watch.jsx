import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMedia();
    // Increment view count
    incrementViews();
  }, [id]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/media/${id}`);
      if (!response.ok) {
        throw new Error("Media not found");
      }
      const data = await response.json();
      setMedia(data);
    } catch (err) {
      console.error("Error fetching media:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await fetch(`${API_URL}/api/media/${id}/view`, { method: "POST" });
    } catch (err) {
      console.error("Error incrementing views:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/media/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        navigate("/");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      alert("Error deleting media");
    } finally {
      setDeleting(false);
    }
  };

  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} bytes`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Media not found</h2>
          <Link to="/" className="text-orange-main hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const isVideo = media.mediaType === "VIDEO";
  const isOwner = user?.username === media.uploadedBy;

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>

        {/* Media Player */}
        <div className="relative bg-black rounded-xl overflow-hidden mb-6">
          {isVideo ? (
            <div className="video-container aspect-video">
              <video
                src={`${API_URL}/uploads/${media.filename}`}
                className="w-full h-full"
                controls
                autoPlay
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] max-h-[80vh]">
              <img
                src={`${API_URL}/uploads/${media.filename}`}
                alt={media.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          )}
        </div>

        {/* Media Info */}
        <div className="bg-card rounded-xl p-6">
          {/* Title & Actions */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-white">{media.title}</h1>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
            <span>{formatViews(media.views)}</span>
            <span>•</span>
            <span>{formatDate(media.createdAt)}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              media.mediaType === "VIDEO"
                ? "bg-red-600 text-white"
                : media.mediaType === "GIF"
                ? "bg-purple-600 text-white"
                : "bg-blue-600 text-white"
            }`}>
              {media.mediaType}
            </span>
          </div>

          {/* Uploader */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-dark rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-main to-accent flex items-center justify-center text-black font-bold text-lg">
              {media.uploadedBy.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{media.uploadedBy}</p>
              <p className="text-sm text-gray-500">Uploader</p>
            </div>
          </div>

          {/* Description */}
          {media.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{media.description}</p>
            </div>
          )}

          {/* File Info */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">File Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Original name</p>
                <p className="text-white truncate" title={media.originalName}>
                  {media.originalName}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="text-white">{media.mimeType}</p>
              </div>
              <div>
                <p className="text-gray-500">Size</p>
                <p className="text-white">{formatFileSize(media.fileSize)}</p>
              </div>
              <div>
                <p className="text-gray-500">Uploaded</p>
                <p className="text-white">{formatDate(media.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Watch;
