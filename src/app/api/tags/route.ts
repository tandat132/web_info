import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tag from '@/models/Tag';
import Profile from '@/models/Profile';
import type { FilterQuery } from 'mongoose';

interface TagShape {
  name: string;
  slug: string;
  description?: string;
  count: number;
  isActive: boolean;
  color?: string;
}

// GET /api/tags - Lấy danh sách tags
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    // Build query
    const query: FilterQuery<TagShape> = {};
    if (activeOnly) {
      query.isActive = true;
    }
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    // Get tags from Tag model
    const tags = await Tag.find(query)
      .sort({ count: -1, name: 1 })
      .limit(limit > 0 ? limit : 0)
      .lean();

    return NextResponse.json({
      tags: tags.map(tag => ({
        _id: tag._id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        count: tag.count,
        isActive: tag.isActive,
        color: tag.color
      })),
      total: tags.length
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách đặc điểm' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Tạo tag mới
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tên đặc điểm là bắt buộc' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if tag already exists
    const existingTag = await Tag.findOne({ 
      $or: [{ name }, { slug }] 
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Đặc điểm này đã tồn tại' },
        { status: 409 }
      );
    }

    // Count existing profiles with this tag
    const count = await Profile.countDocuments({ 
      tags: name, 
      status: 'published' 
    });

    const newTag = new Tag({
      name,
      slug,
      description,
      color: color || '#6366f1',
      count
    });

    await newTag.save();

    return NextResponse.json({
      message: 'Tạo đặc điểm thành công',
      tag: {
        _id: newTag._id,
        name: newTag.name,
        slug: newTag.slug,
        description: newTag.description,
        count: newTag.count,
        isActive: newTag.isActive,
        color: newTag.color
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Không thể tạo đặc điểm' },
      { status: 500 }
    );
  }
}