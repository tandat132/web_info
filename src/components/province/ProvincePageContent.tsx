'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FilterBar from '@/components/ui/FilterBar';
import ProfileGrid from '@/components/ui/ProfileGrid';
import { Profile } from '@/types/profile';
import { REGIONS, PROVINCES, DEFAULT_OCCUPATIONS } from '@/lib/constants';

interface Province {
  name: string;
  slug: string;
  region: string;
}

interface ProvincePageContentProps {
  province: Province;
}

interface ProvinceState {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
  totalProfiles: number;
}

export default function ProvincePageContent({ province }: ProvincePageContentProps) {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [provinceState, setProvinceState] = useState<ProvinceState>({
    profiles: [],
    loading: true,
    error: null,
    page: 1,
    hasMore: true,
    loadingMore: false,
    totalProfiles: 0,
  });

  const [occupations, setOccupations] = useState<string[]>([]);

  // Fetch profiles for this province
  const fetchProfiles = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setProvinceState(prev => ({ ...prev, loading: true, error: null }));
      } else {
        setProvinceState(prev => ({ ...prev, loadingMore: true }));
      }

      const params = new URLSearchParams({
        province: province.slug,
        status: 'published',
        limit: '12',
        page: page.toString(),
      });
      
      const response = await fetch(`/api/profiles?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu');
      }

      const data = await response.json();
      
      setProvinceState(prev => ({
        ...prev,
        profiles: append ? [...prev.profiles, ...data.profiles] : data.profiles,
        loading: false,
        loadingMore: false,
        page: data.pagination.page,
        hasMore: data.pagination.hasNext,
        totalProfiles: data.pagination.total,
        error: null,
      }));

    } catch (error) {
      setProvinceState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
      }));
    }
  }, [province.slug]);

  // Load more profiles
  const loadMore = useCallback(() => {
    if (provinceState.hasMore && !provinceState.loadingMore) {
      fetchProfiles(provinceState.page + 1, true);
    }
  }, [provinceState.hasMore, provinceState.loadingMore, provinceState.page, fetchProfiles]);

  // Fetch occupations for filter
  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        const response = await fetch(`/api/profiles?province=${province.slug}&status=published&limit=1000`);
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
  }, [province.slug]);

  // Fetch profiles on mount
  useEffect(() => {
    fetchProfiles(1, false);
  }, [fetchProfiles]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && provinceState.hasMore && !provinceState.loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [provinceState.hasMore, provinceState.loadingMore, loadMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Stats Section */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {provinceState.loading ? '...' : provinceState.totalProfiles}
              </div>
              <div className="text-gray-600">Hồ sơ tại {province.name}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {occupations.length}
              </div>
              <div className="text-gray-600">Nghề nghiệp khác nhau</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {province.region === 'north' ? 'Miền Bắc' : 
                 province.region === 'central' ? 'Miền Trung' : 'Miền Nam'}
              </div>
              <div className="text-gray-600">Khu vực</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar 
        regions={REGIONS}
        provinces={PROVINCES}
        occupations={DEFAULT_OCCUPATIONS}
        tags={[]}
        defaultProvince={province.slug}
        hideProvinceFilter={true}
      />

      {/* Results Section */}
      <div className="mt-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Hồ sơ tại {province.name}
            </h2>
            {!provinceState.loading && (
              <p className="text-gray-600 mt-1">
                Hiển thị {provinceState.profiles.length} / {provinceState.totalProfiles} hồ sơ
              </p>
            )}
          </div>

          <button
            onClick={() => router.push('/tim-kiem')}
            className="bg-gradient-to-r from-blue-100 to-indigo-200 hover:from-blue-200 hover:to-indigo-300 text-blue-700 hover:text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 border border-blue-200/50 hover:border-indigo-200/50"
          >
            Tìm kiếm toàn quốc
          </button>
        </div>

        {/* Loading State */}
        {provinceState.loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải hồ sơ...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {provinceState.error && (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
              <p className="text-red-600 mb-4">{provinceState.error}</p>
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
        {!provinceState.loading && !provinceState.error && provinceState.profiles.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có hồ sơ tại {province.name}
              </h3>
              <p className="text-gray-600 mb-4">
                Hãy quay lại sau hoặc khám phá các tỉnh thành khác
              </p>
              <button
                onClick={() => router.push('/tim-kiem')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Khám phá toàn quốc
              </button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!provinceState.loading && !provinceState.error && provinceState.profiles.length > 0 && (
          <>
            <ProfileGrid profiles={provinceState.profiles} />
            
            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="mt-8">
              {provinceState.loadingMore && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Đang tải thêm...</p>
                </div>
              )}
              
              {!provinceState.hasMore && provinceState.profiles.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Đã hiển thị tất cả hồ sơ tại {province.name}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}