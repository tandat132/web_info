import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra authorization (có thể thêm middleware auth sau)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-secret') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Bắt đầu generate profiles...');
    
    // Chạy script generate profiles
    const scriptPath = path.join(process.cwd(), 'src/scripts/generate-profiles.js');
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      cwd: process.cwd(),
      env: { ...process.env }
    });

    console.log('Script output:', stdout);
    if (stderr) {
      console.error('Script errors:', stderr);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã tạo thành công 100 hồ sơ',
      output: stdout,
      errors: stderr || null
    });

  } catch (error) {
    console.error('Lỗi khi generate profiles:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi server', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API endpoint để generate profiles. Sử dụng POST method.',
    usage: 'POST /api/admin/generate-profiles với header Authorization: Bearer admin-secret'
  });
}