import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Vietnamese text to slug
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Generate profile slug from name, age, occupation, district, province
export function generateProfileSlug(
  name: string, 
  age: number, 
  occupation: string, 
  district?: string, 
  province?: string
): string {
  const parts = [
    createSlug(name),
    `${age}-tuoi`,
    createSlug(occupation)
  ];
  
  if (district) {
    parts.push(createSlug(district));
  }
  
  if (province) {
    parts.push(createSlug(province));
  }
  
  return parts.join('-');
}

// Typed data for meta generators
type MetaType = 'home' | 'province' | 'region' | 'occupation' | 'tag' | 'profile';
type MetaNameData = { name: string };
type MetaProfileData = { name: string; age: number; occupation: string; district?: string; province: string };

// Generate meta title for different page types
export function generateMetaTitle(
  type: MetaType,
  data?: MetaNameData | MetaProfileData | string
): string {
  switch (type) {
    case 'home':
      return 'Gái Xinh Việt Nam | Tuyển chọn gái đẹp từ khắp 63 tỉnh thành';
    case 'province': {
      const name = typeof data === 'string' ? data : (data as MetaNameData | undefined)?.name;
      return `Gái xinh ${name ?? ''} | Ảnh đẹp, trẻ trung, cập nhật mỗi ngày`;
    }
    case 'region': {
      const name = typeof data === 'string' ? data : (data as MetaNameData | undefined)?.name;
      return `Gái đẹp ${name ?? ''} | Tuyển chọn hồ sơ nổi bật`;
    }
    case 'occupation': {
      const name = typeof data === 'string' ? data : (data as MetaNameData | undefined)?.name;
      return `Gái đẹp nghề ${name ?? ''} | Tuyển chọn hồ sơ nổi bật`;
    }
    case 'tag': {
      const name = typeof data === 'string' ? data : (data as MetaNameData | undefined)?.name;
      return `Gái xinh ${name ?? ''} | Bộ sưu tập ảnh đẹp`;
    }
    case 'profile': {
      const p = data as MetaProfileData | undefined;
      return p
        ? `${p.name} - ${p.age} tuổi, ${p.occupation}, ${p.district ? p.district + ' ' : ''}${p.province} | Bộ sưu tập ảnh`
        : 'Gái Xinh Việt Nam';
    }
    default:
      return 'Gái Xinh Việt Nam';
  }
}

// Generate meta description
export function generateMetaDescription(
  type: MetaType,
  data?: MetaNameData | MetaProfileData | string
): string {
  switch (type) {
    case 'home':
      return 'Khám phá bộ sưu tập gái xinh, gái đẹp từ khắp 63 tỉnh thành Việt Nam. Cập nhật hàng ngày với những hình ảnh chất lượng cao.';
    case 'province': {
      const name = typeof data === 'string' ? data : (data as MetaNameData | undefined)?.name;
      return `Tuyển chọn gái xinh ${name ?? ''} với những hình ảnh đẹp nhất. Khám phá vẻ đẹp của phụ nữ ${name ?? ''} qua bộ sưu tập được cập nhật thường xuyên.`;
    }
    case 'region': {
      const name = typeof data === 'string' ? data : (data as MetaNameData | undefined)?.name;
      return `Khám phá vẻ đẹp gái ${name ?? ''} qua bộ sưu tập hình ảnh chất lượng cao. Cập nhật liên tục những hồ sơ nổi bật nhất.`;
    }
    case 'occupation': {
      const name = typeof data === 'string' ? data : (data as MetaNameData | undefined)?.name;
      return `Bộ sưu tập gái đẹp nghề ${name ?? ''} với những hình ảnh chất lượng cao. Khám phá vẻ đẹp đa dạng của phụ nữ Việt Nam.`;
    }
    case 'profile': {
      const p = data as MetaProfileData | undefined;
      return p
        ? `Xem bộ sưu tập ảnh của ${p.name}, ${p.age} tuổi, nghề ${p.occupation} tại ${p.province}. Những hình ảnh đẹp và chất lượng cao.`
        : 'Gái Xinh Việt Nam - Bộ sưu tập ảnh đẹp';
    }
    default:
      return 'Gái Xinh Việt Nam - Bộ sưu tập ảnh đẹp';
  }
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Convert occupation slug to display name
export function slugToOccupation(slug: string): string {
  // Special mapping for Vietnamese occupations
  const occupationMap: { [key: string]: string } = {
    'sinh-vien': 'Sinh viên',
    'nguoi-mau': 'Người mẫu',
    'nhan-vien-van-phong': 'Nhân viên văn phòng',
    'giao-vien': 'Giáo viên',
    'y-ta': 'Y tá',
    'kinh-doanh': 'Kinh doanh',
    'freelancer': 'Freelancer',
    'hoc-sinh': 'Học sinh',
    'nhan-vien-ban-hang': 'Nhân viên bán hàng',
    'ke-toan': 'Kế toán',
    // Extended mappings to match DB occupations
    'nhan-vien-ngan-hang': 'Nhân viên ngân hàng',
    'ky-su': 'Kỹ sư',
    'bac-si': 'Bác sĩ',
    'lap-trinh-vien': 'Lập trình viên',
    'thiet-ke-do-hoa': 'Thiết kế đồ họa',
    'luat-su': 'Luật sư',
    'duoc-si': 'Dược sĩ',
    'tho-may': 'Thợ may',
    'tho-cat-toc': 'Thợ cắt tóc',
    'dau-bep': 'Đầu bếp',
    'tai-xe': 'Tài xế',
    'nhan-vien-y-te': 'Nhân viên y tế',
    'nhan-vien-marketing': 'Nhân viên marketing',
    'nhan-vien-it': 'Nhân viên IT',
    'cong-nhan': 'Công nhân',
    'nong-dan': 'Nông dân',
    'nhan-vien-khach-san': 'Nhân viên khách sạn',
    'huong-dan-vien-du-lich': 'Hướng dẫn viên du lịch',
    'kien-truc-su': 'Kiến trúc sư',
    'nha-bao': 'Nhà báo',
    'nhiep-anh-gia': 'Nhiếp ảnh gia',
    'nghe-si': 'Nghệ sĩ',
    'van-dong-vien': 'Vận động viên',
    'dien-vien': 'Diễn viên',
    'ca-si': 'Ca sĩ'
  };

  return occupationMap[slug] || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Convert occupation display name to slug
export function occupationToSlug(occupation: string): string {
  return createSlug(occupation);
}

// Build a Vietnamese diacritic-insensitive regex from a slug
// Example: "dien-vien" -> matches "Diễn viên" exactly (ignoring case and diacritics)
export function slugToVietnameseRegex(slug: string): RegExp {
  const charMap: Record<string, string> = {
    'a': '[aàáạảãâầấậẩẫăằắặẳẵ]',
    'e': '[eèéẹẻẽêềếệểễ]',
    'i': '[iìíịỉĩ]',
    'o': '[oòóọỏõôồốộổỗơờớợởỡ]',
    'u': '[uùúụủũưừứựửữ]',
    'y': '[yỳýỵỷỹ]',
    // Include both lowercase and uppercase variants explicitly for robust matching
    'd': '[dDđĐ]'
  };

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const tokens = slug.trim().replace(/-+/g, '-').split('-');
  const tokenPatterns = tokens.map(token => {
    let pat = '';
    for (const ch of token) {
      const lower = ch.toLowerCase();
      if (charMap[lower]) {
        pat += charMap[lower];
      } else if (/[a-z0-9]/.test(lower)) {
        pat += escapeRegex(lower);
      } else {
        pat += escapeRegex(lower);
      }
    }
    return pat;
  });

  // Be tolerant with separators between tokens: allow any characters in between
  // This handles cases like multiple spaces, hyphens, slashes, or minor punctuation
  const separator = '.*?';
  const pattern = '^\\s*' + tokenPatterns.join(separator) + '\\s*$';
  return new RegExp(pattern, 'i');
}

// Convert tag slug to display name
export function slugToTag(slug: string): string {
  // Special mapping for Vietnamese tags
  const tagMap: { [key: string]: string } = {
    'da-trang': 'Da trắng',
    'chan-dai': 'Chân dài',
    'de-thuong': 'Dễ thương',
    'goi-cam': 'Gợi cảm',
    'nang-dong': 'Năng động',
    'diu-dang': 'Dịu dàng',
    'ca-tinh': 'Cá tính',
    'than-thien': 'Thân thiện',
    'mat-to': 'Mắt to',
    'lac-quan': 'Lạc quan'
  };

  return tagMap[slug] || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Convert tag display name to slug
export function tagToSlug(tag: string): string {
  return createSlug(tag);
}