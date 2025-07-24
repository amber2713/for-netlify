import React from 'react';
import { ChevronRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: () => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center">
      {/* Animated Background Dots */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center z-10">
        <h1 className="text-8xl md:text-9xl font-cambria font-bold text-white mb-8 text-shadow-glow">
          Digital USTC
        </h1>
        
        <button
          onClick={onNavigate}
          className="group bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-cambria text-2xl px-12 py-6 rounded-full border border-gray-600 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-2xl"
        >
          <span className="flex items-center gap-3">
            Explore More
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
    </div>
  );
}