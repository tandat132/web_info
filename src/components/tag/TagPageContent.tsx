'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterBar from '@/components/ui/FilterBar';
import ProfileCard from '@/components/ui/ProfileCard';
import { Profile } from '@/types/profile';
import { REGIONS, PROVINCES, DEFAULT_OCCUPATIONS } from '@/lib/constants';
import { tagToSlug } from '@/lib/utils';

interface Tag {
  _id: string;
  name: string;
  count: number;
}

interface TagPageContentProps {
  tag: string;
}

export default function TagPageContent({ tag }: TagPageContentProps) {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [, setOccupations] = useState<string[]>([]);
  const [relatedTags, setRelatedTags] = useState<Tag[]>([]);

  // Build query string from search params and tag
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    // Always filter by tag(s)
    params.set('tags', tagToSlug(tag));
    
    // Add other filters from search params
    const region = searchParams.get('region');
    const province = searchParams.get('province');
    const occupation = searchParams.get('occupation');
    const age = searchParams.get('age');
    
    if (region) params.set('region', region);
    if (province) params.set('province', province);
    if (occupation) params.set('occupation', occupation);
    if (age) params.set('age', age);
    
    return params.toString();
  }, [searchParams, tag]);

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

  // Fetch related tags
  const fetchRelatedTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tags?limit=20');
      if (response.ok) {
        const data = await response.json();
        setRelatedTags(data.tags?.filter((t: Tag) => t.name !== tag) || []);
      }
    } catch (error) {
      console.error('Error fetching related tags:', error);
    }
  }, [tag]);

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

  // Fetch occupations and related tags on mount
  useEffect(() => {
    fetchOccupations();
    fetchRelatedTags();
  }, [fetchOccupations, fetchRelatedTags]);

  // Clear all filters
  const clearFilters = () => {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  // Check if any filters are active (excluding tag)
  const hasActiveFilters = searchParams.get('region') || 
                          searchParams.get('province') || 
                          searchParams.get('occupation') || 
                          searchParams.get('age');

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Filter Section */}
        <div className="mb-8">
          <FilterBar
            regions={REGIONS}
            provinces={PROVINCES}
            occupations={DEFAULT_OCCUPATIONS}
            tags={[]}
            defaultTag={tag}
            initialFilters={{
              region: searchParams.get('region') || '',
              province: searchParams.get('province') || '',
              occupation: searchParams.get('occupation') || '',
              ageRange: searchParams.get('age') || '',
              tags: [tag]
            }}
            hideTagFilter={true}
          />
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Những người có đặc điểm &ldquo;{tag}&rdquo;
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ai có đặc điểm này</h3>
              <p className="text-gray-600 mb-4">
                Hiện tại chưa có ai có đặc điểm &ldquo;{tag}&rdquo; phù hợp với tiêu chí tìm kiếm của bạn.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors duration-200"
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
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && profiles.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Xem thêm
              </button>
            </div>
          )}
        </div>

        {/* Related Tags */}
        {relatedTags.length > 0 && (
          <section className="py-12 bg-white/50 rounded-xl">
            <div className="max-w-6xl mx-auto px-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Đặc điểm khác
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedTags.slice(0, 12).map((relatedTag) => {
                  const tagSlug = tagToSlug(relatedTag.name);
                  return (
                    <a
                      key={relatedTag._id}
                      href={`/gai-xinh/mien-bac/ha-noi/sinh-vien/${tagSlug}`}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group text-center"
                    >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300 mb-1">
                      {relatedTag.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {relatedTag.count} người
                    </p>
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