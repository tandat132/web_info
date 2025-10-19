const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Kết nối MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web-info';

// Slug utility functions
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function tagToSlug(tag) {
  return createSlug(tag);
}

function occupationToSlug(occupation) {
  return createSlug(occupation);
}

// Danh sách tên gái Việt Nam
const FEMALE_NAMES = [
  'Nguyễn Thị Lan', 'Trần Thị Hương', 'Lê Thị Mai', 'Phạm Thị Linh', 'Hoàng Thị Nga',
  'Vũ Thị Thảo', 'Đặng Thị Hạnh', 'Bùi Thị Thu', 'Đỗ Thị Hoa', 'Ngô Thị Trang',
  'Dương Thị Yến', 'Lý Thị Xuân', 'Trịnh Thị Diệu', 'Phan Thị Kiều', 'Võ Thị Thanh',
  'Đinh Thị Phương', 'Tạ Thị Minh', 'Lưu Thị Bích', 'Chu Thị Cẩm', 'Mai Thị Dung',
  'Cao Thị Giang', 'Tô Thị Hiền', 'Lại Thị Khánh', 'Ông Thị Lệ', 'Hà Thị Mỹ',
  'Đoàn Thị Nhi', 'Thái Thị Oanh', 'Lâm Thị Phúc', 'Huỳnh Thị Quỳnh', 'Trương Thị Rạng',
  'Lộc Thị Sương', 'Khương Thị Tâm', 'Ưng Thị Uyên', 'Vương Thị Vân', 'Xa Thị Vy',
  'Yên Thị Yến', 'Âu Thị Ánh', 'Ấu Thị Ân', 'Ô Thị Ôn', 'Ư Thị Ưng',
  'Nguyễn Minh Anh', 'Trần Bảo Châu', 'Lê Cẩm Ly', 'Phạm Diệu Linh', 'Hoàng Gia Hân',
  'Vũ Hải Yến', 'Đặng Khánh Linh', 'Bùi Lan Phương', 'Đỗ Minh Thư', 'Ngô Ngọc Anh',
  'Dương Phương Thảo', 'Lý Quỳnh Anh', 'Trịnh Thu Hà', 'Phan Tú Anh', 'Võ Uyên Nhi',
  'Đinh Việt Hà', 'Tạ Xuân Mai', 'Lưu Yến Nhi', 'Chu Ánh Dương', 'Mai Bảo Trâm',
  'Cao Cẩm Tú', 'Tô Diệu Hương', 'Lại Gia Hân', 'Ông Hải Yến', 'Hà Khánh Ly',
  'Đoàn Lan Anh', 'Thái Minh Châu', 'Lâm Ngọc Diệp', 'Huỳnh Phương Anh', 'Trương Quỳnh Chi',
  'Lộc Thu Thảo', 'Khương Tú Quyên', 'Ưng Uyên Phương', 'Vương Việt Hà', 'Xa Xuân Lan',
  'Yên Yến Nhi', 'Âu Ánh Tuyết', 'Ấu Bích Ngọc', 'Ô Cẩm Nhung', 'Ư Diệu Thúy',
  'Nguyễn Thùy Dung', 'Trần Thúy Hằng', 'Lê Thúy Kiều', 'Phạm Thúy Linh', 'Hoàng Thúy Nga',
  'Vũ Thúy Oanh', 'Đặng Thúy Phương', 'Bùi Thúy Quỳnh', 'Đỗ Thúy Trang', 'Ngô Thúy Uyên',
  'Dương Thúy Vân', 'Lý Thúy Xuân', 'Trịnh Thúy Yến', 'Phan Thúy Ánh', 'Võ Thúy Ân',
  'Đinh Thúy Ôn', 'Tạ Thúy Ưng', 'Lưu Thúy Yến', 'Chu Thúy Ánh', 'Mai Thúy Bình',
  'Cao Thúy Cầm', 'Tô Thúy Duyên', 'Lại Thúy Giang', 'Ông Thúy Hạnh', 'Hà Thúy Kiều'
];

// Danh sách tỉnh thành với slug
const PROVINCES = [
  { name: 'Hà Nội', slug: 'ha-noi', region: 'Miền Bắc' },
  { name: 'TP. Hồ Chí Minh', slug: 'ho-chi-minh', region: 'Miền Nam' },
  { name: 'Đà Nẵng', slug: 'da-nang', region: 'Miền Trung' },
  { name: 'Hải Phòng', slug: 'hai-phong', region: 'Miền Bắc' },
  { name: 'Cần Thơ', slug: 'can-tho', region: 'Miền Nam' },
  { name: 'An Giang', slug: 'an-giang', region: 'Miền Nam' },
  { name: 'Bà Rịa - Vũng Tàu', slug: 'ba-ria-vung-tau', region: 'Miền Nam' },
  { name: 'Bắc Giang', slug: 'bac-giang', region: 'Miền Bắc' },
  { name: 'Bắc Kạn', slug: 'bac-kan', region: 'Miền Bắc' },
  { name: 'Bạc Liêu', slug: 'bac-lieu', region: 'Miền Nam' },
  { name: 'Bắc Ninh', slug: 'bac-ninh', region: 'Miền Bắc' },
  { name: 'Bến Tre', slug: 'ben-tre', region: 'Miền Nam' },
  { name: 'Bình Định', slug: 'binh-dinh', region: 'Miền Trung' },
  { name: 'Bình Dương', slug: 'binh-duong', region: 'Miền Nam' },
  { name: 'Bình Phước', slug: 'binh-phuoc', region: 'Miền Nam' },
  { name: 'Bình Thuận', slug: 'binh-thuan', region: 'Miền Trung' },
  { name: 'Cà Mau', slug: 'ca-mau', region: 'Miền Nam' },
  { name: 'Cao Bằng', slug: 'cao-bang', region: 'Miền Bắc' },
  { name: 'Đắk Lắk', slug: 'dak-lak', region: 'Miền Trung' },
  { name: 'Đắk Nông', slug: 'dak-nong', region: 'Miền Trung' },
  { name: 'Điện Biên', slug: 'dien-bien', region: 'Miền Bắc' },
  { name: 'Đồng Nai', slug: 'dong-nai', region: 'Miền Nam' },
  { name: 'Đồng Tháp', slug: 'dong-thap', region: 'Miền Nam' },
  { name: 'Gia Lai', slug: 'gia-lai', region: 'Miền Trung' },
  { name: 'Hà Giang', slug: 'ha-giang', region: 'Miền Bắc' },
  { name: 'Hà Nam', slug: 'ha-nam', region: 'Miền Bắc' },
  { name: 'Hà Tĩnh', slug: 'ha-tinh', region: 'Miền Trung' },
  { name: 'Hải Dương', slug: 'hai-duong', region: 'Miền Bắc' },
  { name: 'Hậu Giang', slug: 'hau-giang', region: 'Miền Nam' },
  { name: 'Hòa Bình', slug: 'hoa-binh', region: 'Miền Bắc' },
  { name: 'Hưng Yên', slug: 'hung-yen', region: 'Miền Bắc' },
  { name: 'Khánh Hòa', slug: 'khanh-hoa', region: 'Miền Trung' },
  { name: 'Kiên Giang', slug: 'kien-giang', region: 'Miền Nam' },
  { name: 'Kon Tum', slug: 'kon-tum', region: 'Miền Trung' },
  { name: 'Lai Châu', slug: 'lai-chau', region: 'Miền Bắc' },
  { name: 'Lâm Đồng', slug: 'lam-dong', region: 'Miền Trung' },
  { name: 'Lạng Sơn', slug: 'lang-son', region: 'Miền Bắc' },
  { name: 'Lào Cai', slug: 'lao-cai', region: 'Miền Bắc' },
  { name: 'Long An', slug: 'long-an', region: 'Miền Nam' },
  { name: 'Nam Định', slug: 'nam-dinh', region: 'Miền Bắc' },
  { name: 'Nghệ An', slug: 'nghe-an', region: 'Miền Trung' },
  { name: 'Ninh Bình', slug: 'ninh-binh', region: 'Miền Bắc' },
  { name: 'Ninh Thuận', slug: 'ninh-thuan', region: 'Miền Trung' },
  { name: 'Phú Thọ', slug: 'phu-tho', region: 'Miền Bắc' },
  { name: 'Phú Yên', slug: 'phu-yen', region: 'Miền Trung' },
  { name: 'Quảng Bình', slug: 'quang-binh', region: 'Miền Trung' },
  { name: 'Quảng Nam', slug: 'quang-nam', region: 'Miền Trung' },
  { name: 'Quảng Ngãi', slug: 'quang-ngai', region: 'Miền Trung' },
  { name: 'Quảng Ninh', slug: 'quang-ninh', region: 'Miền Bắc' },
  { name: 'Quảng Trị', slug: 'quang-tri', region: 'Miền Trung' },
  { name: 'Sóc Trăng', slug: 'soc-trang', region: 'Miền Nam' },
  { name: 'Sơn La', slug: 'son-la', region: 'Miền Bắc' },
  { name: 'Tây Ninh', slug: 'tay-ninh', region: 'Miền Nam' },
  { name: 'Thái Bình', slug: 'thai-binh', region: 'Miền Bắc' },
  { name: 'Thái Nguyên', slug: 'thai-nguyen', region: 'Miền Bắc' },
  { name: 'Thanh Hóa', slug: 'thanh-hoa', region: 'Miền Trung' },
  { name: 'Thừa Thiên Huế', slug: 'thua-thien-hue', region: 'Miền Trung' },
  { name: 'Tiền Giang', slug: 'tien-giang', region: 'Miền Nam' },
  { name: 'Trà Vinh', slug: 'tra-vinh', region: 'Miền Nam' },
  { name: 'Tuyên Quang', slug: 'tuyen-quang', region: 'Miền Bắc' },
  { name: 'Vĩnh Long', slug: 'vinh-long', region: 'Miền Nam' },
  { name: 'Vĩnh Phúc', slug: 'vinh-phuc', region: 'Miền Bắc' },
  { name: 'Yên Bái', slug: 'yen-bai', region: 'Miền Bắc' }
];

const OCCUPATIONS = [
  'Kỹ sư', 'Bác sĩ', 'Giáo viên', 'Nhân viên văn phòng', 'Kinh doanh',
  'Lập trình viên', 'Thiết kế đồ họa', 'Kế toán', 'Luật sư', 'Dược sĩ',
  'Nhân viên ngân hàng', 'Nhân viên bán hàng', 'Thợ may', 'Thợ cắt tóc', 'Đầu bếp',
  'Y tá', 'Sinh viên', 'Người mẫu', 'Diễn viên', 'Ca sĩ',
  'Nhà báo', 'Photographer', 'Makeup artist', 'Stylist', 'Blogger'
];

const TAGS = [
  'Xinh đẹp', 'Dễ thương', 'Năng động', 'Thân thiện', 'Tự tin',
  'Hiền lành', 'Thông minh', 'Chuyên nghiệp', 'Vui vẻ', 'Lạc quan',
  'Gợi cảm', 'Quyến rũ', 'Thanh lịch', 'Sang trọng', 'Tươi trẻ',
  'Da trắng', 'Mắt to', 'Môi đỏ', 'Tóc dài', 'Cao ráo',
  'Thể thao', 'Khỏe mạnh', 'Tích cực', 'Sáng tạo', 'Độc lập'
];

const DESCRIPTIONS = [
  'Tôi là một người vui vẻ và năng động, luôn tìm kiếm những trải nghiệm mới.',
  'Yêu thích du lịch và khám phá những điều thú vị trong cuộc sống.',
  'Là người tích cực, luôn cố gắng học hỏi và phát triển bản thân.',
  'Thích đọc sách, nghe nhạc và dành thời gian bên gia đình.',
  'Yêu thích nấu ăn và thử nghiệm những món ăn mới.',
  'Là người thân thiện, dễ gần và luôn sẵn sàng giúp đỡ người khác.',
  'Thích tập thể thao và duy trì lối sống lành mạnh.',
  'Yêu thích nghệ thuật, điện ảnh và các hoạt động văn hóa.',
  'Tôi là người lắng nghe tốt và luôn sẵn sàng chia sẻ.',
  'Thích khám phá ẩm thực và học hỏi những điều mới mẻ.',
  'Yêu thích thiên nhiên và các hoạt động outdoor.',
  'Là người tích cực, luôn nhìn về phía trước.',
  'Thích làm việc nhóm và kết bạn với mọi người.',
  'Yêu thích công nghệ và luôn cập nhật xu hướng mới.'
];

// Schema Profile
const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  height: { type: Number },
  weight: { type: Number },
  region: { type: String, enum: ['Miền Bắc', 'Miền Trung', 'Miền Nam'], required: true },
  province: { type: String, required: true },
  district: { type: String },
  occupation: { type: String, required: true },
  occupationSlug: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  tagSlugs: [{ type: String }],
  photos: [{
    url: { type: String, required: true },
    baseFilename: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    dominantColor: { type: String },
    caption: { type: String },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    isLCP: { type: Boolean, default: false },
    blurDataURL: { type: String }
  }],
  isFeatured: { type: Boolean, default: false },
  featuredScore: { type: Number, default: 0 },
  metaTitle: { type: String },
  metaDescription: { type: String },
  ogImage: { type: String },
  canonical: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date, default: Date.now }
});

// Hàm tạo slug
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Hàm tạo slug cho profile
function generateProfileSlug(name, age, occupation, province) {
  const parts = [
    createSlug(name),
    `${age}-tuoi`,
    createSlug(occupation),
    province
  ];
  return parts.join('-');
}

// Hàm random
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function resetDatabase() {
  try {
    console.log('🔗 Kết nối MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Xóa tất cả profiles hiện tại
    console.log('🗑️ Xóa database hiện tại...');
    const Profile = mongoose.model('Profile', ProfileSchema);
    await Profile.deleteMany({});
    console.log('✅ Đã xóa tất cả profiles');

    // Lấy danh sách ảnh từ thư mục
    const imagesDir = path.join(__dirname, '../../images');
    const imageFiles = fs.readdirSync(imagesDir).filter(file => 
      file.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
    );
    
    console.log(`📸 Tìm thấy ${imageFiles.length} ảnh trong thư mục images`);

    if (imageFiles.length === 0) {
      throw new Error('Không tìm thấy ảnh nào trong thư mục images');
    }

    // Tạo 100 profiles mới
    console.log('👥 Tạo 100 profiles mới...');
    const profiles = [];

    for (let i = 0; i < 100; i++) {
      const name = getRandomItem(FEMALE_NAMES);
      const age = Math.floor(Math.random() * 15) + 18; // 18-32 tuổi
      const height = Math.floor(Math.random() * 20) + 150; // 150-169 cm
      const weight = Math.floor(Math.random() * 20) + 45; // 45-64 kg
      const province = getRandomItem(PROVINCES);
      const occupation = getRandomItem(OCCUPATIONS);
      const description = getRandomItem(DESCRIPTIONS);
      const tags = getRandomItems(TAGS, Math.floor(Math.random() * 4) + 2); // 2-5 tags
      
      // Chọn ảnh ngẫu nhiên (lặp lại nếu cần)
      const imageFile = imageFiles[i % imageFiles.length];
      const imagePath = `/images/${imageFile}`;
      
      const slug = generateProfileSlug(name, age, occupation, province.slug);
      
      const profile = {
        name,
        slug,
        age,
        height,
        weight,
        region: province.region,
        province: province.name,
        occupation,
        occupationSlug: occupationToSlug(occupation),
        description,
        tags,
        tagSlugs: tags.map(tag => tagToSlug(tag)),
        photos: [{
          url: imagePath,
          baseFilename: imageFile,
          alt: `${name} - ${age} tuổi`,
          width: 400,
          height: 600,
          format: 'jpg',
          bytes: 50000,
          isLCP: true
        }],
        isFeatured: Math.random() < 0.2, // 20% chance featured
        featuredScore: Math.floor(Math.random() * 100),
        status: 'published',
        publishedAt: new Date()
      };

      profiles.push(profile);
    }

    // Lưu vào database
    await Profile.insertMany(profiles);
    console.log('✅ Đã tạo 100 profiles mới');

    // Thống kê
    const stats = await Profile.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Thống kê theo vùng miền:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} profiles`);
    });

    console.log('\n🎉 Hoàn thành! Database đã được reset với 100 profiles mới.');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
resetDatabase();