'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterBar from '@/components/ui/FilterBar';
import { DEFAULT_OCCUPATIONS } from '@/lib/constants';
import ProfileCard from '@/components/ui/ProfileCard';
import { Profile } from '@/types/profile';

interface Region {
  code: string;
  name: string;
}

interface Province {
  code: string;
  name: string;
  slug: string;
  region: string;
}

interface RegionPageContentProps {
  region: Region;
  provinces: Province[];
}

export default function RegionPageContent({ region, provinces }: RegionPageContentProps) {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [, setOccupations] = useState<string[]>([]);

  // Build query string from search params and region
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    // Always filter by region
    params.set('region', region.code);
    
    // Add other filters from search params
    const province = searchParams.get('province');
    const occupation = searchParams.get('occupation');
    const tags = searchParams.get('tags');
    const age = searchParams.get('age');
    
    if (province) params.set('province', province);
    if (occupation) params.set('occupation', occupation);
    if (tags) params.set('tags', tags);
    if (age) params.set('age', age);
    
    return params.toString();
  }, [searchParams, region.code]);

  // Fetch profiles
  const fetchProfiles = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString();
      const response = await fetch(`/api/profiles?${queryString}&page=${pageNum}&limit=12`);
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu');
      }
      
      const data = await response.json();
      
      if (append) {
        console.log('📄 Appending', data.profiles.length, 'profiles to existing', profiles.length);
        setProfiles(prev => [...prev, ...data.profiles]);
      } else {
        console.log('🔄 Replacing profiles with', data.profiles.length, 'new profiles');
        setProfiles(data.profiles);
      }
      
      setHasMore(data.pagination.hasNext);
      setPage(pageNum);
      console.log('✅ Updated state - hasMore:', data.pagination.hasNext, 'page:', pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [buildQueryString, profiles.length]);

  // Fetch occupations for filter
  const fetchOccupations = useCallback(async () => {
    try {
      const response = await fetch('/api/occupations');
      if (response.ok) {
        const data = await response.json();
        setOccupations(data.occupations || []);
      }
    } catch (error) {
      console.error('Error fetching occupations:', error);
    }
  }, []);

  // Load more profiles
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchProfiles(page + 1, true);
    }
  }, [loading, hasMore, page, fetchProfiles]);

  // Reset and fetch when search params change
  useEffect(() => {
    setPage(1);
    fetchProfiles(1, false);
  }, [fetchProfiles]);

  // Fetch occupations on mount
  useEffect(() => {
    fetchOccupations();
  }, [fetchOccupations]);

  // Clear all filters
  const clearFilters = () => {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  // Check if any filters are active (excluding region)
  const hasActiveFilters = searchParams.get('province') || 
                          searchParams.get('occupation') || 
                          searchParams.get('tags') || 
                          searchParams.get('age');

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Filter Section */}
        <div className="mb-8">
          <FilterBar
             provinces={provinces}
             occupations={DEFAULT_OCCUPATIONS}
             tags={[]}
             hideRegionFilter={true}
           />
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Kết quả tìm kiếm tại {region.name}
            </h2>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && profiles.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m8 0V7a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-600 mb-4">
                Không có hồ sơ nào phù hợp với tiêu chí tìm kiếm của bạn tại {region.name}.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}

          {/* Profiles Grid */}
          {profiles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles.map((profile) => (
                <ProfileCard key={profile.slug} profile={profile} />
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && profiles.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Xem thêm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}