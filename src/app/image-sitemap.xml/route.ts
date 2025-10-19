import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { generateLocalImageUrl } from '@/lib/image-utils-client';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all published profiles with photos
    const profiles = await Profile.find({ 
      status: 'published',
      'photos.0': { $exists: true }
    }).select('slug name age province photos updatedAt').lean();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${profiles.map(profile => `
  <url>
    <loc>${baseUrl}/ho-so/${profile.slug}</loc>
    <lastmod>${new Date(profile.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${profile.photos.map((photo: { baseFilename?: string; url?: string; caption?: string; alt: string }) => {
      const imageUrl = photo.baseFilename 
        ? generateLocalImageUrl(photo.baseFilename, 'large')
        : photo.url;
      return `
    <image:image>
      <image:loc>${baseUrl}${imageUrl}</image:loc>
      <image:caption>${photo.caption || `${profile.name}, ${profile.age} tuổi, ${profile.province} - ${photo.alt}`}</image:caption>
      <image:geo_location>${profile.province}, Việt Nam</image:geo_location>
      <image:title>${photo.alt}</image:title>
      <image:license>${baseUrl}/license</image:license>
    </image:image>`;
    }).join('')}
  </url>`).join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}