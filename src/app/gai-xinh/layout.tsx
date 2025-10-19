import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: {
    template: '%s | Gái Xinh Việt Nam',
    default: 'Gái Xinh Việt Nam - Hồ Sơ Đẹp Nhất',
  },
  description: 'Khám phá bộ sưu tập hồ sơ gái xinh từ khắp Việt Nam. Tìm kiếm theo khu vực, tỉnh thành và nghề nghiệp.',
  keywords: 'gái xinh, hồ sơ, việt nam, đẹp, tìm kiếm',
  openGraph: {
    title: 'Gái Xinh Việt Nam',
    description: 'Khám phá bộ sưu tập hồ sơ gái xinh từ khắp Việt Nam',
    type: 'website',
  },
};

interface GaiXinhLayoutProps {
  children: React.ReactNode;
}

export default function GaiXinhLayout({ children }: GaiXinhLayoutProps) {
  return (
    <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Main Content */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-200 border-t-pink-600"></div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}