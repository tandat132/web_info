import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Tag from '@/models/Tag';
import mongoose from 'mongoose';
import { generateProfileSlug, tagToSlug, occupationToSlug } from '@/lib/utils';
import { PROVINCES } from '@/lib/constants';
import type { FilterQuery, AnyObject } from 'mongoose';

// Map region codes and slugs to Vietnamese names
const REGION_CODE_TO_NAME: Record<string, string> = {
  'bac': 'Miền Bắc',
  'trung': 'Miền Trung', 
  'nam': 'Miền Nam'
};

const REGION_SLUG_TO_NAME: Record<string, string> = {
  'mien-bac': 'Miền Bắc',
  'mien-trung': 'Miền Trung',
  'mien-nam': 'Miền Nam'
};

// Create province slug to name mapping
const PROVINCE_SLUG_TO_NAME: Record<string, string> = {};
PROVINCES.forEach(province => {
  PROVINCE_SLUG_TO_NAME[province.slug] = province.name;
});

// Helper function để tự động tạo/cập nhật tags
async function syncTagsFromProfile(profileTags: string[]) {
  try {
    for (const tagName of profileTags) {
      if (!tagName || tagName.trim() === '') continue;
      
      const trimmedTagName = tagName.trim();
      
      // Tạo slug từ tên tag
      const slug = trimmedTagName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Kiểm tra tag đã tồn tại chưa (case-insensitive và theo slug)
      const existingTag = await Tag.findOne({ 
        $or: [
          { name: { $regex: new RegExp(`^${trimmedTagName}$`, 'i') } },
          { slug: slug }
        ]
      });

      if (existingTag) {
        // Cập nhật count cho tag đã tồn tại
        const count = await Profile.countDocuments({ 
          tags: trimmedTagName, 
          status: 'published' 
        });
        existingTag.count = count;
        await existingTag.save();
      } else {
        // Tạo tag mới
        const count = await Profile.countDocuments({ 
          tags: trimmedTagName, 
          status: 'published' 
        });
        
        const newTag = new Tag({
          name: trimmedTagName,
          slug,
          count,
          isActive: true,
          color: '#6366f1'
        });

        await newTag.save();
      }
    }
  } catch (error) {
    console.error('Error syncing tags:', error);
    // Không throw error để không ảnh hưởng đến việc tạo profile
  }
}

// GET /api/profiles - Lấy danh sách hồ sơ
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const region = searchParams.get('region');
    const province = searchParams.get('province');
    const occupation = searchParams.get('occupation');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const age = searchParams.get('age');
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured') === 'true';
    
    // Handle age parameters
    let ageMin = 18;
    let ageMax = 50;
    
    if (age) {
      // Handle special age values
      if (age === 'duoi-18') {
        ageMin = 0;
        ageMax = 17;
      } else if (age === 'tren-35') {
        ageMin = 36;
        ageMax = 100;
      } else {
        // Handle age range format like "18-22"
        const [minAge, maxAge] = age.split('-').map(Number);
        if (minAge) ageMin = minAge;
        if (maxAge) ageMax = maxAge;
      }
    } else {
      // Handle individual ageMin and ageMax parameters
      ageMin = parseInt(searchParams.get('ageMin') || '18');
      ageMax = parseInt(searchParams.get('ageMax') || '50');
    }
    const exclude = searchParams.get('exclude'); // ID to exclude from results

    // Build filter query
    const filter: FilterQuery<AnyObject> = { status };

    if (region) {
      // Convert region code or slug to Vietnamese name
      const regionName = REGION_CODE_TO_NAME[region] || REGION_SLUG_TO_NAME[region] || region;
      filter.region = regionName;
    }
    if (province) {
      // Convert province slug to Vietnamese name if needed
      const provinceName = PROVINCE_SLUG_TO_NAME[province] || province;
      filter.province = provinceName;
    }
    if (occupation) {
      // Convert occupation to slug for consistent filtering
      const occupationSlug = occupationToSlug(occupation);
      filter.occupationSlug = occupationSlug;
    }
    if (tags && tags.length > 0) {
      // Convert tags to slugs for consistent filtering
      const tagSlugs = tags.map(tag => tagToSlug(tag));
      filter.tagSlugs = { $in: tagSlugs };
    }
    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) filter.age.$gte = ageMin;
      if (ageMax) filter.age.$lte = ageMax;
    }
    if (exclude && exclude !== 'undefined' && mongoose.Types.ObjectId.isValid(exclude)) {
      filter._id = { $ne: exclude };
    }
    if (featured) {
      filter.isFeatured = true;
    }

    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Profile.countDocuments(filter)
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách hồ sơ' },
      { status: 500 }
    );
  }
}

// POST /api/profiles - Tạo hồ sơ mới
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      age,
      height,
      weight,
      region,
      province,
      occupation,
      description,
      tags,
      photos,
      isFeatured
    } = body;

    // Validate required fields
    if (!name || !age || !region || !province || !occupation) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Generate SEO-friendly slug
    const baseSlug = generateProfileSlug(name, age, occupation, undefined, province);
    
    // Ensure uniqueness by checking existing slugs
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Profile.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate slug versions for consistent filtering
    const occupationSlug = occupationToSlug(occupation);
    const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    const tagSlugs = tagsArray.map((tag: string) => tagToSlug(tag));

    // Create new profile
    const profile = new Profile({
      name,
      slug: finalSlug,
      age,
      height,
      weight,
      region,
      province,
      occupation,
      occupationSlug,
      description,
      tags: tagsArray,
      tagSlugs,
      photos: photos || [],
      isFeatured: isFeatured || false,
      status: 'published'
    });

    await profile.save();

    // Tự động tạo/cập nhật tags trong Tag collection
    if (tagsArray && tagsArray.length > 0) {
      await syncTagsFromProfile(tagsArray);
    }

    return NextResponse.json({
      message: 'Hồ sơ đã được tạo thành công',
      profile
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating profile:', error);

    const isDupKey =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000;

    if (isDupKey) {
      return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Không thể tạo hồ sơ' }, { status: 500 });
  }
}