import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập mật khẩu' },
        { status: 400 }
      );
    }

    // Get admin password from environment
    const adminPassword = "$2b$10$pbMTJkKbqxkAH9U3ShEUduF1RGVZaOR.f8dTITz8JyCPQtLVJavGi" // process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Cấu hình admin chưa được thiết lập' },
        { status: 500 }
      );
    }

    // Check password
    const isValid = await bcrypt.compare(password, adminPassword);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json({ success: true });
    
    // Set admin token cookie (in production, use JWT)
    response.cookies.set('admin-token', 'authenticated', {
      httpOnly: true,
      secure: false, // Set to false for local testing, change to true only for HTTPS production
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/', // Explicitly set path
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}