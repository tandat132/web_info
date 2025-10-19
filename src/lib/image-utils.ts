import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// Cấu hình cho xử lý ảnh
export const IMAGE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
  outputFormat: 'webp' as const,
  quality: 85,
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'images'),
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 400, height: 400 },
    medium: { width: 800, height: 800 },
    large: { width: 1200, height: 1200 },
    original: { width: 2000, height: 2000 }
  }
};

// Tạo tên file SEO-friendly
export function generateSEOFilename(originalName: string, profileData: {
  name: string;
  age: number;
  province: string;
}): string {
  const { name, age, province } = profileData;
  
  // Chuyển đổi tiếng Việt thành không dấu
  const vietnameseMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd'
  };

  const removeVietnameseTones = (str: string): string => {
    return str.toLowerCase().replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, 
      (match) => vietnameseMap[match] || match);
  };

  const cleanName = removeVietnameseTones(name)
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const cleanProvince = removeVietnameseTones(province)
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const timestamp = Date.now();
  const randomId = crypto.randomBytes(4).toString('hex');
  
  return `${cleanName}-${age}-tuoi-${cleanProvince}-${timestamp}-${randomId}`;
}

// Đảm bảo thư mục upload tồn tại
export async function ensureUploadDir(): Promise<void> {
  try {
    await fs.access(IMAGE_CONFIG.uploadDir);
  } catch {
    await fs.mkdir(IMAGE_CONFIG.uploadDir, { recursive: true });
  }
}

// Xử lý và tối ưu hóa ảnh
export async function processImage(
  buffer: Buffer,
  filename: string,
  size: keyof typeof IMAGE_CONFIG.sizes = 'medium'
): Promise<{
  filename: string;
  path: string;
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  dominantColor: string;
}> {
  await ensureUploadDir();

  const { width, height } = IMAGE_CONFIG.sizes[size];
  const outputFilename = `${filename}-${size}.${IMAGE_CONFIG.outputFormat}`;
  const outputPath = path.join(IMAGE_CONFIG.uploadDir, outputFilename);
  const publicUrl = `/api/images/${outputFilename}`;

  // Xử lý ảnh với Sharp
  const processedImage = sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center'
    })
    .webp({
      quality: IMAGE_CONFIG.quality,
      effort: 6 // Tối ưu hóa cao nhất
    });

  
  // Lấy màu dominant
  const { dominant } = await processedImage.stats();
  const dominantColor = `rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`;

  // Lưu file
  const info = await processedImage.toFile(outputPath);

  return {
    filename: outputFilename,
    path: outputPath,
    url: publicUrl,
    width: info.width,
    height: info.height,
    format: info.format,
    size: info.size,
    dominantColor
  };
}

// Derive processed image data type from processImage
type ProcessedImageData = Awaited<ReturnType<typeof processImage>>;

// Tạo nhiều kích thước cho responsive images
export async function processMultipleSizes(
  buffer: Buffer,
  filename: string,
  sizes: (keyof typeof IMAGE_CONFIG.sizes)[] = ['thumbnail', 'small', 'medium', 'large']
): Promise<Partial<Record<keyof typeof IMAGE_CONFIG.sizes, ProcessedImageData>>> {
  const results: Partial<Record<keyof typeof IMAGE_CONFIG.sizes, ProcessedImageData>> = {};
  
  for (const size of sizes) {
    results[size] = await processImage(buffer, filename, size);
  }
  
  return results;
}

// Xóa ảnh
export async function deleteImage(filename: string): Promise<void> {
  try {
    const filePath = path.join(IMAGE_CONFIG.uploadDir, filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// Xóa tất cả kích thước của một ảnh
export async function deleteAllSizes(baseFilename: string): Promise<void> {
  const sizes = Object.keys(IMAGE_CONFIG.sizes);
  
  for (const size of sizes) {
    const filename = `${baseFilename}-${size}.${IMAGE_CONFIG.outputFormat}`;
    await deleteImage(filename);
  }
}

// Validate file upload
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Kiểm tra kích thước
  if (file.size > IMAGE_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File quá lớn. Kích thước tối đa: ${IMAGE_CONFIG.maxFileSize / 1024 / 1024}MB`
    };
  }

  // Kiểm tra định dạng
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !IMAGE_CONFIG.allowedFormats.includes(fileExtension)) {
    return {
      valid: false,
      error: `Định dạng không được hỗ trợ. Chỉ chấp nhận: ${IMAGE_CONFIG.allowedFormats.join(', ')}`
    };
  }

  return { valid: true };
}

// Tạo blur placeholder từ ảnh
export async function generateBlurPlaceholder(buffer: Buffer): Promise<string> {
  const placeholder = await sharp(buffer)
    .resize(10, 10, { fit: 'cover' })
    .blur(1)
    .webp({ quality: 20 })
    .toBuffer();
    
  return `data:image/webp;base64,${placeholder.toString('base64')}`;
}

// Client-side utilities (không cần Sharp)
export function generateLocalImageUrl(
  filename: string,
  size: keyof typeof IMAGE_CONFIG.sizes = 'medium'
): string {
  const baseFilename = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  return `/api/images/${baseFilename}-${size}.${IMAGE_CONFIG.outputFormat}`;
}

export function generateResponsiveImageUrls(
  filename: string,
  sizes: (keyof typeof IMAGE_CONFIG.sizes)[] = ['small', 'medium', 'large']
): Array<{ src: string; width: number; height: number; size: string }> {
  return sizes.map(size => ({
    src: generateLocalImageUrl(filename, size),
    width: IMAGE_CONFIG.sizes[size].width,
    height: IMAGE_CONFIG.sizes[size].height,
    size
  }));
}