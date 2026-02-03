import React from "react";
import MediaCard from "./MediaCard";

function VideoGrid({ media, loading, emptyMessage = "No media found" }) {
  if (loading) {
    return (
      <div className="media-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-card-hover rounded-lg" />
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-card-hover rounded w-3/4" />
              <div className="h-3 bg-card-hover rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!media || media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
        <p className="text-gray-600 text-sm mt-2">
          Be the first to upload some content!
        </p>
      </div>
    );
  }

  return (
    <div className="media-grid">
      {media.map((item) => (
        <MediaCard key={item.id} media={item} />
      ))}
    </div>
  );
}

export default VideoGrid;
