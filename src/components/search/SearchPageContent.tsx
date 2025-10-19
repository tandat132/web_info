'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterBar from '@/components/ui/FilterBar';
import ProfileGrid from '@/components/ui/ProfileGrid';
import { Profile } from '@/types/profile';
import { REGIONS, PROVINCES, DEFAULT_OCCUPATIONS } from '@/lib/constants';

interface SearchState {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
}

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [searchState, setSearchState] = useState<SearchState>({
    profiles: [],
    loading: true,
    error: null,
    page: 1,
    hasMore: true,
    loadingMore: false,
  });

  const [, setOccupations] = useState<string[]>([]);

  // Build query string from search params
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    const region = searchParams.get('region');
    const province = searchParams.get('province');
    const occupation = searchParams.get('occupation');
    const tags = searchParams.get('tags');
    const age = searchParams.get('age');

    if (region) params.set('region', region);
    if (province) params.set('province', province);
    if (occupation) params.set('occupation', occupation);
    if (tags) params.set('tags', tags);
    if (age) params.set('age', age);
    
    params.set('status', 'published');
    params.set('limit', '12');
    
    return params.toString();
  }, [searchParams]);

  // Fetch profiles
  const fetchProfiles = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setSearchState(prev => ({ ...prev, loading: true, error: null }));
      } else {
        setSearchState(prev => ({ ...prev, loadingMore: true }));
      }

      const queryString = buildQueryString();
      const url = `/api/profiles?${queryString}&page=${page}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu');
      }

      const data = await response.json();
      
      setSearchState(prev => ({
        ...prev,
        profiles: append ? [...prev.profiles, ...data.profiles] : data.profiles,
        loading: false,
        loadingMore: false,
        page: data.pagination.page,
        hasMore: data.pagination.hasNext,
        error: null,
      }));

    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
      }));
    }
  }, [buildQueryString]);

  // Load more profiles
  const loadMore = useCallback(() => {
    if (searchState.hasMore && !searchState.loadingMore) {
      fetchProfiles(searchState.page + 1, true);
    }
  }, [searchState.hasMore, searchState.loadingMore, searchState.page, fetchProfiles]);

  // Fetch occupations for filter
  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        const response = await fetch('/api/profiles?status=published&limit=1000');
        if (response.ok) {
          const data = await response.json();
          const uniqueOccupations = Array.from(
            new Set(data.profiles.map((p: Profile) => p.occupation).filter(Boolean))
          );
          setOccupations(uniqueOccupations as string[]);
        }
      } catch (error) {
        console.error('Error fetching occupations:', error);
      }
    };

    fetchOccupations();
  }, []);

  // Fetch profiles when search params change
  useEffect(() => {
    fetchProfiles(1, false);
  }, [fetchProfiles]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && searchState.hasMore && !searchState.loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [searchState.hasMore, searchState.loadingMore, loadMore]);

  // Get current filter values for display
  const currentFilters = {
    region: searchParams.get('region') || '',
    province: searchParams.get('province') || '',
    occupation: searchParams.get('occupation') || '',
    tags: searchParams.get('tags') || '',
    age: searchParams.get('age') || '',
  };

  const hasFilters = Object.values(currentFilters).some(v => v);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Filter Bar */}
      <FilterBar 
        regions={REGIONS}
        provinces={PROVINCES}
        occupations={DEFAULT_OCCUPATIONS}
        tags={[]}
      />

      {/* Results Section */}
      <div className="mt-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {hasFilters ? 'Kết quả tìm kiếm' : 'Tất cả hồ sơ'}
            </h2>
            {!searchState.loading && (
              <p className="text-gray-600 mt-1">
                Tìm thấy {searchState.profiles.length} hồ sơ
                {hasFilters && ' phù hợp với bộ lọc'}
              </p>
            )}
          </div>

          {hasFilters && (
            <button
              onClick={() => router.push('/tim-kiem')}
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-pink-100 hover:to-pink-200 text-gray-700 hover:text-pink-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 border border-gray-200/50 hover:border-pink-200/50"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>

        {/* Loading State */}
        {searchState.loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tìm kiếm...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {searchState.error && (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
              <p className="text-red-600 mb-4">{searchState.error}</p>
              <button
                onClick={() => fetchProfiles(1, false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!searchState.loading && !searchState.error && searchState.profiles.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-600 mb-4">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
              {hasFilters && (
                <button
                  onClick={() => router.push('/tim-kiem')}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!searchState.loading && !searchState.error && searchState.profiles.length > 0 && (
          <>
            <ProfileGrid profiles={searchState.profiles} />
            
            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="mt-8">
              {searchState.loadingMore && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Đang tải thêm...</p>
                </div>
              )}
              
              {!searchState.hasMore && searchState.profiles.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Đã hiển thị tất cả kết quả</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}