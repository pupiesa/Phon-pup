import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import VideoGrid from "../components/VideoGrid";

const API_URL = "http://172.16.8.217:5000";

function Home({ refreshTrigger }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const typeParam = filter !== "ALL" ? `&type=${filter}` : "";
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const response = await fetch(
        `${API_URL}/api/media?page=${page}&limit=20${typeParam}${searchParam}`
      );
      const data = await response.json();
      setMedia(data.media);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchMedia();
  }, [page, filter, refreshTrigger, searchQuery]);

  const filterButtons = [
    { label: "All", value: "ALL" },
    { label: "Videos", value: "VIDEO" },
    { label: "Images", value: "IMAGE" },
    { label: "GIFs", value: "GIF" },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section - only show if not searching */}
        {!searchQuery ? (
          <div className="text-center mb-10">
            <img src="/logo.jpg" alt="Phon-Pup" className="h-32 w-auto mx-auto mb-4 rounded-xl" />
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Upload and share videos, images, and GIFs with your friends 🔥
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Search results for "{searchQuery}"
            </h1>
            <p className="text-gray-500">
              {pagination ? `${pagination.total} result${pagination.total !== 1 ? "s" : ""} found` : "Searching..."}
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => {
                setFilter(btn.value);
                setPage(1);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === btn.value
                  ? "bg-orange-main text-black"
                  : "bg-card text-gray-400 hover:text-white hover:bg-card-hover"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <VideoGrid
          media={media}
          loading={loading}
          emptyMessage={
            filter === "ALL"
              ? "No media uploaded yet"
              : `No ${filter.toLowerCase()}s found`
          }
        />

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-card text-gray-400 rounded-lg hover:bg-card-hover hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-500">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-card text-gray-400 rounded-lg hover:bg-card-hover hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
