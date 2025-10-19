import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
            <span className="sr-only">Trang chủ</span>
          </Link>
        </li>
        
          {items.map((item) => (
          <li key={item.url} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-300 mx-2" />
            {item.current ? (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}