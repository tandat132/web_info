import Link from 'next/link';
import { PROVINCES, REGIONS } from '@/lib/constants';

export default function Footer() {
  const popularProvinces = PROVINCES.filter(p => 
    ['ha-noi', 'ho-chi-minh', 'da-nang', 'hai-phong', 'can-tho'].includes(p.slug)
  );

  // Helper function to get region for a province
  const getRegionForProvince = (provinceSlug: string) => {
    const province = PROVINCES.find(p => p.slug === provinceSlug);
    if (!province) return 'mien-bac';
    
    const region = REGIONS.find(r => r.name === province.region);
    return region?.slug || 'mien-bac';
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="text-2xl font-bold text-pink-400 mb-4">
              Gái Xinh VN
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tuyển chọn gái xinh, gái đẹp từ khắp các tỉnh thành Việt Nam. 
              Cập nhật hàng ngày với những hình ảnh chất lượng cao.
            </p>
          </div>

          {/* Regions */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Theo miền</h3>
            <ul className="space-y-2">
              {REGIONS.map((region) => (
                <li key={region.code}>
                  <Link 
                    href={`/gai-xinh/${region.slug}`}
                    className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                  >
                    {region.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Provinces */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Tỉnh thành nổi bật</h3>
            <ul className="space-y-2">
              {popularProvinces.map((province) => {
                const regionSlug = getRegionForProvince(province.slug);
                return (
                  <li key={province.slug}>
                    <Link 
                      href={`/gai-xinh/${regionSlug}/${province.slug}`}
                      className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                    >
                      Gái xinh {province.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/gai-xinh?tags=sinh-vien"
                  className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                >
                  Gái xinh sinh viên
                </Link>
              </li>
              <li>
                <Link 
                  href="/gai-xinh?tags=nguoi-mau"
                  className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                >
                  Gái xinh người mẫu
                </Link>
              </li>
              <li>
                <Link 
                  href="/gai-xinh?tags=da-trang"
                  className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                >
                  Gái xinh da trắng
                </Link>
              </li>
              <li>
                <Link 
                  href="/gai-xinh?tags=chan-dai"
                  className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                >
                  Gái xinh chân dài
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Gái Xinh Việt Nam.
          </p>
        </div>
      </div>
    </footer>
  );
}