import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Tag from '@/models/Tag';
import { tagToSlug, occupationToSlug } from '@/lib/utils';

// Helper function để sync tags từ profile
async function syncTagsFromProfile(tags: string[]) {
  for (const tagName of tags) {
    if (!tagName.trim()) continue;
    
    // Generate slug for tag
    const slug = tagName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if tag exists (case-insensitive và theo slug)
    const existingTag = await Tag.findOne({ 
      $or: [
        { name: { $regex: new RegExp(`^${tagName}$`, 'i') } },
        { slug: slug }
      ]
    });

    if (existingTag) {
      // Update count for existing tag
      const count = await Profile.countDocuments({ 
        tags: { $in: [tagName] },
        status: 'published'
      });
      existingTag.count = count;
      await existingTag.save();
    } else {
      // Create new tag
      const count = await Profile.countDocuments({ 
        tags: { $in: [tagName] },
        status: 'published'
      });
      
      await Tag.create({
        name: tagName,
        slug,
        count,
        description: `Đặc điểm ${tagName}`,
        color: '#3B82F6',
        isActive: true
      });
    }
  }
}

// GET /api/profiles/[slug] - Lấy chi tiết hồ sơ theo slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug không được cung cấp' },
        { status: 400 }
      );
    }

    const profile = await Profile.findOne({ 
      slug, 
      status: 'published' 
    }).lean();

    if (!profile) {
      return NextResponse.json(
        { error: 'Không tìm thấy hồ sơ' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin hồ sơ' },
      { status: 500 }
    );
  }
}

// PUT /api/profiles/[slug] - Cập nhật hồ sơ theo slug (cho admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const body = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug không được cung cấp' },
        { status: 400 }
      );
    }

    // Generate slug versions for consistent filtering
    const updateData = { ...body, updatedAt: new Date() };
    
    if (body.occupation) {
      updateData.occupationSlug = occupationToSlug(body.occupation);
    }
    
    if (body.tags) {
      const tagsArray = Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []);
      updateData.tags = tagsArray;
      updateData.tagSlugs = tagsArray.map((tag: string) => tagToSlug(tag));
    }

    const profile = await Profile.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Không tìm thấy hồ sơ' },
        { status: 404 }
      );
    }

    // Tự động tạo/cập nhật tags trong Tag collection nếu có tags
    if (body.tags) {
      const tagsArray = Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []);
      if (tagsArray.length > 0) {
        await syncTagsFromProfile(tagsArray);
      }
    }

    return NextResponse.json({
      message: 'Hồ sơ đã được cập nhật thành công',
      profile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật hồ sơ' },
      { status: 500 }
    );
  }
}

// DELETE /api/profiles/[slug] - Xóa hồ sơ theo slug (cho admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug không được cung cấp' },
        { status: 400 }
      );
    }

    const profile = await Profile.findOneAndDelete({ slug });

    if (!profile) {
      return NextResponse.json(
        { error: 'Không tìm thấy hồ sơ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Hồ sơ đã được xóa thành công'
    });

  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Không thể xóa hồ sơ' },
      { status: 500 }
    );
  }
}