'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { REGIONS } from '@/lib/constants';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Function to check if a tab is active
  const isActiveTab = (path: string) => {
    if (path === '/gai-xinh') {
      return pathname === '/gai-xinh';
    }
    // For region paths, check if pathname starts with the region path
    // This handles cases like /gai-xinh/mien-nam, /gai-xinh/mien-nam/ha-noi, etc.
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-pink-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent group-hover:from-pink-700 group-hover:to-purple-700 transition-all duration-300">
              Gái Xinh VN
            </div>
            <div className="hidden sm:flex items-center text-xs text-gray-500 bg-pink-50 px-2 py-1 rounded-full">
              <svg className="w-3 h-3 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Toàn quốc
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {REGIONS.map((region) => {
              const regionPath = `/gai-xinh/${region.slug}`;
              const isActive = isActiveTab(regionPath);
              
              return (
                <Link 
                  key={region.code}
                  href={regionPath} 
                  className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md scale-105' 
                      : 'text-gray-700 hover:text-pink-600 hover:scale-105 hover:bg-pink-50'
                  }`}
                >
                  {region.name}
                </Link>
              );
            })}
            
            <Link 
              href="/gai-xinh" 
              className={`font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                isActiveTab('/gai-xinh')
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white scale-105 shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white hover:scale-105 hover:shadow-md'
              }`}
            >
              Tất cả
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex flex-col space-y-3">
              {REGIONS.map((region) => {
                const regionPath = `/gai-xinh/${region.slug}`;
                const isActive = isActiveTab(regionPath);
                
                return (
                  <Link 
                    key={region.code}
                    href={regionPath} 
                    className={`font-medium transition-colors px-3 py-2 rounded-lg ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-700 hover:text-pink-600 hover:bg-white/70'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {region.name}
                  </Link>
                );
              })}
              
              <Link 
                href="/gai-xinh" 
                className={`font-medium text-center px-4 py-2 rounded-lg ${
                  isActiveTab('/gai-xinh')
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Tất cả
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}