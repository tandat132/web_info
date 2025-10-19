import { generateLocalImageUrl } from '@/lib/image-utils-client';

// Minimal SEO-friendly types compatible with both app and DB models
interface SEOPhoto {
  url: string;
  baseFilename?: string;
  alt: string;
  width: number;
  height: number;
  dominantColor?: string;
  caption?: string;
  format: string;
  bytes: number;
  isLCP?: boolean;
  blurDataURL?: string;
}

interface SEOProfile {
  _id: string;
  name: string;
  slug: string;
  age: number;
  province: string;
  occupation: string;
  description?: string;
  tags: string[];
  photos: SEOPhoto[];
  region?: string;
  height?: number;
  weight?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StructuredDataProps {
  profile: SEOProfile;
}

export default function StructuredData({ profile }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.name,
    "description": profile.description || `${profile.name}, ${profile.age} tuổi, ${profile.province}`,
    "age": profile.age,
    "gender": "Female", // Assuming this is a dating site for women
    "address": {
      "@type": "PostalAddress",
      "addressRegion": profile.province,
      "addressCountry": "VN"
    },
    "jobTitle": profile.occupation,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/ho-so/${profile.slug}`,
    "image": profile.photos.map(photo => {
      const imageUrl = photo.baseFilename 
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}${generateLocalImageUrl(photo.baseFilename, 'large')}`
        : photo.url;
      return {
        "@type": "ImageObject",
        "url": imageUrl,
        "description": photo.alt,
        "width": photo.width,
        "height": photo.height,
        "encodingFormat": `image/${photo.format}`,
        "contentSize": photo.bytes,
        "caption": photo.caption || photo.alt,
        "representativeOfPage": photo.isLCP || false
      };
    }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/ho-so/${profile.slug}`
    },
    "dateCreated": profile.createdAt,
    "dateModified": profile.updatedAt,
    "keywords": profile.tags.join(', '),
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Khu vực",
        "value": profile.region === 'nam' ? 'Miền Nam' : profile.region === 'bac' ? 'Miền Bắc' : 'Miền Trung'
      },
      ...(profile.height ? [{
        "@type": "PropertyValue",
        "name": "Chiều cao",
        "value": `${profile.height}cm`
      }] : []),
      ...(profile.weight ? [{
        "@type": "PropertyValue", 
        "name": "Cân nặng",
        "value": `${profile.weight}kg`
      }] : [])
    ]
  };

  // Organization structured data for the website
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Web Info Dating",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com',
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/logo.png`,
    "description": "Trang web kết nối và tìm hiểu thông tin cá nhân",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "VN"
    }
  };

  // Website structured data
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Web Info Dating",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com',
    "description": "Trang web kết nối và tìm hiểu thông tin cá nhân",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData)
        }}
      />
    </>
  );
}

// Component for homepage structured data
interface HomePageStructuredDataProps {
  featuredProfiles: SEOProfile[];
}

export function HomePageStructuredData({ featuredProfiles }: HomePageStructuredDataProps) {
  const collectionData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Hồ sơ nổi bật - Web Info Dating",
    "description": "Khám phá các hồ sơ nổi bật trên Web Info Dating",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com',
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": featuredProfiles.length,
      "itemListElement": featuredProfiles.map((profile, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Person",
          "name": profile.name,
          "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/ho-so/${profile.slug}`,
          "image": profile.photos[0]?.baseFilename 
            ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}${generateLocalImageUrl(profile.photos[0].baseFilename!, 'medium')}`
            : profile.photos[0]?.url,
          "description": `${profile.name}, ${profile.age} tuổi, ${profile.province}`,
          "age": profile.age,
          "address": {
            "@type": "PostalAddress",
            "addressRegion": profile.province,
            "addressCountry": "VN"
          }
        }
      }))
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(collectionData)
      }}
    />
  );
}