import React from "react";
import { Link } from "react-router-dom";

const API_URL = "http://172.16.8.217:5000";

function MediaCard({ media }) {
  const { id, title, filename, mediaType, views, uploadedBy, createdAt, mimeType } = media;

  // Format view count
  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // Get thumbnail/preview URL
  const getMediaUrl = () => `${API_URL}/uploads/${filename}`;

  // Determine if it's a video for proper thumbnail display
  const isVideo = mediaType === "VIDEO";
  const isGif = mediaType === "GIF";

  return (
    <Link to={`/watch/${id}`} className="media-card group block">
      <div className="relative aspect-video bg-card-hover rounded-lg overflow-hidden">
        {/* Thumbnail/Preview */}
        {isVideo ? (
          <video
            src={getMediaUrl()}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => {
              e.target.pause();
              e.target.currentTime = 0;
            }}
          />
        ) : (
          <img
            src={getMediaUrl()}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Overlay on hover */}
        <div className="thumbnail-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity">
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-sm font-medium text-white truncate">{title}</p>
          </div>
        </div>

        {/* Media type badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded ${
              isVideo
                ? "bg-red-600 text-white"
                : isGif
                ? "bg-purple-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {mediaType}
          </span>
        </div>

        {/* View count badge */}
        <div className="absolute bottom-2 right-2 view-badge px-2 py-1 rounded text-xs text-white flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          {formatViews(views)}
        </div>

        {/* Play icon for videos */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-orange-main/90 flex items-center justify-center">
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Media Info */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-orange-main transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="text-gray-400">{uploadedBy}</span>
          <span>•</span>
          <span>{formatViews(views)} views</span>
          <span>•</span>
          <span>{timeAgo(createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export default MediaCard;
