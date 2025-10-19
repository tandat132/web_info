import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

// Define a minimal profile shape required by ProfileCard
interface CardPhoto {
  url: string;
  baseFilename: string;
  alt: string;
  width: number;
  height: number;
  dominantColor?: string;
  blurDataURL?: string;
}

interface CardProfile {
  slug: string;
  name: string;
  age: number;
  province: string;
  occupation: string;
  tags: string[];
  photos: CardPhoto[];
  isFeatured: boolean;
}

interface ProfileCardProps {
  profile: CardProfile;
  priority?: boolean;
}

export default function ProfileCard({ profile, priority = false }: ProfileCardProps) {
  const mainPhoto = profile.photos[0];
  
  if (!mainPhoto) return null;

  return (
    <Link href={`/ho-so/${profile.slug}`} className="block group cursor-pointer">
      <div className="relative bg-white/95 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:rotate-1 border border-white/20 group-hover:border-pink-200/50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative aspect-[3/4] overflow-hidden">
          <OptimizedImage
            src={mainPhoto.url}
            baseFilename={mainPhoto.baseFilename}
            alt={`${profile.name}, ${profile.age} tuổi, ${profile.province} - ${mainPhoto.alt}`}
            width={mainPhoto.width}
            height={mainPhoto.height}
            dominantColor={mainPhoto.dominantColor}
            blurDataURL={mainPhoto.blurDataURL}
            priority={priority}
            fill
            size="medium"
            className="group-hover:scale-125 transition-transform duration-1000 ease-out filter group-hover:brightness-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          
          {/* Animated overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Featured Badge with animation */}
          {profile.isFeatured && (
            <div className="absolute top-4 left-4 z-20 transform group-hover:scale-110 transition-transform duration-300">
              <div className="relative">
                <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white text-xs px-4 py-2 rounded-full font-bold shadow-2xl animate-pulse">
                  ✨ HOT
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full blur-md opacity-50 animate-ping" />
              </div>
            </div>
          )}

          {/* Floating info badges */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
            <div className="bg-white/95 backdrop-blur-md text-gray-800 text-sm px-3 py-1.5 rounded-full font-semibold shadow-lg border border-white/50 transform group-hover:scale-105 transition-transform duration-300">
              {profile.age} tuổi
            </div>
            <div className="bg-pink-500/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg transform group-hover:scale-105 transition-transform duration-300 opacity-0 group-hover:opacity-100">
              👆 Click me
            </div>
          </div>
        </div>

        <div className="relative p-6 bg-gradient-to-b from-white/90 to-white/95 backdrop-blur-sm">
          {/* Name with gradient text */}
          <h3 className="font-black text-2xl bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 bg-clip-text text-transparent group-hover:from-pink-600 group-hover:to-purple-600 transition-all duration-500 line-clamp-1 mb-3">
            {profile.name}
          </h3>
          
          <div className="space-y-4">
            {/* Location with animated icon */}
            <div className="flex items-center text-gray-700 group-hover:text-pink-600 transition-colors duration-300">
              <div className="w-5 h-5 mr-3 text-pink-500 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-semibold">{profile.province}</span>
            </div>
            
            {/* Occupation with glassmorphism effect */}
            <div className="flex items-center">
              <span className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm text-blue-700 text-sm px-4 py-2 rounded-full font-semibold border border-blue-200/50 shadow-lg transform group-hover:scale-105 transition-all duration-300 group-hover:shadow-xl">
                <div className="w-4 h-4 mr-2 transform group-hover:rotate-180 transition-transform duration-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V8m8 0V6a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                  </svg>
                </div>
                {profile.occupation}
              </span>
            </div>

            {/* Tags with fixed height and consistent layout */}
            <div className="h-16 flex flex-col justify-start">
              {profile.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 overflow-hidden">
                  {profile.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-gradient-to-r from-pink-500/10 to-rose-500/10 backdrop-blur-sm text-pink-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-pink-200/50 shadow-md transform group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg truncate"
                      style={{ transitionDelay: `${index * 100}ms` }}
                      title={tag}
                    >
                      #{tag}
                    </span>
                  ))}
                  {profile.tags.length > 3 && (
                    <span className="inline-flex items-center text-xs text-gray-800 bg-gray-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium border border-gray-200/50 transform group-hover:scale-105 transition-all duration-300">
                      +{profile.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              {profile.tags.length === 0 && (
                <div className="h-8 flex items-center">
                  <span className="text-xs text-gray-700 italic">Chưa có đặc điểm</span>
                </div>
              )}
            </div>
          </div>

          {/* Animated call-to-action */}
          <div className="mt-6 flex items-center justify-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-xl transform scale-0 group-hover:scale-100 transition-all duration-500 ease-out flex items-center space-x-2">
              <span>Khám phá ngay</span>
              <div className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-bounce transition-all duration-700" style={{ animationDelay: '0.1s' }} />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-bounce transition-all duration-700" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-bounce transition-all duration-700" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </Link>
  );
}