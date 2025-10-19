import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoto {
  url: string;
  baseFilename: string; // Base filename for local storage management
  alt: string;
  width: number;
  height: number;
  dominantColor?: string;
  caption?: string;
  format: string; // webp, avif, jpeg, etc.
  bytes: number; // File size for optimization tracking
  isLCP?: boolean; // Mark if this is the LCP (Largest Contentful Paint) image
  blurDataURL?: string; // Base64 blur placeholder
  sizes?: {
    thumbnail?: { url: string; width: number; height: number; size: number };
    small?: { url: string; width: number; height: number; size: number };
    medium?: { url: string; width: number; height: number; size: number };
    large?: { url: string; width: number; height: number; size: number };
    original?: { url: string; width: number; height: number; size: number };
  };
}

export interface IProfile extends Document {
  name: string;
  slug: string;
  age: number;
  height?: number;
  weight?: number;
  region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';
  province: string;
  district?: string;
  occupation: string;
  occupationSlug: string; // Slug version of occupation for consistent filtering
  description?: string;
  tags: string[];
  tagSlugs: string[]; // Slug versions of tags for consistent filtering
  photos: IPhoto[];
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

const PhotoSchema = new Schema<IPhoto>({
  url: { type: String, required: true },
  baseFilename: { type: String, required: true },
  alt: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  dominantColor: { type: String },
  caption: { type: String },
  format: { type: String, required: true },
  bytes: { type: Number, required: true },
  isLCP: { type: Boolean, default: false },
  blurDataURL: { type: String },
  sizes: {
    thumbnail: {
      url: { type: String },
      width: { type: Number },
      height: { type: Number },
      size: { type: Number }
    },
    small: {
      url: { type: String },
      width: { type: Number },
      height: { type: Number },
      size: { type: Number }
    },
    medium: {
      url: { type: String },
      width: { type: Number },
      height: { type: Number },
      size: { type: Number }
    },
    large: {
      url: { type: String },
      width: { type: Number },
      height: { type: Number },
      size: { type: Number }
    },
    original: {
      url: { type: String },
      width: { type: Number },
      height: { type: Number },
      size: { type: Number }
    }
  }
});

const ProfileSchema = new Schema<IProfile>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  height: { type: Number },
  weight: { type: Number },
  region: { type: String, enum: ['Miền Bắc', 'Miền Trung', 'Miền Nam'], required: true },
  province: { type: String, required: true },
  district: { type: String },
  occupation: { type: String, required: true },
  occupationSlug: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  tagSlugs: [{ type: String }],
  photos: [PhotoSchema],
  isFeatured: { type: Boolean, default: false },
  featuredScore: { type: Number, default: 0 },
  metaTitle: { type: String },
  metaDescription: { type: String },
  ogImage: { type: String },
  canonical: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date }
});

// Indexes for SEO and performance
ProfileSchema.index({ slug: 1 });
ProfileSchema.index({ region: 1, province: 1 });
ProfileSchema.index({ occupation: 1 });
ProfileSchema.index({ occupationSlug: 1 });
ProfileSchema.index({ tags: 1 });
ProfileSchema.index({ tagSlugs: 1 });
ProfileSchema.index({ status: 1, publishedAt: -1 });
ProfileSchema.index({ isFeatured: -1, featuredScore: -1 });

// Update updatedAt on save
ProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);