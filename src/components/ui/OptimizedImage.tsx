'use client';

import Image from 'next/image';
import { useState } from 'react';
import { generateLocalImageUrl } from '@/lib/image-utils-client';

// Generate blur placeholder from width, height, and dominant color
function generateBlurDataURL(width: number, height: number, dominantColor?: string): string {
  const color = dominantColor || '#cccccc';
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `;
  
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

// Generate blur placeholder for single color (for ResponsivePicture)
function generateSimpleBlurDataURL(dominantColor: string): string {
  const color = dominantColor || '#cccccc';
  const svg = `
    <svg width="1" height="1" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="1" fill="${color}"/>
    </svg>
  `;
  
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  blurDataURL?: string;
  dominantColor?: string;
  baseFilename?: string; // For local images
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  fill = false,
  style,
  onLoad,
  onError,
  blurDataURL,
  dominantColor,
  baseFilename,
  size = 'medium'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate blur placeholder if not provided
  const placeholder = blurDataURL || generateBlurDataURL(width, height, dominantColor);
  
  // Use local image URL if baseFilename is provided, otherwise use original src
  const imageUrl = baseFilename ? generateLocalImageUrl(baseFilename, size) : src;

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}
      >
        <span className="text-gray-400 text-sm">Không thể tải ảnh</span>
      </div>
    );
  }

  const imageProps = {
    src: imageUrl,
    className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    placeholder: 'blur' as const,
    blurDataURL: placeholder,
    quality,
    priority,
    sizes,
    style,
    ...(fill ? { fill: true } : { width, height })
  };

  return (
    <Image
      alt={alt}
      {...imageProps}
    />
  );
}

// Picture element for advanced responsive images with format fallbacks
interface ResponsivePictureProps extends OptimizedImageProps {
  publicId: string;
  isLCP?: boolean;
  breakpoints?: Array<{
    media: string;
    width: number;
    height: number;
  }>;
}

export function ResponsivePicture({
  publicId,
  alt,
  width,
  height,
  dominantColor = '#cccccc',
  priority = false,
  isLCP = false,
  className = '',
  breakpoints = [
    { media: '(max-width: 320px)', width: 320, height: 427 },
    { media: '(max-width: 480px)', width: 480, height: 640 },
    { media: '(max-width: 768px)', width: 768, height: 1024 },
    { media: '(max-width: 1024px)', width: 1024, height: 1365 },
  ],
  ...props
}: ResponsivePictureProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const blurDataURL = generateSimpleBlurDataURL(dominantColor);
  const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const { src: _omitSrc, ...restProps } = props;

  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <span className="text-gray-400 text-sm">Không thể tải ảnh</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!imageLoaded && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: dominantColor,
            backgroundImage: `url("${blurDataURL}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <picture>
        {/* WebP sources for different breakpoints */}
        {breakpoints.map((bp, index) => (
          <source
            key={`webp-${index}`}
            media={bp.media}
            srcSet={`${baseUrl}/w_${bp.width},h_${bp.height},c_fill,f_webp,q_auto:good/${publicId}`}
            type="image/webp"
          />
        ))}
        
        {/* AVIF sources for modern browsers */}
        {breakpoints.map((bp, index) => (
          <source
            key={`avif-${index}`}
            media={bp.media}
            srcSet={`${baseUrl}/w_${bp.width},h_${bp.height},c_fill,f_avif,q_auto:good/${publicId}`}
            type="image/avif"
          />
        ))}

        {/* Fallback JPEG */}
        <img
          src={`${baseUrl}/w_${width},h_${height},c_fill,f_auto,q_auto:good/${publicId}`}
          alt={alt}
          width={width}
          height={height}
          loading={priority || isLCP ? 'eager' : 'lazy'}
          fetchPriority={priority || isLCP ? 'high' : 'auto'}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } w-full h-full object-cover`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          {...restProps}
        />
      </picture>

      {/* Loading indicator */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}