import { MetadataRoute } from 'next';
import { REGIONS, PROVINCES, DEFAULT_OCCUPATIONS } from '@/lib/constants';
import { occupationToSlug } from '@/lib/utils';

// Age ranges for SEO
const AGE_RANGES = [
  { slug: '18-22', label: '18-22 tuổi' },
  { slug: '23-27', label: '23-27 tuổi' },
  { slug: '28-32', label: '28-32 tuổi' },
  { slug: '33-37', label: '33-37 tuổi' },
  { slug: '38-42', label: '38-42 tuổi' },
  { slug: '43-50', label: '43-50 tuổi' }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  
  const routes: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    
    // Main Gai Xinh page
    {
      url: `${baseUrl}/gai-xinh`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    
    // All profiles page
    {
      url: `${baseUrl}/tat-ca`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Region pages (old structure)
  REGIONS.forEach((region) => {
    routes.push({
      url: `${baseUrl}/mien/${region.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // New Gai Xinh region pages with mien- prefix
  REGIONS.forEach((region) => {
    routes.push({
      url: `${baseUrl}/gai-xinh/mien-${region.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    });
  });

  // Province pages
  PROVINCES.forEach((province) => {
    routes.push({
      url: `${baseUrl}/tinh/${province.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // Occupation pages
  DEFAULT_OCCUPATIONS.forEach((occupation) => {
    const slug = occupationToSlug(occupation);
    routes.push({
      url: `${baseUrl}/nghe/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // Age range pages
  AGE_RANGES.forEach((ageRange) => {
    routes.push({
      url: `${baseUrl}/tuoi/${ageRange.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // New unified URL structure: /gai-xinh/[region]/[province]/[occupation]
  const unifiedUrls: MetadataRoute.Sitemap = [];
  
  // Popular combinations for SEO
  const popularCombinations = [
    { region: 'bac', province: 'ha-noi', occupations: ['nhan-vien-van-phong', 'sinh-vien', 'nguoi-mau'] },
    { region: 'nam', province: 'ho-chi-minh', occupations: ['nhan-vien-van-phong', 'sinh-vien', 'nguoi-mau'] },
    { region: 'trung', province: 'da-nang', occupations: ['nhan-vien-van-phong', 'sinh-vien', 'giao-vien'] },
    { region: 'bac', province: 'hai-phong', occupations: ['nhan-vien-van-phong', 'giao-vien', 'y-ta'] },
  ];

  popularCombinations.forEach(({ region, province, occupations }) => {
    occupations.forEach(occupation => {
      unifiedUrls.push({
        url: `${baseUrl}/gai-xinh/mien-${region}/${province}/${occupation}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    });
  });

  // Add base region/province combinations
  REGIONS.forEach(region => {
    const regionProvinces = PROVINCES.filter(p => p.region === region.slug);

    regionProvinces.forEach(province => {
      unifiedUrls.push({
        url: `${baseUrl}/gai-xinh/mien-${region.slug}/${province.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    });
  });

  routes.push(...unifiedUrls);

  // Mock profile pages - in real app, fetch from database
  const mockProfileSlugs = [
    'linh-22-tuoi-sinh-vien-quan-1',
    'mai-24-tuoi-nguoi-mau-ha-noi',
    'huong-26-tuoi-nhan-vien-van-phong-da-nang',
    'thao-23-tuoi-giao-vien-hai-phong',
  ];

  mockProfileSlugs.forEach((slug) => {
    routes.push({
      url: `${baseUrl}/ho-so/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  return routes;
}