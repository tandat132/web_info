import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import OccupationPageContent from '@/components/occupation/OccupationPageContent';
import { slugToOccupation, occupationToSlug } from '@/lib/utils';
import { DEFAULT_OCCUPATIONS } from '@/lib/constants';

interface OccupationPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: OccupationPageProps): Promise<Metadata> {
  const { slug } = params;
  const occupation = slugToOccupation(slug);
  
  if (!occupation) {
    return {
      title: 'Nghề không tìm thấy',
      description: 'Nghề này không tồn tại trong hệ thống.'
    };
  }

  const title = `Gái xinh ${occupation}`;
  const description = `Tuyển chọn gái xinh làm ${occupation} từ khắp Việt Nam. Cập nhật hàng ngày với những hình ảnh chất lượng cao.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function OccupationPage({ params }: OccupationPageProps) {
  const { slug } = params;
  const occupation = slugToOccupation(slug);

  // Check if occupation exists
  if (!occupation) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    }>
      <OccupationPageContent occupation={occupation} />
    </Suspense>
  );
}

export async function generateStaticParams() {
  return DEFAULT_OCCUPATIONS.map((occupation) => ({
    slug: occupationToSlug(occupation),
  }));
}