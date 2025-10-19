'use client';

import { useState, useEffect } from 'react';

interface CounterStatsProps {
  totalProfiles: number;
  featuredProfiles?: number;
  newProfiles?: number;
  delay?: number;
}

export default function CounterStats({ 
  totalProfiles, 
  featuredProfiles = 0, 
  newProfiles = 0, 
  delay = 0 
}: CounterStatsProps) {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedFeatured, setAnimatedFeatured] = useState(0);
  const [animatedNew, setAnimatedNew] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    const duration = 2000; // 2 seconds
    const steps = 60; // 60 FPS
    const stepTime = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedTotal(Math.floor(totalProfiles * easeOutQuart));
      setAnimatedFeatured(Math.floor(featuredProfiles * easeOutQuart));
      setAnimatedNew(Math.floor(newProfiles * easeOutQuart));

      if (currentStep >= steps) {
        setAnimatedTotal(totalProfiles);
        setAnimatedFeatured(featuredProfiles);
        setAnimatedNew(newProfiles);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, totalProfiles, featuredProfiles, newProfiles]);

  return (
    <div className="flex justify-center space-x-4 mb-8">
      {/* Total Profiles */}
      <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium transform hover:scale-105 transition-all duration-300 animate-fade-in-up group cursor-pointer" 
           style={{ animationDelay: `${delay + 1000}ms` }}>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-blue-200 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-2xl font-bold group-hover:text-blue-200 transition-colors">
            {animatedTotal.toLocaleString()}
          </span>
          <span className="group-hover:text-blue-200 transition-colors">hồ sơ</span>
        </div>
      </div>

      {/* Featured Profiles */}
      {featuredProfiles > 0 && (
        <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium transform hover:scale-105 transition-all duration-300 animate-fade-in-up group cursor-pointer" 
             style={{ animationDelay: `${delay + 1200}ms` }}>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-200 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-lg font-bold group-hover:text-yellow-200 transition-colors">
              {animatedFeatured}
            </span>
            <span className="group-hover:text-yellow-200 transition-colors">nổi bật</span>
          </div>
        </div>
      )}

      {/* New Profiles */}
      {newProfiles > 0 && (
        <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium transform hover:scale-105 transition-all duration-300 animate-fade-in-up group cursor-pointer" 
             style={{ animationDelay: `${delay + 1400}ms` }}>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-200 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-lg font-bold group-hover:text-green-200 transition-colors">
              {animatedNew}
            </span>
            <span className="group-hover:text-green-200 transition-colors">mới</span>
          </div>
        </div>
      )}

      {/* Live Update Indicator */}
      <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium transform hover:scale-105 transition-all duration-300 animate-fade-in-up group cursor-pointer" 
           style={{ animationDelay: `${delay + 1600}ms` }}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="group-hover:text-green-200 transition-colors">⚡ Cập nhật liên tục</span>
        </div>
      </div>
    </div>
  );
}