export interface Profile {
  _id: string;
  name: string;
  slug: string;
  age: number;
  height?: number;
  weight?: number;
  region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';
  province: string;
  district?: string;
  occupation: string;
  description?: string;
  tags: string[];
  photos: ProfilePhoto[];
  isFeatured: boolean;
  featuredScore: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonical?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ProfilePhoto {
  url: string;
  baseFilename: string;
  alt: string;
  width: number;
  height: number;
  dominantColor?: string;
  caption?: string;
  format: string;
  bytes: number;
  isLCP: boolean;
  blurDataURL?: string;
}