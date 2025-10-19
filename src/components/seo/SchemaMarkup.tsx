type WebsiteData = { name?: string; description?: string };

type ProfilePhoto = {
  url: string;
  width: number;
  height: number;
  alt?: string;
};

type ProfileData = {
  name?: string;
  age?: number;
  occupation?: string;
  location?: string;
  slug?: string;
  photos?: ProfilePhoto[];
  province?: string;
  tags?: string[];
};

type OrganizationData = {
  phone?: string;
  facebook?: string;
  zalo?: string;
  telegram?: string;
};

type BreadcrumbItem = { name: string; url: string };

type BreadcrumbData = { items?: BreadcrumbItem[] };

type ImageGalleryData = {
  name?: string;
  age?: number;
  occupation?: string;
  photos?: ProfilePhoto[];
};

type SchemaMarkupProps =
  | { type: 'website'; data: WebsiteData }
  | { type: 'profile'; data: ProfileData }
  | { type: 'organization'; data: OrganizationData }
  | { type: 'breadcrumb'; data: BreadcrumbData }
  | { type: 'imageGallery'; data: ImageGalleryData };

export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const generateSchema = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
    
    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: data.name || 'Gái Xinh Việt Nam',
          description: data.description || 'Bộ sưu tập gái xinh, gái đẹp từ 63 tỉnh thành Việt Nam',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/tat-ca?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Gái Xinh Việt Nam',
            url: baseUrl,
          },
        };

      case 'profile':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: data.name,
          description: `${data.name} - ${data.age} tuổi, ${data.occupation}, ${data.location}`,
          url: `${baseUrl}/${data.slug}`,
          image: data.photos?.map((photo) => ({
            '@type': 'ImageObject',
            url: photo.url,
            width: photo.width,
            height: photo.height,
            caption: photo.alt,
          })) || [],
          jobTitle: data.occupation,
          address: {
            '@type': 'PostalAddress',
            addressLocality: data.province,
            addressCountry: 'VN',
          },
          additionalProperty: data.tags?.map((tag: string) => ({
            '@type': 'PropertyValue',
            name: 'characteristic',
            value: tag,
          })) || [],
        };

      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Gái Xinh Việt Nam',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          description: 'Website chia sẻ bộ sưu tập gái xinh, gái đẹp từ khắp Việt Nam',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: data.phone || '+84123456789',
            contactType: 'customer service',
            availableLanguage: 'Vietnamese',
          },
          sameAs: [
            data.facebook || '',
            data.zalo || '',
            data.telegram || '',
          ].filter(Boolean),
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items?.map((item, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`,
          })) || [],
        };

      case 'imageGallery':
        return {
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: `Bộ sưu tập ảnh ${data.name}`,
          description: `Xem bộ sưu tập ảnh của ${data.name} - ${data.age} tuổi, ${data.occupation}`,
          image: data.photos?.map((photo) => ({
            '@type': 'ImageObject',
            url: photo.url,
            width: photo.width,
            height: photo.height,
            caption: photo.alt,
            contentUrl: photo.url,
            thumbnailUrl: photo.url,
          })) || [],
          author: {
            '@type': 'Person',
            name: data.name,
          },
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
}