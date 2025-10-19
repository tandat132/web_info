'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AdminHeader() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => {
          // Mobile menu toggle - implement if needed
        }}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Quản trị website
          </h1>
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Logout button */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Đăng xuất
            </button>

            {/* Logout confirmation modal */}
            {showLogoutConfirm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                  
                  <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Xác nhận đăng xuất
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setShowLogoutConfirm(false)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}