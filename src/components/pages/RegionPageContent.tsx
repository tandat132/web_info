'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FilterBar from '@/components/ui/FilterBar';
import ProfileCard from '@/components/ui/ProfileCard';
import { IProfile } from '@/models/Profile';
import { REGIONS, PROVINCES, DEFAULT_OCCUPATIONS } from '@/lib/constants';
import { slugToOccupation, occupationToSlug, slugToTag, tagToSlug } from '@/lib/utils';

interface RegionPageContentProps {
  regionSlug?: string;
  provinceSlug?: string;
  tagSlugs?: string[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function RegionPageContent({ 
  regionSlug, 
  provinceSlug, 
  tagSlugs = [],
  searchParams 
}: RegionPageContentProps) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Ref to prevent useEffect from overriding handleFilterChange
  const isFilterChangingRef = useRef(false);
  
  // Ref for infinite scroll trigger
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  // Parse tags from path-based slugs with proper memoization
  const tags = useMemo(() => {
    return tagSlugs.map(slug => slugToTag(slug));
  }, [tagSlugs]);
  
  const age = useMemo(() => {
    return searchParams.age as string;
  }, [searchParams]);
  
  // Find current region, province, occupation with memoization
  const currentRegion = useMemo(() => {
    return regionSlug ? REGIONS.find(r => r.slug === regionSlug) : null;
  }, [regionSlug]);
  
  const currentProvince = useMemo(() => {
    return provinceSlug ? PROVINCES.find(p => p.slug === provinceSlug) : null;
  }, [provinceSlug]);
  
  const currentOccupation = useMemo(() => {
    return searchParams.occupation as string || '';
  }, [searchParams.occupation]);
  


  // Build query string from current filters
  const buildQueryString = useCallback((pageNum: number = 1) => {
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '12');
    params.set('page', pageNum.toString());
    
    // For gai-xinh page, load all profiles sorted by newest (no featured filter)
    // This is different from homepage which loads featured when no filters
    
    if (currentRegion) {
      params.set('region', currentRegion.name);
    }
    
    if (currentProvince) {
      params.set('province', currentProvince.name);
    }
    
    if (currentOccupation) {
      params.set('occupation', currentOccupation);
    }
    
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    }
    
    if (age) {
      if (age === 'duoi-18') {
        params.set('ageMax', '17');
      } else if (age === 'tren-35') {
        params.set('ageMin', '36');
      } else {
        const [ageMin, ageMax] = age.split('-').map(Number);
        if (ageMin) params.set('ageMin', ageMin.toString());
        if (ageMax) params.set('ageMax', ageMax.toString());
      }
    }
    
    return params.toString();
  }, [currentRegion, currentProvince, currentOccupation, tags, age]);

  // Fetch profiles from API (similar to homepage)
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
      const newProfiles: IProfile[] = (data.profiles || data.data || []) as IProfile[];

      if (append) {
        setProfiles(prev => {
          // Filter out duplicates based on slug (stable identifier)
          const existingSlugs = new Set(prev.map(p => p.slug));
          const uniqueNewProfiles = newProfiles.filter((p: IProfile) => !existingSlugs.has(p.slug));
          return [...prev, ...uniqueNewProfiles];
        });
      } else {
        setProfiles(newProfiles);
      }
      
      const newHasMore = data.pagination?.hasNext || false;
      setHasMore(newHasMore);
      setPage(pageNum);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQueryString]);

  // Load more profiles (similar to homepage)
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) {
      return;
    }
    
    fetchProfiles(page + 1, true);
  }, [loadingMore, hasMore, page, fetchProfiles]);

  // Reset state and fetch when filters change (combined to avoid infinite loop)
  useEffect(() => {
    // Skip if filter change is in progress (handled by handleFilterChange)
    if (isFilterChangingRef.current) {
      isFilterChangingRef.current = false;
      return;
    }
    
    setProfiles([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    
    // Build query string inline to avoid dependency issues
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '12');
    params.set('page', '1');
    
    if (currentRegion) {
      params.set('region', currentRegion.name);
    }
    
    if (currentProvince) {
      params.set('province', currentProvince.name);
    }
    
    if (currentOccupation) {
      params.set('occupation', currentOccupation);
    }
    
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    }
    
    if (age) {
      if (age === 'duoi-18') {
        params.set('ageMax', '17');
      } else if (age === 'tren-35') {
        params.set('ageMin', '36');
      } else {
        const [ageMin, ageMax] = age.split('-').map(Number);
        if (ageMin) params.set('ageMin', ageMin.toString());
        if (ageMax) params.set('ageMax', ageMax.toString());
      }
    }
    
    // Fetch profiles with current filters
    fetch(`/api/profiles?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const profiles = data.profiles || data.data || [];
        setProfiles(profiles);
        const newHasMore = data.pagination?.hasNext || false;
        setHasMore(newHasMore);
        setPage(1);
        setTotalCount(data.pagination?.total || 0);
      })
      .catch(err => {
        console.error('Error fetching profiles:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentRegion, currentProvince, currentOccupation, tags, age]);

  // Setup IntersectionObserver for infinite scroll (same as homepage)
  useEffect(() => {
    if (!loadMoreRef.current) {
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
  
    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loadMore, profiles.length, page]);

  // Handle filter changes
  type FilterChange = {
  region: string;
  province: string;
  occupation: string;
  ageRange: string;
  tags: string[];
  };
  const handleFilterChange = (newFilters: FilterChange) => {
    // Set flag to prevent useEffect from overriding this call
    isFilterChangingRef.current = true;
    
    // Build new URL
    let newUrl = '/gai-xinh';
    
    // Add path parameters (region, province)
    // Region is passed as slug; append directly
    if (newFilters.region) {
      newUrl += `/${newFilters.region}`;
    }
    
    // Province is slug; if region missing, resolve region slug from province's region name
    if (newFilters.province) {
      const province = PROVINCES.find(p => p.slug === newFilters.province);
      if (province) {
        if (!newFilters.region) {
          const regionData = REGIONS.find(r => r.name === province.region);
          if (regionData) newUrl += `/${regionData.slug}`;
        }
        newUrl += `/${newFilters.province}`;
      }
    }
    
    // Add query parameters (occupation, tags, age)
    const queryParams = new URLSearchParams();
    if (newFilters.occupation) {
      queryParams.set('occupation', occupationToSlug(newFilters.occupation));
    }
    
    // Tags as query parameter (slugified)
    if (newFilters.tags && newFilters.tags.length > 0) {
      const tagSlugs = newFilters.tags.map((t: string) => tagToSlug(t));
      queryParams.set('tags', tagSlugs.join(','));
    }
    if (newFilters.ageRange) {
      queryParams.set('age', newFilters.ageRange);
    }
    
    if (queryParams.toString()) {
      newUrl += `?${queryParams.toString()}`;
    }
    
    // Navigate to new URL
    router.push(newUrl);
    
    // Immediately fetch data with new filters to avoid delay
    const fetchParams = new URLSearchParams();
    fetchParams.set('status', 'published');
    fetchParams.set('limit', '12');
    fetchParams.set('page', '1');
    
    // Map filter values to API parameters
    if (newFilters.region) {
      const region = REGIONS.find(r => r.slug === newFilters.region);
      if (region) fetchParams.set('region', region.name);
    }
    
    if (newFilters.province) {
      const province = PROVINCES.find(p => p.slug === newFilters.province);
      if (province) fetchParams.set('province', province.name);
    }
    
    if (newFilters.occupation) {
      fetchParams.set('occupation', newFilters.occupation);
    }
    
    if (newFilters.tags && newFilters.tags.length > 0) {
      fetchParams.set('tags', newFilters.tags.join(','));
    }
    
    if (newFilters.ageRange) {
      if (newFilters.ageRange === 'duoi-18') {
        fetchParams.set('ageMax', '17');
      } else if (newFilters.ageRange === 'tren-35') {
        fetchParams.set('ageMin', '36');
      } else {
        const [ageMin, ageMax] = newFilters.ageRange.split('-').map(Number);
        if (ageMin) fetchParams.set('ageMin', ageMin.toString());
        if (ageMax) fetchParams.set('ageMax', ageMax.toString());
      }
    }
    
    // Reset state and fetch immediately
    setProfiles([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    
    // Fetch profiles with new filters immediately
    fetch(`/api/profiles?${fetchParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        const profiles = data.profiles || data.data || [];
        setProfiles(profiles);
        const newHasMore = data.pagination?.hasNext || false;
        setHasMore(newHasMore);
        setPage(1);
        setTotalCount(data.pagination?.total || 0);
      })
      .catch(err => {
        console.error('Error fetching profiles:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Gái xinh', href: '/gai-xinh' },
  ];
  
  if (currentRegion) {
    breadcrumbs.push({
      label: currentRegion.name,
      href: `/gai-xinh/${currentRegion.slug}`
    });
  }
  
  if (currentProvince) {
    breadcrumbs.push({
      label: currentProvince.name,
      href: `/gai-xinh/${currentRegion?.slug || 'mien-bac'}/${currentProvince.slug}`
    });
  }
  
  if (currentOccupation) {
    breadcrumbs.push({
      label: slugToOccupation(currentOccupation) || currentOccupation,
      href: `/gai-xinh/${currentRegion?.slug || 'mien-bac'}/${currentProvince?.slug || 'ha-noi'}?occupation=${currentOccupation}`
    });
  }
  
  // Build page title
  let pageTitle = 'Gái xinh';
  if (currentOccupation) pageTitle += ` ${slugToOccupation(currentOccupation) || currentOccupation}`;
  if (currentProvince) pageTitle += ` ${currentProvince.name}`;
  else if (currentRegion) pageTitle += ` ${currentRegion.name}`;
  if (age) pageTitle += ` ${age} tuổi`;
  if (tags.length > 0) pageTitle += ` ${tags.join(', ')}`;
  
  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <nav className="bg-gray-50 py-3">
        <div className="container mx-auto px-4">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="text-gray-400 mr-2">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-gray-500 hover:text-gray-700">
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {pageTitle}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
            Khám phá bộ sưu tập gái xinh, gái đẹp chất lượng cao. 
            {totalCount > 0 && ` Tìm thấy ${totalCount} hồ sơ phù hợp.`}
          </p>
          <div className="flex justify-center space-x-4">
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
              {totalCount} hồ sơ
            </div>
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
              Cập nhật liên tục
            </div>
          </div>
        </div>
        

      </section>
      
      {/* Filter Bar */}
      <FilterBar
        occupations={DEFAULT_OCCUPATIONS}
        onFilterChange={handleFilterChange}
        initialFilters={{
          region: currentRegion?.slug || '',
          province: currentProvince?.slug || '',
          occupation: currentOccupation || '',
          tags: tags,
          ageRange: age || ''
        }}
      />
      
      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-300 border-t-pink-600"></div>
                  <span className="text-gray-600">Đang tải thêm...</span>
                </div>
              )}
              


              {/* Infinite Scroll Trigger */}
              {hasMore && !loadingMore && (
                <div 
                  ref={loadMoreRef}
                  className="h-20 mt-8"
                  style={{ minHeight: '80px' }}
                />
              )}
              


            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy hồ sơ nào
              </h3>
              <p className="text-gray-600 mb-6">
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
              <Link
                href="/gai-xinh"
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Xem tất cả hồ sơ
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Related Links */}
      {(currentRegion || currentProvince || currentOccupation) && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Khám phá thêm
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Popular regions */}
              {!currentRegion && REGIONS.slice(0, 4).map(region => (
                <Link
                  key={region.code}
                  href={`/gai-xinh/${region.slug}`}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="font-medium text-gray-900">{region.name}</div>
                </Link>
              ))}
              
              {/* Popular provinces in current region */}
              {currentRegion && !currentProvince && 
                PROVINCES.filter(p => p.region === currentRegion.code).slice(0, 4).map(province => (
                  <Link
                    key={province.slug}
                    href={`/gai-xinh/${currentRegion.slug}/${province.slug}`}
                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                  >
                    <div className="font-medium text-gray-900">{province.name}</div>
                  </Link>
                ))
              }
              
              {/* Popular occupations */}
              {currentProvince && !currentOccupation &&
                DEFAULT_OCCUPATIONS.slice(0, 4).map(occupation => (
                  <Link
                    key={occupation}
                    href={`/gai-xinh/${currentRegion?.slug}/${currentProvince.slug}?occupation=${occupationToSlug(occupation)}`}
                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                  >
                    <div className="font-medium text-gray-900">{occupation}</div>
                  </Link>
                ))
              }
            </div>
          </div>
        </section>
      )}

    </div>
  );
}