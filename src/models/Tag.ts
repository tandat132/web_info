import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  count: number; // Số lượng profile có tag này
  isActive: boolean;
  color?: string; // Màu hiển thị cho tag
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 50
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  description: { 
    type: String, 
    maxlength: 200 
  },
  count: { 
    type: Number, 
    default: 0,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  color: { 
    type: String, 
    default: '#6366f1' // Default indigo color
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexes for performance
TagSchema.index({ name: 1 });
TagSchema.index({ slug: 1 });
TagSchema.index({ isActive: 1, count: -1 });
TagSchema.index({ count: -1 });

// Update updatedAt on save
TagSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to update tag count
TagSchema.statics.updateTagCount = async function(tagName: string) {
  const Profile = mongoose.models.Profile;
  if (!Profile) return;
  
  const count = await Profile.countDocuments({ 
    tags: tagName, 
    status: 'published' 
  });
  
  await this.findOneAndUpdate(
    { name: tagName },
    { count },
    { upsert: false }
  );
};

// Static method to sync all tag counts
TagSchema.statics.syncAllTagCounts = async function() {
  const Profile = mongoose.models.Profile;
  if (!Profile) return;
  
  const tags = await this.find({ isActive: true });
  
  for (const tag of tags) {
    const count = await Profile.countDocuments({ 
      tags: tag.name, 
      status: 'published' 
    });
    
    tag.count = count;
    await tag.save();
  }
};

export default mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);