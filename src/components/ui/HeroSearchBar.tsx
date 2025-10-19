'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PROVINCES, DEFAULT_OCCUPATIONS, DEFAULT_TAGS } from '@/lib/constants';

interface HeroSearchBarProps {
  onSearch?: (query: string) => void;
}

export default function HeroSearchBar({ onSearch }: HeroSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    type: 'province' | 'occupation' | 'tag' | 'name';
    value: string;
    label: string;
  }>>([]);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Quick filter options
  const quickFilters = [
    { id: 'featured', label: 'Nổi bật', icon: '⭐' },
    { id: 'new', label: 'Mới nhất', icon: '🆕' },
    { id: 'mien-nam', label: 'Miền Nam', icon: '🌴' },
    { id: 'mien-bac', label: 'Miền Bắc', icon: '🏔️' },
    { id: 'mien-trung', label: 'Miền Trung', icon: '🏖️' },
  ];

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const newSuggestions: Array<{
      type: 'province' | 'occupation' | 'tag' | 'name';
      value: string;
      label: string;
    }> = [];

    // Province suggestions
    PROVINCES.forEach((province) => {
      if (province.name.toLowerCase().includes(query.toLowerCase())) {
        newSuggestions.push({
          type: 'province',
          value: province.slug,
          label: `📍 ${province.name}`
        });
      }
    });

    // Occupation suggestions
    DEFAULT_OCCUPATIONS.forEach(occupation => {
      if (occupation.toLowerCase().includes(query.toLowerCase())) {
        newSuggestions.push({
          type: 'occupation',
          value: occupation,
          label: `💼 ${occupation}`
        });
      }
    });

    // Tag suggestions
    DEFAULT_TAGS.forEach(tag => {
      if (tag.toLowerCase().includes(query.toLowerCase())) {
        newSuggestions.push({
          type: 'tag',
          value: tag,
          label: `🏷️ ${tag}`
        });
      }
    });

    setSuggestions(newSuggestions.slice(0, 8)); // Limit to 8 suggestions
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      if (onSearch) {
        onSearch(finalQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);
    
    // Navigate based on suggestion type
    switch (suggestion.type) {
      case 'province':
        router.push(`/gai-xinh?province=${encodeURIComponent(suggestion.value)}`);
        break;
      case 'occupation':
        router.push(`/gai-xinh?occupation=${encodeURIComponent(suggestion.value)}`);
        break;
      case 'tag':
        router.push(`/gai-xinh?tags=${encodeURIComponent(suggestion.value)}`);
        break;
      default:
        handleSearch(suggestion.value);
    }
  };

  const handleQuickFilterClick = (filterId: string) => {
    setSelectedQuickFilter(filterId);
    
    switch (filterId) {
      case 'featured':
        router.push('/gai-xinh?featured=true');
        break;
      case 'new':
        router.push('/gai-xinh?sort=newest');
        break;
      case 'mien-nam':
        router.push('/gai-xinh/mien-nam');
        break;
      case 'mien-bac':
        router.push('/gai-xinh/mien-bac');
        break;
      case 'mien-trung':
        router.push('/gai-xinh/mien-trung');
        break;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Main Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="flex items-center p-4">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Tìm kiếm theo tên, tỉnh thành, nghề nghiệp..."
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-lg"
              />
              <button
                onClick={() => handleSearch()}
                className="ml-3 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 z-50 overflow-hidden">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50/80 transition-colors border-b border-gray-100/50 last:border-b-0 flex items-center space-x-3"
              >
                <span className="text-gray-600">{suggestion.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {quickFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleQuickFilterClick(filter.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              selectedQuickFilter === filter.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 hover:shadow-md border border-white/30'
            }`}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Popular Searches */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Tìm kiếm phổ biến:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Sinh viên', 'Người mẫu', 'Dễ thương'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                handleSearch(term);
              }}
              className="px-3 py-1 text-xs bg-gray-100/80 text-gray-600 rounded-full hover:bg-gray-200/80 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}