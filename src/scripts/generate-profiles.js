const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Import slug utility functions and constants
const { tagToSlug, occupationToSlug } = require('./utils');
const { PROVINCES } = require('./constants');

// Dữ liệu mẫu cho Việt Nam
const VIETNAMESE_NAMES = {
  male: [
    'Nguyễn Văn An', 'Trần Minh Đức', 'Lê Hoàng Nam', 'Phạm Quốc Huy', 'Hoàng Minh Tuấn',
    'Vũ Đình Khoa', 'Đặng Thanh Long', 'Bùi Văn Hùng', 'Ngô Minh Quân', 'Dương Văn Thành',
    'Lý Hoàng Phúc', 'Trương Minh Tâm', 'Phan Văn Đức', 'Võ Thanh Tùng', 'Đinh Quang Minh',
    'Lại Văn Hải', 'Tô Minh Khang', 'Đỗ Thanh Bình', 'Chu Văn Lâm', 'Mai Hoàng Anh',
    'Cao Minh Đạt', 'Lưu Văn Phong', 'Hồ Thanh Sơn', 'Kiều Minh Hưng', 'Ông Văn Dũng',
    'Nguyễn Thanh Tùng', 'Trần Văn Hùng', 'Lê Minh Quân', 'Phạm Đình Nam', 'Hoàng Văn Đức'
  ],
  female: [
    'Nguyễn Thị Lan', 'Trần Thị Hoa', 'Lê Thị Mai', 'Phạm Thị Linh', 'Hoàng Thị Nga',
    'Vũ Thị Hương', 'Đặng Thị Thảo', 'Bùi Thị Yến', 'Ngô Thị Trang', 'Dương Thị Hạnh',
    'Lý Thị Phương', 'Trương Thị Loan', 'Phan Thị Dung', 'Võ Thị Xuân', 'Đinh Thị Minh',
    'Lại Thị Thu', 'Tô Thị Hằng', 'Đỗ Thị Bích', 'Chu Thị Vân', 'Mai Thị Ánh',
    'Cao Thị Diệu', 'Lưu Thị Ngọc', 'Hồ Thị Kim', 'Kiều Thị Thanh', 'Ông Thị Hồng',
    'Nguyễn Thị Hương', 'Trần Thị Thúy', 'Lê Thị Hạnh', 'Phạm Thị Nga', 'Hoàng Thị Lan'
  ]
};

// Use province names from constants
const PROVINCE_NAMES = PROVINCES.map(p => p.name);

const OCCUPATIONS = [
  'Kỹ sư', 'Bác sĩ', 'Giáo viên', 'Nhân viên văn phòng', 'Kinh doanh',
  'Lập trình viên', 'Thiết kế đồ họa', 'Kế toán', 'Luật sư', 'Dược sĩ',
  'Nhân viên ngân hàng', 'Nhân viên bán hàng', 'Thợ may', 'Thợ cắt tóc', 'Đầu bếp',
  'Tài xế', 'Nhân viên y tế', 'Nhân viên marketing', 'Nhân viên IT', 'Công nhân',
  'Nông dân', 'Sinh viên', 'Freelancer', 'Nhân viên khách sạn', 'Hướng dẫn viên du lịch',
  'Kiến trúc sư', 'Nhà báo', 'Nhiếp ảnh gia', 'Nghệ sĩ', 'Vận động viên'
];

const TAGS = [
  'Thân thiện', 'Hòa đồng', 'Yêu thích du lịch', 'Thích đọc sách', 'Yêu âm nhạc',
  'Thích nấu ăn', 'Yêu thể thao', 'Thích xem phim', 'Yêu thiên nhiên', 'Thích chụp ảnh',
  'Năng động', 'Tích cực', 'Vui vẻ', 'Chân thành', 'Tâm lý',
  'Có trách nhiệm', 'Độc lập', 'Sáng tạo', 'Kiên nhẫn', 'Lạc quan',
  'Thông minh', 'Dễ thương', 'Hài hước', 'Ấm áp', 'Tin cậy'
];

const DESCRIPTIONS = [
  'Tôi là một người vui vẻ, thích giao lưu và làm quen với mọi người.',
  'Yêu thích cuộc sống và luôn tìm kiếm những điều tích cực.',
  'Thích du lịch, khám phá những vùng đất mới và trải nghiệm văn hóa.',
  'Là người có trách nhiệm, chân thành trong mọi mối quan hệ.',
  'Yêu thích âm nhạc, thể thao và các hoạt động ngoài trời.',
  'Tôi tin vào tình yêu đích thực và mong muốn tìm được người phù hợp.',
  'Thích nấu ăn, đọc sách và dành thời gian cho gia đình.',
  'Là người năng động, thích thử thách bản thân với những điều mới.',
  'Yêu thích nghệ thuật, điện ảnh và các hoạt động văn hóa.',
  'Tôi là người lắng nghe tốt và luôn sẵn sàng chia sẻ.',
  'Thích khám phá ẩm thực và học hỏi những điều mới mẻ.',
  'Yêu thích thiên nhiên và các hoạt động outdoor.',
  'Là người tích cực, luôn nhìn về phía trước.',
  'Thích làm việc nhóm và kết bạn với mọi người.',
  'Yêu thích công nghệ và luôn cập nhật xu hướng mới.'
];

// Hàm tạo slug từ tên
function createSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Function to get region from province name
function getRegionFromProvince(provinceName) {
  const province = PROVINCES.find(p => p.name === provinceName);
  return province ? province.region : 'Miền Bắc'; // Default to Miền Bắc if not found
}

// Hàm random
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTags(count = 3) {
  const shuffled = [...TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Xử lý ảnh và tạo các kích thước khác nhau
async function processImage(inputPath, outputBasename) {
  const sizes = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 }
  };

  const results = [];
  
  for (const [sizeName, dimensions] of Object.entries(sizes)) {
    const outputFilename = `${outputBasename}-${sizeName}.webp`;
    const outputPath = path.join(__dirname, '../../public/uploads/images', outputFilename);
    
    await sharp(inputPath)
      .resize(dimensions.width, dimensions.height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    results.push({
      size: sizeName,
      filename: outputFilename,
      width: dimensions.width,
      height: dimensions.height
    });
  }
  
  return results;
}

// Copy và xử lý ảnh từ thư mục test
async function processTestImages() {
  const testImagesDir = path.join(__dirname, '../../images');
  const uploadsDir = path.join(__dirname, '../../public/uploads/images');
  
  // Tạo thư mục uploads nếu chưa có
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const testImages = fs.readdirSync(testImagesDir).filter(file => 
    file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')
  );
  
  const processedImages = [];
  
  for (let i = 0; i < testImages.length; i++) {
    const testImage = testImages[i];
    const inputPath = path.join(testImagesDir, testImage);
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const outputBasename = `profile-${i + 1}-${timestamp}-${randomId}`;
    
    console.log(`Đang xử lý ảnh ${i + 1}/${testImages.length}: ${testImage}`);
    
    try {
      const sizes = await processImage(inputPath, outputBasename);
      
      // Lấy thông tin ảnh medium để lưu vào database
      const mediumSize = sizes.find(s => s.size === 'medium');
      processedImages.push({
        url: `/api/images/${mediumSize.filename}`,
        baseFilename: outputBasename,
        alt: 'Profile photo',
        width: mediumSize.width,
        height: mediumSize.height,
        dominantColor: '#f0f0f0',
        blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      });
    } catch (error) {
      console.error(`Lỗi xử lý ảnh ${testImage}:`, error);
    }
  }
  
  return processedImages;
}

// Tạo profile ngẫu nhiên
function generateRandomProfile(availableImages) {
  const isGenderMale = Math.random() > 0.5;
  const gender = isGenderMale ? 'male' : 'female';
  const name = getRandomItem(VIETNAMESE_NAMES[gender]);
  const age = getRandomNumber(18, 45);
  const province = getRandomItem(PROVINCE_NAMES);
  const occupation = getRandomItem(OCCUPATIONS);
  const height = getRandomNumber(150, 185);
  const weight = getRandomNumber(45, 85);
  const description = getRandomItem(DESCRIPTIONS);
  const tags = getRandomTags(getRandomNumber(2, 5));
  const isFeatured = Math.random() > 0.8; // 20% chance to be featured
  
  // Random ảnh
  const photos = [];
  if (availableImages.length > 0) {
    const randomImage = getRandomItem(availableImages);
    photos.push(randomImage);
  }
  
  // Generate slugs for occupation and tags
  const occupationSlug = occupationToSlug(occupation);
  const tagSlugs = tags.map(tag => tagToSlug(tag));
  
  // Get region from province
  const region = getRegionFromProvince(province);

  return {
    name,
    age,
    gender,
    province,
    region,
    occupation,
    occupationSlug,
    height,
    weight,
    description,
    tags,
    tagSlugs,
    photos,
    isFeatured,
    status: 'published',
    slug: createSlug(name) + '-' + age + '-tuoi-' + createSlug(province),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Hàm chính
async function generateProfiles() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/web-info';
  const client = new MongoClient(uri);
  
  try {
    console.log('Bắt đầu xử lý ảnh...');
    const availableImages = await processTestImages();
    console.log(`Đã xử lý ${availableImages.length} ảnh`);
    
    await client.connect();
    console.log('Đã kết nối MongoDB');
    
    const db = client.db();
    const collection = db.collection('profiles');
    
    // Xóa tất cả profiles cũ (nếu muốn)
    // await collection.deleteMany({});
    // console.log('Đã xóa tất cả profiles cũ');
    
    // Tạo 100 profiles
    const profiles = [];
    for (let i = 0; i < 100; i++) {
      const profile = generateRandomProfile(availableImages);
      profiles.push(profile);
      
      if ((i + 1) % 10 === 0) {
        console.log(`Đã tạo ${i + 1}/100 profiles`);
      }
    }
    
    // Insert vào database
    const result = await collection.insertMany(profiles);
    console.log(`Đã tạo thành công ${result.insertedCount} hồ sơ`);
    
    // Tạo index cho slug nếu chưa có
    try {
      await collection.createIndex({ slug: 1 }, { unique: true });
      console.log('Đã tạo index cho slug');
    } catch (error) {
      console.log('Index cho slug đã tồn tại');
    }
    
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await client.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy script
if (require.main === module) {
  generateProfiles();
}

module.exports = { generateProfiles };