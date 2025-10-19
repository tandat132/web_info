'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileCard from '@/components/ui/ProfileCard';
import FilterBar from '@/components/ui/FilterBar';
import { Profile } from '@/types/profile';

interface AgeRange {
  slug: string;
  label: string;
  min: number;
  max: number;
}

interface AgePageContentProps {
  ageRange: AgeRange;
}

export default function AgePageContent({ ageRange }: AgePageContentProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/profiles?ageMin=${ageRange.min}&ageMax=${ageRange.max}&status=published&limit=24`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }

        const data = await response.json();
        setProfiles(data.profiles || []);
        setTotalCount(data.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [ageRange.min, ageRange.max]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Gái xinh {ageRange.label}
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Khám phá {totalCount} hồ sơ gái xinh {ageRange.label} với thông tin chi tiết và hình ảnh đẹp nhất
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                📊 {totalCount} hồ sơ
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                🎯 Độ tuổi {ageRange.min}-{ageRange.max}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar 
        hideAgeFilter={true}
        initialFilters={{
          region: '',
          province: '',
          occupation: '',
          ageRange: ageRange.slug,
          tags: []
        }}
      />

      {/* Profiles Grid */}
      <div className="container mx-auto px-4 py-12">
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.slug} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Chưa có hồ sơ nào
            </h3>
            <p className="text-gray-600 mb-8">
              Hiện tại chưa có hồ sơ nào cho độ tuổi {ageRange.label}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        )}
      </div>

      {/* Related Age Ranges */}
      <div className="bg-white/50 backdrop-blur-sm border-t border-white/20 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Độ tuổi khác
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { slug: '18-22', label: '18-22 tuổi' },
              { slug: '23-27', label: '23-27 tuổi' },
              { slug: '28-32', label: '28-32 tuổi' },
              { slug: '33-37', label: '33-37 tuổi' },
              { slug: '38-42', label: '38-42 tuổi' },
              { slug: '43-50', label: '43-50 tuổi' }
            ].map((range) => (
              <Link
                key={range.slug}
                href={`/tuoi/${range.slug}`}
                className={`block p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                  range.slug === ageRange.slug
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 hover:bg-white text-gray-700 hover:shadow-lg border border-gray-200'
                }`}
              >
                <div className="font-semibold">{range.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}