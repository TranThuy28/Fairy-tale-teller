import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000/api";

function LibraryView() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stories`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      const data = await response.json();
      setStories(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatStoryTitle = (filename) => {
    // Remove .pdf extension and format the name
    const name = filename.replace(/\.pdf$/i, "");
    // Split by dots/numbers and take meaningful parts
    const parts = name.split(/[._-]/).filter((p) => p && isNaN(p));
    if (parts.length > 0) {
      return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleBookClick = (filename) => {
    navigate(`/read/${encodeURIComponent(filename)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-amber-200 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 border-4 border-amber-300 border-t-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
          </div>
          <p className="text-amber-100 text-xl font-serif">Opening the magical library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center">
        <div className="text-center text-amber-100">
          <p className="text-2xl font-serif mb-4">✨ Something went wrong ✨</p>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 py-12 px-4">
      {/* Magical Library Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-serif text-amber-50 mb-4 drop-shadow-2xl" style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.5), 0 0 20px rgba(251, 191, 36, 0.3)" }}>
          ✨ Fairy Tale Library ✨
        </h1>
        <p className="text-amber-200 text-xl font-serif italic">Choose your magical adventure</p>
      </div>

      {/* Bookshelf Container */}
      <div className="max-w-7xl mx-auto">
        {/* Wooden Shelf Effect */}
        <div className="bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg shadow-2xl p-8 border-4 border-amber-700" style={{ boxShadow: "inset 0 10px 30px rgba(0,0,0,0.3), 0 10px 40px rgba(0,0,0,0.5)" }}>
          {stories.length === 0 ? (
            <div className="text-center text-amber-200 py-20">
              <p className="text-2xl font-serif">The library is empty...</p>
              <p className="text-lg mt-2">No stories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {stories.map((filename, index) => {
                const title = formatStoryTitle(filename);
                return (
                  <div
                    key={filename}
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                    onClick={() => handleBookClick(filename)}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    {/* Book Cover Card */}
                    <div
                      className="relative h-80 rounded-lg shadow-2xl overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #92400e 0%, #78350f 50%, #451a03 100%)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                        transform: "perspective(1000px) rotateY(-5deg)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {/* Magical Glow Effect on Hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-amber-400/20 to-yellow-600/20 blur-xl"></div>

                      {/* Book Spine Shadow */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/40 to-transparent"></div>

                      {/* Decorative Border */}
                      <div className="absolute inset-2 border-2 border-amber-600/30 rounded"></div>
                      <div className="absolute inset-4 border border-amber-500/20 rounded"></div>

                      {/* Book Content */}
                      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                        {/* Ornamental Decoration */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                          <div className="w-16 h-16 border-2 border-amber-300/40 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📖</span>
                          </div>
                        </div>

                        {/* Book Title */}
                        <div className="mt-20">
                          <h2 className="text-amber-50 font-serif text-xl font-bold mb-2 leading-tight" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}>
                            {title}
                          </h2>
                        </div>

                        {/* Decorative Line */}
                        <div className="w-24 h-0.5 bg-amber-400/50 my-4"></div>

                        {/* Subtitle */}
                        <p className="text-amber-200/80 text-sm font-serif italic">A Magical Tale</p>

                        {/* Bottom Decoration */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex gap-2">
                            <div className="w-1 h-1 bg-amber-300/60 rounded-full"></div>
                            <div className="w-1 h-1 bg-amber-300/60 rounded-full"></div>
                            <div className="w-1 h-1 bg-amber-300/60 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Glow Ring */}
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-4 ring-amber-400/50"></div>
                    </div>

                    {/* Book Shadow */}
                    <div className="mt-2 h-4 bg-black/20 rounded-full blur-md transform group-hover:scale-110 transition-transform duration-300"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Magical Particles Effect (optional decorative element) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-300/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default LibraryView;


