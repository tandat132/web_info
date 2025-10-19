'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, MapPinIcon, BriefcaseIcon, UserIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OptimizedImage from '@/components/ui/OptimizedImage';
import StructuredData from '@/components/seo/StructuredData';
import { PROVINCES, REGIONS } from '@/lib/constants';

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

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProfiles, setRelatedProfiles] = useState<Profile[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profiles/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/404');
            return;
          }
          throw new Error('Không thể tải thông tin hồ sơ');
        }
        
        const data = await response.json();
        setProfile(data.profile || data);
        
        // Fetch related profiles only if we have valid data
        const profileData = data.profile || data;
        if (profileData && profileData.province && profileData._id) {
          const relatedResponse = await fetch(`/api/profiles?province=${encodeURIComponent(profileData.province)}&limit=4&exclude=${profileData._id}`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedProfiles(relatedData.profiles || []);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfile();
    }
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-pink-600 hover:text-pink-700">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const regionNames = {
    'mien-nam': 'Miền Nam',
    'mien-bac': 'Miền Bắc', 
    'mien-trung': 'Miền Trung'
  };

  return (
    <>
      <StructuredData profile={profile} />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Quay về trang chủ
            </Link>
            
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.name}
                  </h1>
                  <div className="flex items-center space-x-3 mb-2">
                    {profile.isFeatured && (
                      <span className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                        ⭐ Hồ sơ nổi bật
                      </span>
                    )}
                    {profile.region && (
                      <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                        📍 {regionNames[profile.region] || profile.region}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-pink-600">
                    {profile.age} tuổi
                  </div>
                  <div className="text-sm text-gray-500 flex items-center justify-end">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {profile.province}
                  </div>
                </div>
              </div>

              {/* Basic Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                  <UserIcon className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">{profile.age}</div>
                  <div className="text-sm text-gray-500">Tuổi</div>
                </div>
                
                {profile.height && (
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="text-lg font-semibold text-gray-900">{profile.height}cm</div>
                    <div className="text-sm text-gray-500">Chiều cao</div>
                  </div>
                )}
                
                {profile.weight && (
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="text-lg font-semibold text-gray-900">{profile.weight}kg</div>
                    <div className="text-sm text-gray-500">Cân nặng</div>
                  </div>
                )}
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                  <BriefcaseIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900">{profile.occupation}</div>
                  <div className="text-sm text-gray-500">Nghề nghiệp</div>
                </div>
              </div>

              {/* Description */}
              {profile.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Giới thiệu</h3>
                  <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                </div>
              )}

              {/* Tags */}
              {profile.tags && profile.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Đặc điểm nổi bật</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 text-sm px-3 py-1 rounded-full border border-pink-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bộ sưu tập ảnh</h2>
              {profile.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.photos.map((photo, index) => (
                    <div 
                      key={index} 
                      className="relative rounded-xl overflow-hidden group"
                      style={{ aspectRatio: `${photo.width}/${photo.height}` }}
                    >
                      <OptimizedImage
                        src={photo.url}
                        baseFilename={photo.baseFilename}
                        alt={`${profile.name}, ${profile.age} tuổi, ${profile.province} - ${photo.alt}`}
                        width={photo.width}
                        height={photo.height}
                        dominantColor={photo.dominantColor}
                        blurDataURL={photo.blurDataURL}
                        priority={index === 0}
                        fill
                        size="large"
                        className="transition-transform duration-300 group-hover:scale-105 object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      
                      {/* Caption overlay */}
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white text-sm">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có ảnh nào được tải lên</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tóm tắt</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuổi:</span>
                  <span className="font-medium">{profile.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khu vực:</span>
                  <span className="font-medium">{regionNames[profile.region] || profile.region || 'Chưa xác định'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỉnh/TP:</span>
                  <span className="font-medium">{profile.province}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nghề nghiệp:</span>
                  <span className="font-medium">{profile.occupation}</span>
                </div>
                {profile.height && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chiều cao:</span>
                    <span className="font-medium">{profile.height}cm</span>
                  </div>
                )}
                {profile.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cân nặng:</span>
                    <span className="font-medium">{profile.weight}kg</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Profiles */}
            {relatedProfiles && relatedProfiles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Hồ sơ liên quan
                </h3>
                <div className="space-y-4">
                  {relatedProfiles.slice(0, 3).map((relatedProfile) => (
                    <Link
                      key={relatedProfile._id}
                      href={`/ho-so/${relatedProfile.slug}`}
                      className="block group"
                    >
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200 border border-transparent hover:border-pink-200">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                          {relatedProfile.photos && relatedProfile.photos[0] ? (
                            <OptimizedImage
                              src={relatedProfile.photos[0].url}
                              baseFilename={relatedProfile.photos[0].baseFilename}
                              alt={`${relatedProfile.name}, ${relatedProfile.age} tuổi, ${relatedProfile.province}`}
                              width={relatedProfile.photos[0].width}
                              height={relatedProfile.photos[0].height}
                              dominantColor={relatedProfile.photos[0].dominantColor}
                              blurDataURL={relatedProfile.photos[0].blurDataURL}
                              fill
                              size="thumbnail"
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors mb-1">
                            {relatedProfile.name}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600 flex items-center">
                              <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                              {relatedProfile.age} tuổi • {relatedProfile.occupation}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {relatedProfile.province}
                            </p>
                            {relatedProfile.tags && relatedProfile.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {relatedProfile.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full shadow-sm"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {relatedProfile.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">+{relatedProfile.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link
                  href={(() => {
                    const province = PROVINCES.find(p => p.name === profile.province);
                    if (!province) return '/gai-xinh';
                    const region = REGIONS.find(r => r.name === province.region);
                    const regionSlug = region?.slug || 'mien-bac';
                    return `/gai-xinh/${regionSlug}/${province.slug}`;
                  })()}
                  className="block mt-6 text-center text-sm bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium"
                >
                  Xem thêm hồ sơ tại {profile.province} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}