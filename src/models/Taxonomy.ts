import mongoose, { Document, Schema } from 'mongoose';

export interface ITaxonomy extends Document {
  name: string;
  slug: string;
  type: 'province' | 'region' | 'occupation' | 'tag';
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaxonomySchema = new Schema<ITaxonomy>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  type: { type: String, enum: ['province', 'region', 'occupation', 'tag'], required: true },
  description: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound unique index
TaxonomySchema.index({ slug: 1, type: 1 }, { unique: true });
TaxonomySchema.index({ type: 1, order: 1 });

// Update updatedAt on save
TaxonomySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Taxonomy || mongoose.model<ITaxonomy>('Taxonomy', TaxonomySchema);