import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tag from '@/models/Tag';
import Profile from '@/models/Profile';

// POST /api/tags/sync - Sync tags từ profiles hiện có
export async function POST() {
  try {
    await dbConnect();

    // Get all unique tags from profiles
    const profileTags = await Profile.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { 
        _id: '$tags', 
        count: { $sum: 1 } 
      }},
      { $sort: { count: -1, _id: 1 } }
    ]);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const profileTag of profileTags) {
      try {
        const tagName = profileTag._id;
        const count = profileTag.count;

        // Create slug from name
        const slug = tagName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Check if tag already exists
        const existingTag = await Tag.findOne({ name: tagName });

        if (existingTag) {
          // Update count
          existingTag.count = count;
          await existingTag.save();
          updated++;
        } else {
          // Create new tag
          const newTag = new Tag({
            name: tagName,
            slug,
            count,
            isActive: true,
            color: '#6366f1'
          });

          await newTag.save();
          created++;
        }
      } catch (error) {
        console.error(`Error processing tag ${profileTag._id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      message: 'Sync tags thành công',
      stats: {
        total: profileTags.length,
        created,
        updated,
        errors
      }
    });

  } catch (error) {
    console.error('Error syncing tags:', error);
    return NextResponse.json(
      { error: 'Không thể sync tags' },
      { status: 500 }
    );
  }
}

// GET /api/tags/sync - Kiểm tra trạng thái sync
export async function GET() {
  try {
    await dbConnect();

    // Count tags in Tag model
    const tagModelCount = await Tag.countDocuments();

    // Count unique tags in profiles
    const profileTagsCount = await Profile.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $count: 'total' }
    ]);

    const profileUniqueTagsCount = profileTagsCount[0]?.total || 0;

    // Get tags that exist in profiles but not in Tag model
    const missingTags = await Profile.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { 
        _id: '$tags', 
        count: { $sum: 1 } 
      }},
      {
        $lookup: {
          from: 'tags',
          localField: '_id',
          foreignField: 'name',
          as: 'tagModel'
        }
      },
      { $match: { tagModel: { $size: 0 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return NextResponse.json({
      stats: {
        tagModelCount,
        profileUniqueTagsCount,
        missingTagsCount: missingTags.length,
        needsSync: profileUniqueTagsCount > tagModelCount
      },
      missingTags: missingTags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });

  } catch (error) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: 'Không thể kiểm tra trạng thái sync' },
      { status: 500 }
    );
  }
}