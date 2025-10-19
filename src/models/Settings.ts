import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  contactPhone?: string;
  contactZalo?: string;
  contactTelegram?: string;
  contactCTA?: string;
  contactNote?: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  contactPhone: { type: String },
  contactZalo: { type: String },
  contactTelegram: { type: String },
  contactCTA: { type: String, default: 'Liên hệ ngay' },
  contactNote: { type: String },
  siteName: { type: String, required: true, default: 'Gái Xinh Việt Nam' },
  siteDescription: { type: String, required: true, default: 'Tuyển chọn gái xinh, gái đẹp từ khắp các tỉnh thành Việt Nam' },
  siteUrl: { type: String, required: true },
  ogImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
SettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);