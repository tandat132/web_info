'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Hồ sơ', href: '/admin/profiles', icon: UserGroupIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
        <div className="flex h-16 flex-shrink-0 items-center bg-gray-900 px-4">
          <Link href="/admin" className="text-white font-bold text-xl">
            Admin Panel
          </Link>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-6 w-6 flex-shrink-0
                      ${isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex flex-shrink-0 bg-gray-700 p-4">
          <Link
            href="/"
            target="_blank"
            className="group block w-full flex-shrink-0"
          >
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white group-hover:text-gray-300">
                  Xem website
                </p>
                <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                  Mở trong tab mới
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}