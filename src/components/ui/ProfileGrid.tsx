'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProfileCard from './ProfileCard';
import Pagination from './Pagination';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { slugToOccupation, tagToSlug } from '@/lib/utils';

// Derive the exact profile type expected by ProfileCard
type CardProfileType = Parameters<typeof ProfileCard>[0]['profile'];
// Extend with optional region for local filtering in Grid
type GridProfileType = CardProfileType & { region?: string };

// Mock data - in real app, this would come from API/database
const mockProfiles: GridProfileType[] = [
  {
    slug: 'linh-22-tuoi-sinh-vien-quan-1',
    name: 'Linh',
    age: 22,
    province: 'Hà Nội',
    occupation: 'Sinh viên',
    tags: ['Dễ thương', 'Năng động'],
    photos: [{ url: '/api/placeholder/300/400', alt: 'Linh 22 tuổi', baseFilename: 'placeholder-1', width: 300, height: 400 }],
    isFeatured: true,
    region: 'Miền Bắc',
  },
  {
    slug: 'mai-24-tuoi-nguoi-mau-ha-noi',
    name: 'Mai',
    age: 24,
    province: 'TP. Hồ Chí Minh',
    occupation: 'Người mẫu',
    tags: ['Xinh đẹp', 'Chuyên nghiệp'],
    photos: [{ url: '/api/placeholder/300/400', alt: 'Mai 24 tuổi', baseFilename: 'placeholder-2', width: 300, height: 400 }],
    isFeatured: true,
    region: 'Miền Nam',
  },
  {
    slug: 'huong-26-tuoi-nhan-vien-van-phong-da-nang',
    name: 'Hương',
    age: 26,
    province: 'Đà Nẵng',
    occupation: 'Nhân viên văn phòng',
    tags: ['Thân thiện', 'Tự tin'],
    photos: [{ url: '/api/placeholder/300/400', alt: 'Hương 26 tuổi', baseFilename: 'placeholder-3', width: 300, height: 400 }],
    isFeatured: false,
    region: 'Miền Trung',
  },
  {
    slug: 'thao-23-tuoi-giao-vien-hai-phong',
    name: 'Thảo',
    age: 23,
    province: 'Hải Phòng',
    occupation: 'Giáo viên',
    tags: ['Hiền lành', 'Thông minh'],
    photos: [{ url: '/api/placeholder/300/400', alt: 'Thảo 23 tuổi', baseFilename: 'placeholder-4', width: 300, height: 400 }],
    isFeatured: false,
    region: 'Miền Bắc',
  },
  // Add more mock profiles...
  ...Array.from({ length: 20 }, (_, i) => ({
    slug: `gai-xinh-${i + 5}-tuoi`,
    name: `Gái xinh ${i + 5}`,
    age: 20 + (i % 8),
    province: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'][i % 4],
    occupation: ['Sinh viên', 'Nhân viên', 'Giáo viên', 'Bác sĩ'][i % 4],
    tags: ['Xinh đẹp', 'Dễ thương'],
    photos: [{ url: '/api/placeholder/300/400', alt: `Gái xinh ${i + 5}` , baseFilename: `placeholder-${i + 5}`, width: 300, height: 400 }],
    isFeatured: i % 5 === 0,
    region: ['Miền Bắc', 'Miền Nam', 'Miền Trung'][i % 3],
  }))
];

interface ProfileGridProps {
  initialProfiles?: GridProfileType[];
  profiles?: GridProfileType[];
  showFilters?: boolean;
}

import { PROVINCES } from '@/lib/constants';

// Map region codes to Vietnamese names
const REGION_CODE_TO_NAME: Record<string, string> = {
  'bac': 'Miền Bắc',
  'trung': 'Miền Trung', 
  'nam': 'Miền Nam'
};

// Create province slug to name mapping
const PROVINCE_SLUG_TO_NAME: Record<string, string> = {};
PROVINCES.forEach(province => {
  PROVINCE_SLUG_TO_NAME[province.slug] = province.name;
});

export default function ProfileGrid({ initialProfiles = mockProfiles, profiles, showFilters = true }: ProfileGridProps) {
  // Use profiles prop if provided, otherwise fall back to initialProfiles
  const dataSource: GridProfileType[] = profiles || initialProfiles;
  const searchParams = useSearchParams();
  const [profilesState, setProfilesState] = useState<GridProfileType[]>(dataSource);
  const [filteredProfiles, setFilteredProfiles] = useState<GridProfileType[]>(dataSource);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Update state when dataSource changes
  useEffect(() => {
    setProfilesState(dataSource);
    setFilteredProfiles(dataSource);
  }, [dataSource]);

  // Filter profiles based on search params
  useEffect(() => {
    const region = searchParams.get('region');
    const province = searchParams.get('province');
    const occupation = searchParams.get('occupation');
    const age = searchParams.get('age');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const tags = searchParams.get('tags');

    let filtered = [...profilesState];

    if (region) {
      // Convert region code to Vietnamese name if needed
      const regionName = REGION_CODE_TO_NAME[region] || region;
      filtered = filtered.filter(profile => profile.region === regionName);
    }

    if (province) {
      // Convert province slug to Vietnamese name if needed
      const provinceName = PROVINCE_SLUG_TO_NAME[province] || province;
      filtered = filtered.filter(profile => 
        profile.province === provinceName
      );
    }

    if (occupation) {
      // Check if occupation is a slug or a name
      const isSlug = occupation.includes('-') && occupation === occupation.toLowerCase();
      if (isSlug) {
         // Convert slug to occupation name for comparison
         const occupationName = slugToOccupation(occupation);
         filtered = filtered.filter(profile => 
           profile.occupation.toLowerCase().includes(occupationName.toLowerCase())
         );
       } else {
        // Direct name comparison
        filtered = filtered.filter(profile => 
          profile.occupation.toLowerCase().includes(occupation.toLowerCase())
        );
      }
    }

    // Handle age range from 'age' parameter (e.g., "18-22")
    if (age) {
      const [minAge, maxAge] = age.split('-').map(Number);
      if (minAge) {
        filtered = filtered.filter(profile => profile.age >= minAge);
      }
      if (maxAge) {
        filtered = filtered.filter(profile => profile.age <= maxAge);
      }
    }
    // Handle individual ageMin and ageMax parameters
    else {
      if (ageMin) {
        filtered = filtered.filter(profile => profile.age >= parseInt(ageMin));
      }

      if (ageMax) {
        filtered = filtered.filter(profile => profile.age <= parseInt(ageMax));
      }
    }

    if (tags) {
      const tagList = tags.split(',').filter(Boolean);
      filtered = filtered.filter(profile => {
        return tagList.some((tagParam) => {
          const isSlug = tagParam.includes('-') && tagParam === tagParam.toLowerCase();
          if (isSlug) {
            // Compare by slug equality for diacritic-insensitive matching
            return profile.tags.some((profileTag: string) => tagToSlug(profileTag) === tagParam);
          } else {
            // Normalize both sides to slug and compare
            const searchSlug = tagToSlug(tagParam);
            return profile.tags.some((profileTag: string) => tagToSlug(profileTag) === searchSlug);
          }
        });
      });
    }

    setFilteredProfiles(filtered);
    setCurrentPage(1);
  }, [searchParams, profilesState]);

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 aspect-[3/4] rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredProfiles.length)} trong tổng số {filteredProfiles.length} kết quả
        </p>
        
        {/* Sort options */}
        <select 
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          onChange={(e) => {
            const value = e.target.value;
            const sorted = [...filteredProfiles];
            
            switch (value) {
              case 'newest':
                // In real app, sort by created date
                break;
              case 'age-asc':
                sorted.sort((a, b) => a.age - b.age);
                break;
              case 'age-desc':
                sorted.sort((a, b) => b.age - a.age);
                break;
              case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            }
            
            setFilteredProfiles(sorted);
          }}
        >
          <option value="newest">Mới nhất</option>
          <option value="age-asc">Tuổi tăng dần</option>
          <option value="age-desc">Tuổi giảm dần</option>
          <option value="name">Tên A-Z</option>
        </select>
      </div>

      {/* Profile grid */}
      {currentProfiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProfiles.map((profile) => (
            <ProfileCard key={profile.slug} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy kết quả phù hợp</p>
          <p className="text-gray-400 mt-2">Hãy thử điều chỉnh bộ lọc của bạn</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}