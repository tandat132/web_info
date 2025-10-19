import Link from 'next/link';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trang quản trị</h1>
        <p className="text-gray-600 mt-2">Chọn một mục để bắt đầu quản lý</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/profiles"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hồ sơ</h3>
              <p className="text-gray-600 text-sm">Quản lý hồ sơ người dùng</p>
            </div>
          </div>
        </Link>


      </div>
    </div>
  );
}