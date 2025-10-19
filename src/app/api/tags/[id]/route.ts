import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tag from '@/models/Tag';
import Profile from '@/models/Profile';

// GET /api/tags/[id] - Lấy thông tin tag theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const tag = await Tag.findById(resolvedParams.id);

    if (!tag) {
      return NextResponse.json(
        { error: 'Không tìm thấy đặc điểm' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tag: {
        _id: tag._id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        count: tag.count,
        isActive: tag.isActive,
        color: tag.color,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin đặc điểm' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - Cập nhật tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const body = await request.json();
    const { name, description, color, isActive } = body;

    const tag = await Tag.findById(resolvedParams.id);

    if (!tag) {
      return NextResponse.json(
        { error: 'Không tìm thấy đặc điểm' },
        { status: 404 }
      );
    }

    // If name is being changed, check for duplicates
    if (name && name !== tag.name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const existingTag = await Tag.findOne({ 
        $or: [{ name }, { slug }],
        _id: { $ne: resolvedParams.id }
      });

      if (existingTag) {
        return NextResponse.json(
          { error: 'Tên đặc điểm này đã tồn tại' },
          { status: 409 }
        );
      }

      tag.slug = slug;
    }

    // Update fields
    if (name) tag.name = name;
    if (description !== undefined) tag.description = description;
    if (color) tag.color = color;
    if (isActive !== undefined) tag.isActive = isActive;

    // Update count if name changed
    if (name && name !== tag.name) {
      const count = await Profile.countDocuments({ 
        tags: name, 
        status: 'published' 
      });
      tag.count = count;
    }

    await tag.save();

    return NextResponse.json({
      message: 'Cập nhật đặc điểm thành công',
      tag: {
        _id: tag._id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        count: tag.count,
        isActive: tag.isActive,
        color: tag.color
      }
    });

  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật đặc điểm' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Xóa tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const tag = await Tag.findById(resolvedParams.id);

    if (!tag) {
      return NextResponse.json(
        { error: 'Không tìm thấy đặc điểm' },
        { status: 404 }
      );
    }

    // Check if tag is being used in profiles
    const profilesUsingTag = await Profile.countDocuments({ 
      tags: tag.name,
      status: 'published'
    });

    if (profilesUsingTag > 0) {
      return NextResponse.json(
        { 
          error: `Không thể xóa đặc điểm này vì đang được sử dụng bởi ${profilesUsingTag} hồ sơ. Hãy deactivate thay vì xóa.`,
          profilesCount: profilesUsingTag
        },
        { status: 409 }
      );
    }

    await Tag.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({
      message: 'Xóa đặc điểm thành công'
    });

  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Không thể xóa đặc điểm' },
      { status: 500 }
    );
  }
}