'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FilterBar from '@/components/ui/FilterBar';
import ProfileCard from '@/components/ui/ProfileCard';
import ParticlesBackground from '@/components/ui/ParticlesBackground';
import { HomePageStructuredData } from '@/components/seo/StructuredData';
import { DEFAULT_OCCUPATIONS, DEFAULT_TAGS, PROVINCES } from '@/lib/constants';
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
  'Duyên Dáng Á Đông 🌸',
];

export default function HomePage() {
  const searchParams = useSearchParams();
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
    
    setFilters(newFilters);
  }, [searchParams]);

  // Build query string from filters
  const buildQueryString = useCallback((pageNum: number = 1) => {
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '12');
    params.set('page', pageNum.toString());
    
    // Check if any filters are applied
    const hasFilters = filters.region || filters.province || filters.occupation || filters.ageRange || filters.tags.length > 0;
    
    // If no filters are applied, show only featured profiles on homepage
    if (!hasFilters) {
      params.set('featured', 'true');
    }
    
    if (filters.region) params.set('region', filters.region);
    if (filters.province) params.set('province', filters.province);
    // Occupation is expected as slug in query
    if (filters.occupation) params.set('occupation', filters.occupation);
    
    // Handle age range
    if (filters.ageRange) {
      params.set('age', filters.ageRange);
    }
    
    // Tags are expected as comma-separated slugs in query
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      


      const profiles = data.profiles || data.data || [];

      if (append) {
        setProfiles(prev => {
          // Filter out duplicates based on _id
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueNewProfiles = profiles.filter((p: Profile) => !existingIds.has(p._id));
          console.log('🔍 Adding new profiles:', {
            existingCount: prev.length,
            newProfilesCount: uniqueNewProfiles.length,
            totalAfter: prev.length + uniqueNewProfiles.length
          });
          return [...prev, ...uniqueNewProfiles];
        });
      } else {
        setProfiles(profiles);
        console.log('🔍 Setting initial profiles:', profiles.length);
      }
      
      setTotalCount(data.pagination?.total || 0);
      const newHasMore = data.pagination?.hasNext || false;
      setHasMore(newHasMore);
      setPage(pageNum);
      
      console.log('🔍 State updated:', {
        hasMore: newHasMore,
        page: pageNum,
        paginationHasNext: data.pagination?.hasNext,
        paginationTotal: data.pagination?.total,
        paginationPages: data.pagination?.pages,
        paginationPage: data.pagination?.page
      });
    } catch (err) {
      setError('Không thể tải dữ liệu hồ sơ');
      console.error('Error fetching profiles:', err);
      // Nếu có lỗi, set hasMore = false để tránh infinite loop
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQueryString]);

  // Load more profiles
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) {
      return;
    }
    
    fetchProfiles(page + 1, true);
  }, [loadingMore, hasMore, page, fetchProfiles]);

  // Initial load
  useEffect(() => {
    fetchProfiles(1, false);
  }, [fetchProfiles]);





  // Setup IntersectionObserver for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    console.log('🔍 IntersectionObserver setup:', { 
      hasLoadMoreRef: !!loadMoreRef.current, 
      hasMore, 
      loadingMore, 
      page,
      profilesCount: profiles.length 
    });
    
    if (!loadMoreRef.current) {
      console.log('❌ loadMoreRef.current is null');
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  
      console.log('✅ Observing element:', loadMoreRef.current);
    observer.observe(loadMoreRef.current);

    return () => {
      console.log('🧹 Disconnecting observer');
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loadMore, profiles.length, page]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
    setHasMore(true);
  };

  // Get unique values for filter options
  const tags = Array.from(new Set(profiles.flatMap(p => p.tags))).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const featuredProfiles = profiles.filter(profile => profile.isFeatured);

  return (
    <>
      <HomePageStructuredData featuredProfiles={featuredProfiles} />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white py-20 relative overflow-hidden">
          {/* Particles Background */}
          <ParticlesBackground 
            particleCount={60}
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 182, 193, 0.2)', 'rgba(147, 51, 234, 0.15)']}
            speed={0.3}
          />
          
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/90 via-rose-500/90 to-purple-600/90 animate-gradient-shift"></div>
          
          {/* Glassmorphism Floating Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 glass rounded-full animate-float neon-glow" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
            <div className="absolute top-32 right-20 w-16 h-16 glass rounded-full animate-float neon-glow-purple" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 glass rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-8 h-8 glass rounded-full animate-float" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
            <div className="absolute bottom-32 right-10 w-14 h-14 glass rounded-full animate-float animate-pulse-glow" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
            
            {/* Floating Professional Icons */}
            <div className="floating-icon absolute top-20 left-1/3 text-red-500/60 animate-float" style={{ animationDelay: '0.5s', animationDuration: '4s' }}>
              <LipsIcon size={28} />
            </div>
            <div className="floating-icon absolute bottom-40 right-1/4 text-orange-500/70 animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }}>
              <FireIcon size={24} />
            </div>
            <div className="floating-icon absolute top-1/3 left-20 text-pink-500/60 animate-float" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}>
              <HeartIcon size={20} />
            </div>
            <div className="floating-icon absolute top-1/2 right-20 text-purple-500/60 animate-float" style={{ animationDelay: '3s', animationDuration: '4.5s' }}>
              <SparkleIcon size={24} />
            </div>
            <div className="floating-icon absolute bottom-20 left-1/4 text-emerald-500/60 animate-float" style={{ animationDelay: '1s', animationDuration: '3s' }}>
              <RoseIcon size={20} />
            </div>
            <div className="floating-icon absolute bottom-1/3 right-16 text-cyan-500/60 animate-float" style={{ animationDelay: '3s', animationDuration: '4.5s' }}>
              <DiamondIcon size={24} />
            </div>
            <div className="floating-icon absolute top-40 right-1/3 text-amber-500/60 animate-float" style={{ animationDelay: '2.5s', animationDuration: '3.8s' }}>
              <WineIcon size={20} />
            </div>
            <div className="floating-icon absolute bottom-1/2 left-16 text-indigo-500/60 animate-float" style={{ animationDelay: '4s', animationDuration: '4.2s' }}>
              <GemIcon size={22} />
            </div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            {/* Animated Title */}
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-pink-100 to-rose-100 bg-clip-text text-transparent drop-shadow-lg animate-sultry-glow">
              {displayedText}
              <span className="text-pink-200 animate-pulse">|</span>
            </h1>
            
            {/* Seductive Description */}
            <div className="mb-12 glass-seductive rounded-2xl p-8 animate-sensual-pulse">
              <p className="text-xl md:text-2xl text-white/90 font-medium animate-sultry-glow">
                <span className="bg-gradient-to-r from-pink-200 via-rose-200 to-purple-200 bg-clip-text text-transparent">
                  💋 Nóng bỏng • Quyến rũ • Gợi cảm 🔥
                </span>
              </p>
            </div>
            
            {/* Seductive Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="btn-seductive px-8 py-4 rounded-full text-white font-bold text-lg hover-seductive neon-glow-seductive">
                🔥 Nóng Bỏng
              </button>
              <button className="btn-seductive px-8 py-4 rounded-full text-white font-bold text-lg hover-seductive neon-glow-seductive">
                💋 Quyến Rũ
              </button>
              <button className="btn-seductive px-8 py-4 rounded-full text-white font-bold text-lg hover-seductive neon-glow-seductive">
                😈 Gợi Cảm
              </button>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <FilterBar
          basePath="/gai-xinh"
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
                  ? 'Tất cả hồ sơ' 
                  : 'Hồ sơ nổi bật'}
              </h2>

            </div>

            {profiles.length === 0 ? (
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
                    onClick={() => setFilters({
                      region: '',
                      province: '',
                      occupation: '',
                      ageRange: '',
                      tags: []
                    })}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {profiles.map((profile, index) => (
                    <ProfileCard 
                      key={profile.slug} 
                      profile={profile} 
                      priority={index < 4} 
                    />
                  ))}
                </div>


                
                {/* End message */}
                {!hasMore && profiles.length > 0 && (
                  <div className="text-center py-8 mt-12">
                    <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border border-green-200/50">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-700 font-medium">Đã hiển thị tất cả hồ sơ</span>
                    </div>
                  </div>
                )}
                




                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center space-x-2 py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-300 border-t-pink-600"></div>
                    <span className="text-gray-600">Đang tải thêm...</span>
                  </div>
                )}
                
                {/* Infinite Scroll Trigger */}
                {hasMore && !loadingMore && (
                  <div 
                    ref={loadMoreRef}
                    className="h-20 flex items-center justify-center text-gray-500 text-sm mt-4"
                    style={{ minHeight: '80px' }}
                  >
                    {/* Hidden trigger for infinite scroll */}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Popular Provinces Section */}
        <section className="py-12 bg-white/95">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-pink-600 bg-clip-text text-transparent mb-8">
              Tỉnh thành phổ biến
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              
              {PROVINCES.slice(0, 12).map((province) => (
                <Link
                  key={province.slug}
                  href={`/gai-xinh/${province.region === 'Miền Bắc' ? 'mien-bac' : province.region === 'Miền Trung' ? 'mien-trung' : 'mien-nam'}/${province.slug}`}
                  className="group p-4 bg-white/95 rounded-xl text-center hover:bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-200/50 hover:border-pink-200"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">{province.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                     {province.region}
                    </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
