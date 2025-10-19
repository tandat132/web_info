import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { REGIONS, PROVINCES } from '@/lib/constants';
import { generateMetaTitle, generateMetaDescription, slugToTag } from '@/lib/utils';
import RegionPageContent from '@/components/pages/RegionPageContent';

interface PageProps {
  params: Promise<{ params: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const urlParams = resolvedParams.params || [];
  
  type PageType = 'occupation' | 'profile' | 'home' | 'province' | 'region' | 'tag';

  // Parse URL parameters: /gai-xinh/[region]/[province]/[tags] (occupation is now query param)
  const [regionSlug, provinceSlug, ...tagSlugs] = urlParams;
  
  // Find region, province, occupation, tags
  const region = regionSlug ? REGIONS.find(r => r.slug === regionSlug) : null;
  const province = provinceSlug ? PROVINCES.find(p => p.slug === provinceSlug) : null;
  const occupation = resolvedSearchParams.occupation as string;
  // Support tags via query param (comma-separated slugs) and path (backward compat)
  const queryTagsParam = resolvedSearchParams.tags;
  const queryTagSlugs = Array.isArray(queryTagsParam)
    ? queryTagsParam.flatMap(t => (typeof t === 'string' ? t.split(',') : []))
    : (typeof queryTagsParam === 'string' ? queryTagsParam.split(',') : []);
  const tagsFromQuery = queryTagSlugs.map(slug => slugToTag(slug));
  const tagsFromPath = tagSlugs.length > 0 ? tagSlugs.map(slug => slugToTag(slug)) : [];
  const tags = [...new Set([...(tagsFromQuery || []), ...(tagsFromPath || [])])];
  const canonicalTagSlugs = queryTagSlugs.length > 0 ? queryTagSlugs : tagSlugs;

  const age = resolvedSearchParams.age as string;

  const titleParts: string[] = ['Gái xinh'];
  const descParts: string[] = ['Khám phá bộ sưu tập gái xinh, gái đẹp'];

  if (occupation) {
    titleParts.push(occupation);
    descParts.push(`làm ${occupation}`);
  }
  if (province) {
    titleParts.push(province.name);
    descParts.push(`tại ${province.name}`);
  } else if (region) {
    titleParts.push(region.name);
    descParts.push(`miền ${region.name}`);
  }
  if (age) {
    titleParts.push(`${age} tuổi`);
    descParts.push(`độ tuổi ${age}`);
  }
  if (tags.length > 0) {
    titleParts.push(tags.join(', '));
    descParts.push(`với đặc điểm ${tags.join(', ')}`);
  }

  // ✅ xác định pageType theo ưu tiên
  const pageType: PageType =
    province ? 'province' :
    (queryTagSlugs.length > 0 || tagSlugs.length > 0) ? 'tag' :
    occupation ? 'occupation' :
    region ? 'region' :
    'home';

  // ⬇️ truyền đúng tham số cho utils
  const title = generateMetaTitle(pageType, titleParts.join(' '));
  const description = generateMetaDescription(pageType, descParts.join(' ') + '. Cập nhật liên tục, hình ảnh chất lượng cao.');
  
  // Build canonical URL
  let canonicalUrl = '/gai-xinh';
  if (regionSlug) canonicalUrl += `/${regionSlug}`;
  if (provinceSlug) canonicalUrl += `/${provinceSlug}`;
  // Prefer query-based tags in canonical URL
  
  const queryParams = new URLSearchParams();
  if (age) queryParams.set('age', age);
  if (occupation) queryParams.set('occupation', occupation);
  if (canonicalTagSlugs.length > 0) queryParams.set('tags', canonicalTagSlugs.join(','));
  if (queryParams.toString()) canonicalUrl += `?${queryParams.toString()}`;
  
  return {
    title,
    description,
    keywords: [
      'gái xinh',
      'gái đẹp',
      occupation,
      province?.name,
      region?.name,
      ...tags,
      age ? `${age} tuổi` : '',
    ].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Gái Xinh Việt Nam',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function GaiXinhPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const urlParams = resolvedParams.params || [];
  
  // Parse URL parameters: /gai-xinh/[region]/[province]/[tags] (occupation via query)
  const [regionSlug, provinceSlug, ...tagSlugs] = urlParams;
  
  // Validate parameters
  if (regionSlug && !REGIONS.find(r => r.slug === regionSlug)) {
    notFound();
  }
  
  if (provinceSlug && !PROVINCES.find(p => p.slug === provinceSlug)) {
    notFound();
  }
  

  
  // Validate tag slugs from path and query
  const queryTagsParam = resolvedSearchParams.tags;
  const queryTagSlugs = Array.isArray(queryTagsParam)
    ? queryTagsParam.flatMap(t => (typeof t === 'string' ? t.split(',') : []))
    : (typeof queryTagsParam === 'string' ? queryTagsParam.split(',') : []);
  for (const tagSlug of [...tagSlugs, ...queryTagSlugs]) {
    if (!slugToTag(tagSlug)) {
      notFound();
    }
  }
  
  // If province is specified but region is not, validate that province belongs to the region
  if (provinceSlug && regionSlug) {
    const province = PROVINCES.find(p => p.slug === provinceSlug);
    const region = REGIONS.find(r => r.slug === regionSlug);
    if (province && region && province.region !== region.name) {
      notFound();
    }
  }
  
  return (
    <RegionPageContent 
      regionSlug={regionSlug}
      provinceSlug={provinceSlug}
      tagSlugs={queryTagSlugs.length > 0 ? queryTagSlugs : tagSlugs}
      searchParams={resolvedSearchParams}
    />
  );
}

// Generate static params for popular combinations
export async function generateStaticParams() {
  const params: { params: string[] }[] = [];
  
  // Base page
  params.push({ params: [] });
  
  // Region pages
  REGIONS.forEach(region => {
    params.push({ params: [region.slug] });
    
    // Region + popular provinces
    const regionProvinces = PROVINCES.filter(p => p.region === region.code);
    regionProvinces.slice(0, 3).forEach(province => {
      params.push({ params: [region.slug, province.slug] });
    });
  });
  
  // Popular provinces without region
  const popularProvinces = PROVINCES.filter(p => 
    ['ha-noi', 'ho-chi-minh', 'da-nang', 'hai-phong', 'can-tho'].includes(p.slug)
  );
  
  popularProvinces.forEach(province => {
    const region = REGIONS.find(r => r.code === province.region);
    if (region) {
      params.push({ params: [region.slug, province.slug] });
    }
  });
  
  return params;
}