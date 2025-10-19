'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterBar from '@/components/ui/FilterBar';
import ProfileCard from '@/components/ui/ProfileCard';
import { Profile } from '@/types/profile';
import { REGIONS, PROVINCES } from '@/lib/constants';
import { occupationToSlug } from '@/lib/utils';

interface OccupationPageContentProps {
  occupation: string;
}

export default function OccupationPageContent({ occupation }: OccupationPageContentProps) {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [occupations, setOccupations] = useState<string[]>([]);

  // Build query string from search params and occupation
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    // Always filter by occupation
    params.set('occupation', occupation);
    
    // Add other filters from search params
    const region = searchParams.get('region');
    const province = searchParams.get('province');
    const tags = searchParams.get('tags');
    const age = searchParams.get('age');
    
    if (region) params.set('region', region);
    if (province) params.set('province', province);
    if (tags) params.set('tags', tags);
    if (age) params.set('age', age);
    
    return params.toString();
  }, [searchParams, occupation]);

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
        setProfiles(prev => [...prev, ...data.profiles]);
      } else {
        setProfiles(data.profiles);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

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

  // Check if any filters are active (excluding occupation)
  const hasActiveFilters = searchParams.get('region') || 
                          searchParams.get('province') || 
                          searchParams.get('tags') || 
                          searchParams.get('age');

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Filter Section */}
        <div className="mb-8">
          <FilterBar
            regions={REGIONS}
            provinces={PROVINCES}
            occupations={occupations}
            tags={[]}
            defaultOccupation={occupation}
            hideOccupationFilter={true}
          />
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Cộng đồng {occupation}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thành viên nào</h3>
              <p className="text-gray-600 mb-4">
                Hiện tại chưa có ai trong cộng đồng {occupation} phù hợp với tiêu chí tìm kiếm của bạn.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && profiles.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Xem thêm
              </button>
            </div>
          )}
        </div>

        {/* Related Occupations */}
        {occupations.length > 0 && (
          <section className="py-12 bg-white/50 rounded-xl">
            <div className="max-w-6xl mx-auto px-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Các nghề nghiệp khác
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {occupations
                  .filter(occ => occ !== occupation)
                  .slice(0, 8)
                  .map((occ) => {
                    const occupationSlug = occupationToSlug(occ);
                    return (
                      <a
                        key={occ}
                        href={`/gai-xinh/mien-bac/ha-noi/${occupationSlug}`}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group text-center"
                      >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {occ}
                      </h4>
                      </a>
                    );
                  })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}