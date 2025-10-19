'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PROVINCES, DEFAULT_OCCUPATIONS, DEFAULT_TAGS } from '@/lib/constants';
import Image from "next/image";

interface Profile {
  _id: string;
  name: string;
  slug: string;
  age: number;
  height?: number;
  weight?: number;
  region: 'Miền Nam' | 'Miền Bắc' | 'Miền Trung';
  province: string;
  occupation: string;
  description?: string;
  tags: string[];
  photos: Array<{
    url: string;
    alt: string;
    width: number;
    height: number;
  }>;
  isFeatured: boolean;
  status: 'published' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch profiles from API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/profiles?limit=100'); // Get all profiles for admin
        
        if (!response.ok) {
          throw new Error('Không thể tải danh sách hồ sơ');
        }
        
        const data = await response.json();
        setProfiles(data.profiles || []);
      } catch (err) {
        setError('Không thể tải danh sách hồ sơ');
        console.error('Error fetching profiles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Filter profiles based on search and status
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.occupation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProfile = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
      setProfiles(profiles.filter(p => p._id !== profileId));
    }
  };

  const handleSaveProfile = (data: Partial<Profile>) => {
    if (editingProfile) {
      // Update existing profile
      setProfiles(profiles.map(p => 
        p._id === editingProfile._id 
          ? { ...p, ...data, updatedAt: new Date() }
          : p
      ));
    } else {
      // Add new profile
      const newProfile: Profile = {
        _id: Date.now().toString(),
        slug: data.name?.toLowerCase().replace(/\s+/g, '-') || '',
        photos: data.photos || [],
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      } as Profile;
      setProfiles([...profiles, newProfile]);
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Đang tải danh sách hồ sơ...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý hồ sơ</h1>
        <button
          onClick={handleAddProfile}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Thêm hồ sơ</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, tỉnh thành, nghề nghiệp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hồ sơ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {profiles.length === 0 ? 'Chưa có hồ sơ nào. Hãy thêm hồ sơ đầu tiên!' : 'Không tìm thấy hồ sơ nào phù hợp.'}
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => (
                  <tr key={profile._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {profile.photos.length > 0 ? (
                            <Image
                              src={profile.photos[0].url}
                              alt={profile.name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">{profile.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                          <div className="text-sm text-gray-500">{profile.age} tuổi</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{profile.occupation}</div>
                      <div className="text-sm text-gray-500">
                        {profile.height && profile.weight 
                          ? `${profile.height}cm - ${profile.weight}kg`
                          : profile.height 
                            ? `${profile.height}cm`
                            : profile.weight 
                              ? `${profile.weight}kg`
                              : 'Chưa cập nhật'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{profile.province}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : profile.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.status === 'published' ? 'Đã xuất bản' : 
                         profile.status === 'draft' ? 'Bản nháp' : 'Đã lưu trữ'}
                      </span>
                      {profile.isFeatured && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                          Nổi bật
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/ho-so/${profile.slug}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem hồ sơ"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditProfile(profile)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Sửa hồ sơ"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa hồ sơ"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal */}
      {isModalOpen && (
        <ProfileModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// Profile Modal Component
function ProfileModal({ 
  profile, 
  onClose 
}: { 
  profile: Profile | null;
  onSave: (data: Partial<Profile>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age || 18,
    height: profile?.height || '',
    weight: profile?.weight || '',
    region: profile?.region || 'Miền Nam',
    province: profile?.province || '',
    occupation: profile?.occupation || '',
    description: profile?.description || '',
    tags: profile?.tags?.join(', ') || '',
    isFeatured: profile?.isFeatured || false
  });
  type FullPhoto = {
    url: string;
    baseFilename: string;
    alt: string;
    width: number;
    height: number;
    format: string;    // webp/png/jpg...
    bytes: number;
    dominantColor?: string;
    caption?: string;
    isLCP?: boolean;
    blurDataURL?: string;
    sizes?: {
      thumbnail?: { url: string; width: number; height: number; size: number };
      small?: { url: string; width: number; height: number; size: number };
      medium?: { url: string; width: number; height: number; size: number };
      large?: { url: string; width: number; height: number; size: number };
      original?: { url: string; width: number; height: number; size: number };
    };
  };
  // Ảnh kiểu ngắn của Profile.photos ở ngoài (chỉ 4 field)
  type ShortPhoto = { url: string; alt: string; width: number; height: number };

  // Chuẩn hoá mọi input ảnh về FullPhoto để TS không kêu thiếu field
  const toFullPhoto = (p: Partial<FullPhoto> | ShortPhoto): FullPhoto => {
    const url = p.url ?? "";
    const baseFilename =
      "baseFilename" in p
        ? p.baseFilename ?? (url ? url.split("/").pop()?.split("?")[0] ?? "image" : "image")
        : url.split("/").pop()?.split("?")[0] ?? "image";

    return {
      url,
      baseFilename,
      alt: p.alt ?? "Ảnh",
      width: p.width ?? 0,
      height: p.height ?? 0,
      format: "format" in p && p.format ? p.format : "webp",
      bytes: "bytes" in p && typeof p.bytes === "number" ? p.bytes : 0,
      dominantColor: "dominantColor" in p ? p.dominantColor : undefined,
      caption: "caption" in p ? p.caption : undefined,
      isLCP: "isLCP" in p ? p.isLCP : undefined,
      blurDataURL: "blurDataURL" in p ? p.blurDataURL : undefined,
      sizes: "sizes" in p ? p.sizes : undefined,
    };
  };

  const [uploadedPhotos, setUploadedPhotos] = useState<FullPhoto[]>(
    (profile?.photos ?? []).map(toFullPhoto) // ép Profile.photos (ngắn) → FullPhoto (đầy đủ)
  );

  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Get provinces for selected region
  const availableProvinces = PROVINCES.filter(p => p.region === formData.region);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('name', formData.name || 'Unknown');
        formDataUpload.append('age', formData.age.toString());
        formDataUpload.append('province', formData.province || 'Unknown');
        formDataUpload.append('index', (uploadedPhotos.length + i + 1).toString());
        formDataUpload.append('alt', `${formData.name} ${formData.age} tuổi, gái xinh ${formData.province} - Ảnh ${uploadedPhotos.length + i + 1}`);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Không thể upload ảnh');
        }

        const result = await response.json();
        setUploadedPhotos(prev => [...prev, {
          ...result.data,
          isLCP: prev.length === 0 // Mark first image as LCP
        }]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showNotification('error', error instanceof Error ? error.message : 'Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const photo = uploadedPhotos[index];
    
    try {
      // Delete from local storage
      await fetch(`/api/upload?filename=${photo.baseFilename}`, {
        method: 'DELETE',
      });
      
      setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting image:', error);
      showNotification('error', 'Có lỗi xảy ra khi xóa ảnh');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploading) {
      showNotification('info', 'Vui lòng đợi upload ảnh hoàn tất');
      return;
    }
    
    try {
      // Process tags and occupation to include slugs
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const profileData = {
        ...formData,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        tags: tagsArray,
        occupation: formData.occupation.trim(),
        photos: uploadedPhotos
      };

      // Ensure all required fields exist for photos
      if (profileData.photos && profileData.photos.length > 0) {
        profileData.photos = profileData.photos.map((photo, index) => ({
          ...photo,
          alt: photo.alt || `${formData.name} ${formData.age} tuổi - Ảnh ${index + 1}`,
          bytes: photo.bytes || 0 // Fallback for bytes if missing
        }));
      }

      if (profile) {
        // Update existing profile
        const response = await fetch(`/api/profiles/${profile.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Không thể cập nhật hồ sơ');
        }

        showNotification('success', 'Hồ sơ đã được cập nhật thành công!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        // Create new profile
        const response = await fetch('/api/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Không thể tạo hồ sơ');
        }

        showNotification('success', 'Hồ sơ đã được tạo thành công!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('error', error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu hồ sơ');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {notification && (
        <div className="fixed top-4 right-4 z-[60]">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-600 text-white' : notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
            <div className="flex items-center space-x-3">
              <span className="font-medium">{notification.message}</span>
              <button onClick={() => setNotification(null)} className="hover:opacity-80">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-6 text-gray-900">
          {profile ? 'Sửa hồ sơ' : 'Thêm hồ sơ mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hình ảnh
            </label>
            
            {/* Image Preview Grid */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={photo.baseFilename} className="relative group">
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      width={400}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    {photo.isLCP && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          LCP
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                      <div>{photo.format?.toUpperCase() || 'IMG'} • {Math.round(photo.bytes / 1024)}KB</div>
                      <div>{photo.width}×{photo.height}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className={`text-sm font-medium ${uploading ? 'text-gray-400' : 'text-blue-600 hover:text-blue-500'}`}>
                    {uploading ? 'Đang upload...' : 'Tải lên hình ảnh'}
                  </span>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, WebP tối đa 10MB. Ảnh sẽ được tối ưu thành WebP.
              </p>
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Nhập tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tuổi *
              </label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Nhập tuổi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chiều cao (cm)
              </label>
              <input
                type="number"
                min="140"
                max="200"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="165"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                min="35"
                max="100"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vùng miền *
              </label>
              <select
                required
                value={formData.region}
                onChange={(e) => {
                  const newRegion = e.target.value as 'Miền Nam' | 'Miền Bắc' | 'Miền Trung';
                  setFormData({...formData, region: newRegion, province: ''});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="Miền Nam">Miền Nam</option>
                <option value="Miền Trung">Miền Trung</option>
                <option value="Miền Bắc">Miền Bắc</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh thành *
              </label>
              <select
                required
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">Chọn tỉnh thành</option>
                {availableProvinces.map(province => (
                  <option key={province.slug} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nghề nghiệp * (có thể nhập tùy chỉnh)
              </label>
              <input
                type="text"
                required
                list="occupations"
                value={formData.occupation}
                onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                placeholder="Chọn hoặc nhập nghề nghiệp..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
              />
              <datalist id="occupations">
                {DEFAULT_OCCUPATIONS.map(occupation => (
                  <option key={occupation} value={occupation} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Mô tả ngắn về hồ sơ này..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="Da trắng, Dễ thương, Năng động"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {DEFAULT_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                    if (!currentTags.includes(tag)) {
                      setFormData({...formData, tags: [...currentTags, tag].join(', ')});
                    }
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
              Hồ sơ nổi bật
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {profile ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}