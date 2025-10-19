import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { IMAGE_CONFIG } from '@/lib/image-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join('/');
    const fullPath = path.join(IMAGE_CONFIG.uploadDir, imagePath);

    // Security check - đảm bảo path không escape khỏi upload directory
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(IMAGE_CONFIG.uploadDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Kiểm tra file tồn tại
    let actualPath = fullPath;
    let actualImagePath = imagePath;
    
    try {
      await stat(fullPath);
    } catch {
      // Nếu không tìm thấy file đã xử lý, thử tìm file gốc
      // Ví dụ: 3c8005f2a8de4cbb9d6a313aee5504c5.jpg-medium.webp -> 3c8005f2a8de4cbb9d6a313aee5504c5.jpg
      const originalImagePath = imagePath.replace(/-(?:thumbnail|small|medium|large|original)\.webp$/, '');
      const originalFullPath = path.join(process.cwd(), 'images', originalImagePath);
      
      try {
        await stat(originalFullPath);
        actualPath = originalFullPath;
        actualImagePath = originalImagePath;
      } catch {
        return new NextResponse('Image not found', { status: 404 });
      }
    }

    // Đọc file
    const imageBuffer = await readFile(actualPath);
    const fileExtension = path.extname(actualImagePath).toLowerCase();

    // Xác định content type
    let contentType = 'image/jpeg';
    switch (fileExtension) {
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.avif':
        contentType = 'image/avif';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }

    // Cache headers cho SEO và performance
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 năm
    headers.set('ETag', `"${actualImagePath}"`);
    headers.set('Last-Modified', new Date().toUTCString());
    
    // Security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "default-src 'none'");

    // Kiểm tra If-None-Match header cho 304 response
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === `"${actualImagePath}"`) {
      return new NextResponse(null, { status: 304, headers });
    }
    return new NextResponse(new Uint8Array(imageBuffer), { headers });

  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}