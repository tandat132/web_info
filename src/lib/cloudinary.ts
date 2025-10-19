import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface ImageMetadata {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  dominantColor?: string;
  caption?: string;
  format: string;
  bytes: number;
}

/**
 * Tạo tên file SEO-friendly cho ảnh
 * Format: gai-xinh-[province]-[name]-[age]-tuoi-[index].[hash].webp
 */
export function generateSEOFilename(
  name: string,
  age: number,
  province: string,
  index: number = 1
): string {
  // Normalize Vietnamese text
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .trim();
  };

  const normalizedName = normalizeText(name);
  const normalizedProvince = normalizeText(province);
  
  // Generate short hash for cache busting
  const timestamp = Date.now().toString(36);
  const hash = timestamp.slice(-4);
  
  return `gai-xinh-${normalizedProvince}-${normalizedName}-${age}-tuoi-${index.toString().padStart(2, '0')}.${hash}`;
}

/**
 * Upload ảnh lên Cloudinary với tối ưu SEO
 */
export async function uploadImageToCloudinary(
  file: File | Buffer | string,
  options: {
    name: string;
    age: number;
    province: string;
    index?: number;
    alt?: string;
    caption?: string;
  }
): Promise<ImageMetadata> {
  try {
    const filename = generateSEOFilename(
      options.name,
      options.age,
      options.province,
      options.index || 1
    );

    const uploadOptions = {
      public_id: filename,
      folder: 'web-info/profiles',
      format: 'webp', // Force WebP format
      quality: 'auto:good', // Auto quality optimization
      fetch_format: 'auto', // Auto format selection
      flags: 'progressive', // Progressive loading
      transformation: [
        {
          quality: 'auto:good',
          fetch_format: 'auto',
        }
      ],
      // Generate multiple sizes for responsive images
      eager: [
        { width: 320, height: 427, crop: 'fill', quality: 'auto:good', format: 'webp' },
        { width: 480, height: 640, crop: 'fill', quality: 'auto:good', format: 'webp' },
        { width: 768, height: 1024, crop: 'fill', quality: 'auto:good', format: 'webp' },
        { width: 1024, height: 1365, crop: 'fill', quality: 'auto:good', format: 'webp' },
        { width: 1280, height: 1707, crop: 'fill', quality: 'auto:good', format: 'webp' },
      ],
      // Remove EXIF data for privacy and file size
      strip_metadata: true,
      // Generate dominant color
      colors: true,
    };

    let uploadResult;
    
    if (file instanceof File) {
      // Convert File to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      uploadResult = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        uploadOptions
      );
    } else if (Buffer.isBuffer(file)) {
      uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${file.toString('base64')}`,
        uploadOptions
      );
    } else {
      // Assume it's a base64 string or URL
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    }

    // Extract dominant color
    const dominantColor = uploadResult.colors?.[0]?.[0] || '#cccccc';

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      alt: options.alt || `${options.name} ${options.age} tuổi, gái xinh ${options.province}`,
      width: uploadResult.width,
      height: uploadResult.height,
      dominantColor,
      caption: options.caption,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Tạo blur placeholder từ dominant color
 */
export function generateBlurDataURL(dominantColor: string): string {
  // Create a simple 1x1 pixel base64 image with the dominant color
  const svg = `
    <svg width="1" height="1" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="1" fill="${dominantColor}"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Tạo responsive image URLs
 */
export function generateResponsiveImageUrls(publicId: string): {
  src: string;
  srcSet: string;
  sizes: string;
} {
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  const sizes = [
    { width: 320, height: 427 },
    { width: 480, height: 640 },
    { width: 768, height: 1024 },
    { width: 1024, height: 1365 },
    { width: 1280, height: 1707 },
  ];

  const srcSet = sizes
    .map(size => 
      `${baseUrl}/w_${size.width},h_${size.height},c_fill,f_webp,q_auto:good/${publicId} ${size.width}w`
    )
    .join(', ');

  return {
    src: `${baseUrl}/w_768,h_1024,c_fill,f_webp,q_auto:good/${publicId}`,
    srcSet,
    sizes: '(max-width: 320px) 320px, (max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px',
  };
}

/**
 * Xóa ảnh từ Cloudinary
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

export default cloudinary;