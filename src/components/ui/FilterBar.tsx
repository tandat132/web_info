'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { REGIONS, PROVINCES } from '@/lib/constants';
import { occupationToSlug, tagToSlug, slugToOccupation, slugToTag } from '@/lib/utils';

interface FilterBarProps {
  basePath?: string;
  regions?: Array<{ code: string; name: string; slug: string }>;
  provinces?: Array<{ name: string; slug: string; region: string }>;
  occupations?: string[];
  tags?: string[];
  defaultRegion?: string;
  defaultProvince?: string;
  defaultOccupation?: string;
  defaultTag?: string;
  hideRegionFilter?: boolean;
  hideProvinceFilter?: boolean;
  hideOccupationFilter?: boolean;
  hideAgeFilter?: boolean;
  hideTagFilter?: boolean;
  initialFilters?: {
    region: string;
    province: string;
    occupation: string;
    ageRange: string;
    tags: string[];
  };
  onFilterChange?: (filters: {
    region: string;
    province: string;
    occupation: string;
    ageRange: string;
    tags: string[];
  }) => void;
}

interface Tag {
  name: string;
  count: number;
}

export default function FilterBar({ 
  basePath = '/gai-xinh',
  regions = REGIONS,
  provinces = PROVINCES,
  occupations = [], 
  tags = [],
  defaultRegion = '',
  defaultProvince = '',
  defaultOccupation = '',
  hideRegionFilter = false,
  hideProvinceFilter = false,
  hideOccupationFilter = false,
  hideAgeFilter = false,
  hideTagFilter = false,
  initialFilters,
  onFilterChange
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    region: initialFilters?.region || searchParams.get('region') || defaultRegion,
    province: initialFilters?.province || searchParams.get('province') || defaultProvince,
    occupation: initialFilters?.occupation || searchParams.get('occupation') || defaultOccupation,
    tags: initialFilters?.tags || [],
    ageRange: initialFilters?.ageRange || '',
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [uniqueTags, setUniqueTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Age ranges for filtering
  const ageRanges = [
    { value: '<18', label: 'Dưới 18 tuổi' },
    { value: '18-22', label: '18-22 tuổi' },
    { value: '23-26', label: '23-26 tuổi' },
    { value: '27-30', label: '27-30 tuổi' },
    { value: '30-34', label: '30-34 tuổi' },
    { value: '30-40', label: '30-40 tuổi' },
    { value: '>40', label: 'Trên 40 tuổi' }
  ];

  // Fetch unique tags from API only once when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        const response = await fetch('/api/tags?limit=100');
        if (response.ok) {
          const data = await response.json();
          setUniqueTags(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        // Fallback to props tags if API fails
        const fallbackTags = Array.from(new Set(tags)).map(tag => ({ name: tag, count: 0 }));
        setUniqueTags(fallbackTags);
      } finally {
        setTagsLoading(false);
      }
    };

    // Only fetch if we don't have tags yet
    if (uniqueTags.length === 0) {
      fetchTags();
    }
    }, [tags, uniqueTags.length]); // Include dependencies to satisfy React Hook rules

  // Update filters when initialFilters prop changes
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        region: initialFilters.region || '',
        province: initialFilters.province || '',
        occupation: initialFilters.occupation || '',
        tags: initialFilters.tags || [],
        ageRange: initialFilters.ageRange || '',
      });
    }
  }, [
    initialFilters,
    initialFilters?.region,
    initialFilters?.province, 
    initialFilters?.occupation,
    initialFilters?.ageRange,
    initialFilters?.tags
  ]);

  // Handle path facets (region, province) - Use path-based URLs
  const handlePathFacetChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    
    // When changing region, clear province to avoid keeping old province in path
    if (key === 'region') {
      newFilters.province = '';
    }
    setFilters(newFilters);
    
    // Build path-based URL based on basePath
    let newPath = basePath;
    
    // Auto-fill logic: Get the region slug for the selected province if needed
    let regionSlug = newFilters.region;
    if (key === 'province' && value && !regionSlug) {
      const selectedProvince = provinces.find(p => p.slug === value);
      if (selectedProvince) {
        // Convert region name to slug
        const regionData = regions.find(r => r.name === selectedProvince.region);
        if (regionData) {
          regionSlug = regionData.slug;
          newFilters.region = regionSlug;
          setFilters(newFilters);
        }
      }
    }
    
    // Build path segments
    if (regionSlug) {
      newPath += `/${regionSlug}`;
      if (newFilters.province) {
        newPath += `/${newFilters.province}`;
      }
    }
    
    // Tags are handled as query params, not path
    
    // Add query parameters for other filters
    const queryParams = new URLSearchParams();
    if (newFilters.ageRange) {
      queryParams.set('age', newFilters.ageRange);
    }
    if (newFilters.occupation) {
      // Use SEO-friendly slug for occupation
      queryParams.set('occupation', occupationToSlug(newFilters.occupation));
    }
    if (newFilters.tags && newFilters.tags.length > 0) {
      const tagSlugs = newFilters.tags.map(tag => tagToSlug(tag));
      queryParams.set('tags', tagSlugs.join(','));
    }
    
    const finalUrl = newPath + (queryParams.toString() ? '?' + queryParams.toString() : '');
    router.push(finalUrl);
    
    // Call onFilterChange callback for instant data fetch
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle query filters (tags, age, occupation) - Update query params and fetch instantly
  const handleQueryFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL query parameters and navigate when needed
    const currentUrl = new URL(window.location.href);
    const queryParams = new URLSearchParams(currentUrl.search);
    
    if (key === 'tags' && Array.isArray(value) && value.length > 0) {
      // Ensure tags in query are slugified if used
      const tagSlugs = value.map((t) => tagToSlug(t));
      queryParams.set('tags', tagSlugs.join(','));
    } else if (key === 'tags') {
      queryParams.delete('tags');
    }
    
    if (key === 'ageRange' && value) {
      queryParams.set('age', value as string);
    } else if (key === 'ageRange') {
      queryParams.delete('age');
    }
    
    if (key === 'occupation' && value) {
      // Use SEO-friendly slug for occupation
      queryParams.set('occupation', occupationToSlug(value as string));
    } else if (key === 'occupation') {
      queryParams.delete('occupation');
    }
    
    // Compute target path: from homepage, redirect to basePath
    const pathname = currentUrl.pathname;
    const targetPath = pathname === '/' ? basePath : pathname;
    const newUrl = `${targetPath}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    // If navigating from homepage, don't call onFilterChange to avoid double request
    const isNavigatingFromHomepage = pathname === '/';
    
    router.push(newUrl);
    
    // Call onFilterChange callback for instant data fetch (only if not navigating from homepage)
    if (onFilterChange && !isNavigatingFromHomepage) {
      onFilterChange(newFilters);
    }
  };

  // Helper function to get display text for age range
  const getAgeRangeDisplayText = (ageRange: string) => {
    if (ageRange === 'duoi-18') return 'Dưới 18';
    if (ageRange === 'tren-35') return 'Trên 35';
    return ageRange; // For other ranges like "18-20", "21-23", etc.
  };

  // Main filter change handler - routes to appropriate handler
  const handleFilterChange = (key: string, value: string | string[]) => {
    // Path facets: region, province
    if (['region', 'province'].includes(key)) {
      handlePathFacetChange(key, value);
    } 
    // Query filters: ageRange, occupation, tags
    else if (['ageRange', 'occupation', 'tags'].includes(key)) {
      handleQueryFilterChange(key, value);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      region: '',
      province: '',
      occupation: '',
      ageRange: '',
      tags: []
    };
    setFilters(clearedFilters);
    
    // Update URL to remove query params and stay on current path (or basePath from homepage)
    const currentUrl = new URL(window.location.href);
    const pathname = currentUrl.pathname;
    const targetPath = pathname === '/' ? basePath : pathname;
    router.push(targetPath);
    
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'tags') return Array.isArray(value) && value.length > 0;
    return value && value !== '';
  });

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Bộ lọc
            </h3>
            {hasActiveFilters && (
              <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {Object.entries(filters).filter(([key, value]) => {
                  if (key === 'tags') return Array.isArray(value) && value.length > 0;
                  return value && value !== '';
                }).length}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden bg-gray-100 hover:bg-gray-200 rounded-lg p-1.5 transition-colors"
          >
            <svg 
              className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className={`transition-all duration-300 ease-out ${isExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'} overflow-hidden lg:overflow-visible`}>
          {/* Main filter controls - always in top row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
            {/* Region Filter */}
            {!hideRegionFilter && (
              <div className="group">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Miền
                </label>
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-colors hover:border-gray-400"
                >
                  <option value="" className="text-gray-900">Tất cả miền</option>
                  {regions.map((region) => (
                    <option key={region.slug} value={region.slug} className="text-gray-900">
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Province Filter */}
            {!hideProvinceFilter && (
              <div className="group">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tỉnh thành
                </label>
                <select
                  value={filters.province}
                  onChange={(e) => handleFilterChange('province', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                >
                  <option value="" className="text-gray-900">Tất cả tỉnh</option>
                  {provinces
                    .filter(p => {
                      if (!filters.region) return true;
                      const regionData = regions.find(r => r.slug === filters.region);
                      return regionData && p.region === regionData.name;
                    })
                    .map((province) => (
                      <option key={province.slug} value={province.slug} className="text-gray-900">
                        {province.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Occupation Filter */}
            {!hideOccupationFilter && occupations.length > 0 && (
              <div className="group">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nghề nghiệp
                </label>
                {(() => {
                  const selectedOccupationDisplay = filters.occupation
                    ? (filters.occupation.includes('-')
                        ? slugToOccupation(filters.occupation)
                        : filters.occupation)
                    : '';
                  return (
                    <select
                      value={selectedOccupationDisplay}
                      onChange={(e) => handleFilterChange('occupation', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors hover:border-gray-400"
                    >
                      <option value="" className="text-gray-900">Tất cả nghề</option>
                      {occupations.map((occupation) => (
                        <option key={occupation} value={occupation} className="text-gray-900">
                          {occupation}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>
            )}

            {/* Age Range */}
            {!hideAgeFilter && (
              <div className="group">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Độ tuổi
                </label>
                <select
                  value={filters.ageRange}
                  onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors hover:border-gray-400"
                >
                  <option value="" className="text-gray-900">Tất cả độ tuổi</option>
                  {ageRanges.map((range) => (
                    <option key={range.value} value={range.value} className="text-gray-900">
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tag Filter - Dropdown and selected tags */}
            {!hideTagFilter && (uniqueTags.length > 0 || tagsLoading) && (
              <div className="group">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Đặc điểm {tagsLoading && <span className="text-xs">(đang tải...)</span>}
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !filters.tags.includes(e.target.value)) {
                      handleFilterChange('tags', [...filters.tags, e.target.value]);
                    }
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors hover:border-gray-400"
                  disabled={tagsLoading}
                >
                  <option value="" className="text-gray-900">Chọn đặc điểm</option>
                  {uniqueTags
                    .filter(tag => !filters.tags.includes(tag.name))
                    .map((tag) => (
                      <option key={tag.name} value={tag.name} className="text-gray-900">
                        {tag.name} ({tag.count})
                      </option>
                    ))}
                </select>
                

              </div>
            )}

            {/* Clear Filters - Always in top row as last column */}
            {hasActiveFilters && (
              <div className="group flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200 hover:border-red-300"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Selected filters summary - show chosen filters as removable chips */}
          {(filters.region || filters.province || filters.occupation || filters.ageRange || (!hideTagFilter && filters.tags.length > 0)) && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {filters.region && (
                  <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {regions.find(r => r.slug === filters.region)?.name || filters.region}
                    <button onClick={() => handleFilterChange('region', '')} className="ml-1 hover:text-blue-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.province && (
                  <span className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                    {provinces.find(p => p.slug === filters.province)?.name || filters.province}
                    <button onClick={() => handleFilterChange('province', '')} className="ml-1 hover:text-indigo-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.occupation && (
                  <span className="inline-flex items-center bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full">
                    {slugToOccupation(filters.occupation) || filters.occupation}
                    <button onClick={() => handleFilterChange('occupation', '')} className="ml-1 hover:text-pink-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.ageRange && (
                  <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    Độ tuổi: {getAgeRangeDisplayText(filters.ageRange)}
                    <button onClick={() => handleFilterChange('ageRange', '')} className="ml-1 hover:text-green-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {!hideTagFilter && filters.tags.map((tag) => {
                  const tagName = slugToTag(tag) || tag;
                  return (
                    <span key={tag} className="inline-flex items-center bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                      {tagName}
                      <button
                        onClick={() => {
                          const newTags = filters.tags.filter(t => t !== tag);
                          handleFilterChange('tags', newTags);
                        }}
                        className="ml-1 hover:text-orange-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}