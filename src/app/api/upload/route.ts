import { NextRequest, NextResponse } from 'next/server';
import { 
  processMultipleSizes, 
  generateSEOFilename, 
  validateImageFile,
  generateBlurPlaceholder,
  deleteAllSizes
} from '@/lib/image-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const age = formData.get('age') as string;
    const province = formData.get('province') as string;
    const caption = formData.get('caption') as string || '';
    const alt = formData.get('alt') as string || '';

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được upload' },
        { status: 400 }
      );
    }

    if (!name || !age || !province) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: name, age, province' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate SEO-friendly filename
    const seoFilename = generateSEOFilename(file.name, {
      name,
      age: parseInt(age),
      province
    });

    // Process multiple sizes
    const processedImages = await processMultipleSizes(buffer, seoFilename);

    const medium = processedImages.medium;
    if (!medium) {
      return NextResponse.json(
        { error: 'Không thể xử lý ảnh kích thước medium' },
        { status: 500 }
      );
    }

    // Generate blur placeholder
    const blurDataURL = await generateBlurPlaceholder(buffer);

    // Prepare response data
    const imageData = {
      baseFilename: seoFilename,
      alt: alt || `${name} ${age} tuổi, gái xinh ${province}`,
      caption,
      blurDataURL,
      dominantColor: medium.dominantColor,
      format: 'webp',
      sizes: processedImages,
      // Main image info (medium size as default)
      url: medium.url,
      width: medium.width,
      height: medium.height,
      bytes: medium.size,
      isLCP: false // Will be set by client
    };

    return NextResponse.json({
      success: true,
      data: imageData
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi upload ảnh' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Thiếu tham số filename' },
        { status: 400 }
      );
    }

    // Delete all sizes of the image
    await deleteAllSizes(filename);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa ảnh thành công'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi xóa ảnh' },
      { status: 500 }
    );
  }
}