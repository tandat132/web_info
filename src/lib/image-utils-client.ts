// Client-side image utilities (không sử dụng Node.js modules)

export interface ImageSize {
  url: string;
  width: number;
  height: number;
  size: number;
}

export interface ImageSizes {
  thumbnail?: ImageSize;
  small?: ImageSize;
  medium?: ImageSize;
  large?: ImageSize;
  original?: ImageSize;
}

// Tạo URL cho ảnh local
export function generateLocalImageUrl(baseFilename: string, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'medium'): string {
  if (!baseFilename) return '';
  
  const extension = '.webp'; // Luôn sử dụng WebP cho tối ưu
  const filename = `${baseFilename}-${size}${extension}`;
  
  return `/api/images/${filename}`;
}

// Tạo responsive image URLs cho srcSet
export function generateResponsiveImageUrls(baseFilename: string): string {
  if (!baseFilename) return '';
  
  const sizes = ['small', 'medium', 'large'] as const;
  const srcSet = sizes.map(size => {
    const url = generateLocalImageUrl(baseFilename, size);
    const width = getWidthForSize(size);
    return `${url} ${width}w`;
  }).join(', ');
  
  return srcSet;
}

// Lấy width cho từng size
function getWidthForSize(size: string): number {
  const sizeMap = {
    thumbnail: 150,
    small: 400,
    medium: 800,
    large: 1200,
    original: 1920
  };
  
  return sizeMap[size as keyof typeof sizeMap] || 800;
}

// Validate file type
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

// Validate file size (max 10MB)
export function isValidImageSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
}

// Generate SEO-friendly filename
export function generateSeoFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  
  // Remove extension and clean filename
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${cleanName}-${timestamp}-${randomString}`;
}