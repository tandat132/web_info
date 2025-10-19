'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FilterBar from '@/components/ui/FilterBar';
import ProfileCard from '@/components/ui/ProfileCard';
import { DEFAULT_OCCUPATIONS, DEFAULT_TAGS, REGIONS, PROVINCES } from '@/lib/constants';
import { occupationToSlug, tagToSlug } from '@/lib/utils';
import { HeartIcon, FireIcon, DiamondIcon, WineIcon, RoseIcon, LipsIcon, GemIcon, SparkleIcon } from '@/components/ui/SeductiveIcons';

interface Profile {
  _id: string;
  name: string;
  slug: string;
  age: number;
  height?: number;
  weight?: number;
  region: 'mien-nam' | 'mien-bac' | 'mien-trung';
  province: string;
  occupation: string;
  description?: string;
  tags: string[];
  photos: Array<{
    url: string;
    baseFilename: string;
    alt: string;
    width: number;
    height: number;
    dominantColor?: string;
    caption?: string;
    format: string;
    bytes: number;
    isLCP?: boolean;
    blurDataURL?: string;
    sizes?: {
      thumbnail?: { url: string; width: number; height: number; size: number };
      small?: { url: string; width: number; height: number; size: number };
      medium?: { url: string; width: number; height: number; size: number };
      large?: { url: string; width: number; height: number; size: number };
      original?: { url: string; width: number; height: number; size: number };
    };
  }>;
  isFeatured: boolean;
  status: 'published' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

interface FilterState {
  region: string;
  province: string;
  occupation: string;
  ageRange: string;
  tags: string[];
}

const heroTexts = [
  'Gái Xinh Việt Nam 💖',
  'Vẻ Đẹp Thiên Thần ✨',
  'Nhan Sắc Quyến Rũ 🌹',
  'Duyên Dáng Á Đông 🌸'
];

export default function GaiXinhMainPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    region: '',
    province: '',
    occupation: '',
    ageRange: '',
    tags: []
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromUrlRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Animation states
  const [displayedText, setDisplayedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  

  // Typing animation effect
  useEffect(() => {
    const currentText = heroTexts[currentTextIndex];
    
    if (isTyping) {
      if (displayedText.length < currentText.length) {
        const timer = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, 100);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      if (displayedText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
        setIsTyping(true);
      }
    }
  }, [displayedText, currentTextIndex, isTyping]);

  // Read URL params and update filters
  useEffect(() => {
    const newFilters: FilterState = {
      region: searchParams.get('region') || '',
      province: searchParams.get('province') || '',
      occupation: searchParams.get('occupation') || '',
      ageRange: searchParams.get('age') || '',
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : []
    };
    
    // Set flag to indicate we're updating from URL
    isUpdatingFromUrlRef.current = true;
    
    setFilters(newFilters);
    // Reset pagination and clear profiles when URL changes (filters change)
    setPage(1);
    setHasMore(true);
    setProfiles([]); // Clear existing profiles to prevent duplicates
    
    // Manually fetch profiles with new filters
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '12');
    params.set('page', '1');
    
    if (newFilters.region) params.set('region', newFilters.region);
    if (newFilters.province) params.set('province', newFilters.province);
    if (newFilters.occupation) params.set('occupation', newFilters.occupation);
    if (newFilters.ageRange) params.set('age', newFilters.ageRange);
    if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','));
    
    // Fetch profiles directly
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profiles?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu hồ sơ');
        }
        
        const data = await response.json();
        setProfiles(data.profiles || []);
        setTotalCount(data.pagination?.total || 0);
        setHasMore(data.pagination?.hasNext || false);
        setPage(1);
      } catch (err) {
        setError('Không thể tải dữ liệu hồ sơ');
        console.error('Error fetching profiles:', err);
      } finally {
        setLoading(false);
        // Reset flag after fetch is complete
        isUpdatingFromUrlRef.current = false;
      }
    };
    
    fetchData();
  }, [searchParams]);

  // Build query string from filters
  const buildQueryString = useCallback((pageNum: number = 1) => {
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '12');
    params.set('page', pageNum.toString());
    
    if (filters.region) params.set('region', filters.region);
    if (filters.province) params.set('province', filters.province);
    if (filters.occupation) params.set('occupation', filters.occupation);
    if (filters.ageRange) params.set('age', filters.ageRange);
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    
    return params.toString();
  }, [filters]);

  // Fetch profiles from API
  const fetchProfiles = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const queryString = buildQueryString(pageNum);
      const response = await fetch(`/api/profiles?${queryString}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu hồ sơ');
      }
      
      const data = await response.json();
      
      if (append) {
        setProfiles(prev => {
          const newProfiles = [...prev, ...(data.profiles || [])];
          return newProfiles;
        });
      } else {
        setProfiles(data.profiles || []);
      }
      
      const newHasMore = data.pagination?.hasNext || false;
      setTotalCount(data.pagination?.total || 0);
      setHasMore(newHasMore);
      setPage(pageNum);
    } catch (err) {
      setError('Không thể tải dữ liệu hồ sơ');
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQueryString]);

  // Load more profiles
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProfiles(page + 1, true);
    }
  }, [fetchProfiles, page, loadingMore, hasMore]);

  // Removed the fetchProfiles useEffect to prevent double API calls
  // All fetching is now handled in the URL change effect above

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        
        if (target.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  // Separate effect to observe the trigger element when it becomes available
  useEffect(() => {
    if (observerRef.current && loadMoreRef.current && hasMore && !loadingMore) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasMore, loadingMore, profiles.length]); // Re-run when profiles change

  // Handle filter changes - use path for region/province/tags, query for age/occupation
  const handleFilterChange = (newFilters: FilterState) => {

    // Build path-based URL
    let newPath = '/gai-xinh';

    // Region (slug)
    let regionSlug = newFilters.region;

    // Province (slug) with auto region resolution if missing
    const provinceSlug = newFilters.province;
    if (provinceSlug && !regionSlug) {
      const selectedProvince = PROVINCES.find(p => p.slug === provinceSlug);
      if (selectedProvince) {
        const regionData = REGIONS.find(r => r.name === selectedProvince.region);
        if (regionData) {
          regionSlug = regionData.slug;
        }
      }
    }

    // Build path segments in order: region -> province
    if (regionSlug) {
      newPath += `/${regionSlug}`;
      if (provinceSlug) {
        newPath += `/${provinceSlug}`;
      }
    }

    // Tags as query parameter (slugified)
    
    // Query parameters: occupation and age
    const queryParams = new URLSearchParams();
    if (newFilters.occupation) {
      // Use SEO-friendly slug for occupation
      queryParams.set('occupation', occupationToSlug(newFilters.occupation));
    }
    if (newFilters.ageRange) {
      queryParams.set('age', newFilters.ageRange);
    }
    if (newFilters.tags && newFilters.tags.length > 0) {
      const tagSlugs = newFilters.tags.map(t => tagToSlug(t));
      queryParams.set('tags', tagSlugs.join(','));
    }

    const finalUrl = newPath + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    // Only use router.push - let useEffect handle filter updates and API calls
    router.push(finalUrl);
  };

  // Get unique values for filter options
  const tags = Array.from(new Set(profiles.flatMap(p => p.tags))).filter(Boolean);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 animate-gradient-shift"></div>
        
        {/* Floating Professional Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Icon 1 - Top Left */}
          <div className="absolute top-20 left-1/4 text-red-400 animate-float drop-shadow-lg" style={{ animationDelay: '0s', animationDuration: '4s' }}>
            <LipsIcon size={32} />
          </div>
          
          {/* Floating Icon 2 - Top Right */}
          <div className="absolute top-32 right-1/4 text-orange-400 animate-float drop-shadow-lg" style={{ animationDelay: '1s', animationDuration: '5s' }}>
            <FireIcon size={28} />
          </div>
          
          {/* Floating Icon 3 - Middle Left */}
          <div className="absolute top-1/2 left-20 text-emerald-400 animate-float drop-shadow-lg" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
            <RoseIcon size={24} />
          </div>
          
          {/* Floating Icon 4 - Middle Right */}
          <div className="absolute top-1/2 right-20 text-pink-400 animate-float drop-shadow-lg" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}>
            <HeartIcon size={30} />
          </div>
          
          {/* Floating Icon 5 - Bottom Left */}
          <div className="absolute bottom-32 left-1/3 text-cyan-400 animate-float drop-shadow-lg" style={{ animationDelay: '3s', animationDuration: '4s' }}>
            <DiamondIcon size={26} />
          </div>
          
          {/* Floating Icon 6 - Bottom Right */}
          <div className="absolute bottom-40 right-1/3 text-amber-400 animate-float drop-shadow-lg" style={{ animationDelay: '2.5s', animationDuration: '3.8s' }}>
            <WineIcon size={24} />
          </div>
          
          {/* Floating Icon 7 - Top Center */}
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-purple-400 animate-float drop-shadow-lg" style={{ animationDelay: '4s', animationDuration: '4.2s' }}>
            <SparkleIcon size={28} />
          </div>
          
          {/* Floating Icon 8 - Bottom Center */}
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-indigo-400 animate-float drop-shadow-lg" style={{ animationDelay: '3.5s', animationDuration: '5s' }}>
            <GemIcon size={26} />
          </div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Animated Title */}
          <h1 className="hero-title text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-pink-100 to-rose-100 bg-clip-text text-transparent drop-shadow-lg">
            {displayedText}
            <span className="text-pink-300 animate-pulse">|</span>
          </h1>
          
          {/* Seductive Description */}
          <div className="mb-8 bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <p className="text-lg md:text-xl text-white/90 font-medium">
              <span className="bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                💋 Nóng bỏng • Quyến rũ • Gợi cảm 🔥
              </span>
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-seductive px-8 py-4 rounded-full text-white font-bold text-lg hover-seductive neon-glow-seductive">
              🔥 Khám Phá Ngay
            </button>
            <button className="btn-seductive px-8 py-4 rounded-full text-white font-bold text-lg hover-seductive neon-glow-seductive">
              💋 Xem Hồ Sơ
            </button>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-pink-600 bg-clip-text text-transparent mb-8">
            Khám phá theo miền
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {REGIONS.map((region) => (
              <Link
                key={region.slug}
                href={`/gai-xinh/${region.slug}`}
                className="group bg-white/95 rounded-xl p-6 hover:bg-white transition-all duration-300 border border-gray-200/50 hover:border-pink-200 transform hover:scale-105 hover:shadow-lg text-center"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                      {region.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Khám phá {region.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <FilterBar
        occupations={DEFAULT_OCCUPATIONS}
        tags={tags.length > 0 ? tags : DEFAULT_TAGS}
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Profiles Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-pink-600 bg-clip-text text-transparent">
            {filters.region || filters.province || filters.occupation || filters.ageRange || filters.tags.length > 0 
              ? 'Kết quả tìm kiếm' 
              : 'Hồ sơ nổi bật'}
          </h2>

        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse shadow-lg">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles.map((profile) => (
                <ProfileCard key={profile.slug} profile={profile} />
              ))}
            </div>
            
            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center space-x-2 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-200 border-t-pink-500"></div>
                <span className="text-gray-600">Đang tải thêm...</span>
              </div>
            )}


            {/* Infinite Scroll Trigger */}
            {hasMore && !loadingMore && (
              <div 
                ref={loadMoreRef}
                className="h-20 mt-4"
                style={{ minHeight: '80px' }}
              />
            )}


          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có hồ sơ nào
              </h3>
              <p className="text-gray-600 mb-6">
                Hiện tại chưa có hồ sơ nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc quay lại sau.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    region: '',
                    province: '',
                    occupation: '',
                    ageRange: '',
                    tags: []
                  });
                  router.push('/gai-xinh');
                }}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
        </div>
      </section>
    </div>
  );
}