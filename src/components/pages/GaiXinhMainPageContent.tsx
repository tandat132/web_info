'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FilterBar from '@/components/ui/FilterBar';
import ProfileCard from '@/components/ui/ProfileCard';
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
  'Duyên Dáng Á Đông 🌸'
];

export default function GaiXinhMainPageContent() {
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

  // Initialize filters from URL params
  useEffect(() => {
    const region = searchParams.get('region') || '';
    const province = searchParams.get('province') || '';
    const occupation = searchParams.get('occupation') || '';
    const ageRange = searchParams.get('ageRange') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    setFilters({
      region,
      province,
      occupation,
      ageRange,
      tags
    });
  }, [searchParams]);

  const buildQueryString = useCallback((filters: FilterState, pageNum: number = 1) => {
    const params = new URLSearchParams();
    
    if (filters.region) params.append('region', filters.region);
    if (filters.province) params.append('province', filters.province);
    if (filters.occupation) params.append('occupation', filters.occupation);
    if (filters.ageRange) params.append('ageRange', filters.ageRange);
    if (filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    
    params.append('page', pageNum.toString());
    params.append('limit', '12');
    
    return params.toString();
  }, []);

  const fetchProfiles = useCallback(async (filters: FilterState, pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const queryString = buildQueryString(filters, pageNum);
      const response = await fetch(`/api/profiles?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (append) {
        setProfiles(prev => [...prev, ...data.profiles]);
      } else {
        setProfiles(data.profiles);
      }
      
      setTotalCount(data.totalCount);
      setHasMore(data.profiles.length === 12);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      if (!append) {
        setProfiles([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQueryString]);

  // Fetch profiles when filters change
  useEffect(() => {
    fetchProfiles(filters, 1, false);
  }, [filters, fetchProfiles]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
    
    // Update URL
    const params = new URLSearchParams();
    if (newFilters.region) params.set('region', newFilters.region);
    if (newFilters.province) params.set('province', newFilters.province);
    if (newFilters.occupation) params.set('occupation', newFilters.occupation);
    if (newFilters.ageRange) params.set('ageRange', newFilters.ageRange);
    if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','));
    
    const queryString = params.toString();
    const newUrl = queryString ? `/gai-xinh?${queryString}` : '/gai-xinh';
    router.push(newUrl, { scroll: false });
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProfiles(filters, page + 1, true);
    }
  }, [filters, page, loadingMore, hasMore, fetchProfiles]);

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProfileElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        handleLoadMore();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, handleLoadMore]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => fetchProfiles(filters, 1, false)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-pink-300/20 to-rose-300/20 rounded-full blur-lg animate-pulse delay-2000"></div>
        </div>

        {/* Glassmorphism Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-1/4 w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rotate-12 animate-float"></div>
          <div className="absolute top-48 right-1/3 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl -rotate-12 animate-float-delayed"></div>
          <div className="absolute bottom-32 left-1/3 w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rotate-45 animate-float-slow"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 left-1/6 text-pink-300/40 animate-float">
            <HeartIcon className="w-8 h-8" />
          </div>
          <div className="absolute top-36 right-1/4 text-purple-300/40 animate-float-delayed">
            <FireIcon className="w-6 h-6" />
          </div>
          <div className="absolute top-52 left-3/4 text-rose-300/40 animate-float-slow">
            <DiamondIcon className="w-7 h-7" />
          </div>
          <div className="absolute bottom-48 left-1/5 text-pink-300/40 animate-float">
            <WineIcon className="w-6 h-6" />
          </div>
          <div className="absolute bottom-36 right-1/6 text-purple-300/40 animate-float-delayed">
            <RoseIcon className="w-8 h-8" />
          </div>
          <div className="absolute bottom-52 left-2/3 text-rose-300/40 animate-float-slow">
            <LipsIcon className="w-6 h-6" />
          </div>
          <div className="absolute top-44 left-1/2 text-pink-300/40 animate-float">
            <GemIcon className="w-5 h-5" />
          </div>
          <div className="absolute bottom-44 right-1/3 text-purple-300/40 animate-float-delayed">
            <SparkleIcon className="w-7 h-7" />
          </div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {displayedText}
              <span className="animate-pulse">|</span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Khám phá vẻ đẹp tự nhiên và quyến rũ của những cô gái Việt Nam. 
            Nơi hội tụ nhan sắc và tài năng từ khắp mọi miền đất nước.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-pink-200/50 shadow-lg">
              <span className="text-pink-600 font-semibold">🌸 Miền Bắc</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-200/50 shadow-lg">
              <span className="text-purple-600 font-semibold">🌺 Miền Trung</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-indigo-200/50 shadow-lg">
              <span className="text-indigo-600 font-semibold">🌹 Miền Nam</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="relative py-8 px-4">
        <div className="container mx-auto">
          <FilterBar 
            initialFilters={filters}
            onFilterChange={handleFilterChange}
            occupations={DEFAULT_OCCUPATIONS}
            tags={DEFAULT_TAGS}
            provinces={PROVINCES}
          />
        </div>
      </section>

      {/* Profiles Section */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : profiles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {profiles.map((profile, index) => (
                  <div
                    key={profile._id}
                    ref={index === profiles.length - 1 ? lastProfileElementRef : null}
                  >
                    <ProfileCard profile={profile} />
                  </div>
                ))}
              </div>
              
              {loadingMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                      <div className="aspect-[3/4] bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-600 mb-6">Thử thay đổi bộ lọc để tìm kiếm kết quả phù hợp hơn.</p>
              <button 
                onClick={() => handleFilterChange({
                  region: '',
                  province: '',
                  occupation: '',
                  ageRange: '',
                  tags: []
                })}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}