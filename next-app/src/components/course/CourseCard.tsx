import Link from 'next/link';
import { useSwipeGestures, useMobileInteractions } from '@/hooks/useMobileInteractions';
import { useState } from 'react';

interface CourseCardProps {
  title: string;
  image: string;
  progress: number;
  category: string;
  categoryColor: string;
  mentor: {
    name: string;
    avatar: string;
  };
  link: string;
}

const CourseCard = ({ title, image, progress, category, categoryColor, mentor, link }: CourseCardProps) => {
  const { isMobile } = useMobileInteractions();
  const [isLiked, setIsLiked] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const { touchHandlers } = useSwipeGestures((swipeData) => {
    if (swipeData.direction === 'right' && swipeData.distance > 100) {
      // Quick like action on swipe right
      setIsLiked(true);
      setTimeout(() => setIsLiked(false), 2000);
    } else if (swipeData.direction === 'left' && swipeData.distance > 100) {
      // Show quick actions on swipe left
      setShowQuickActions(true);
      setTimeout(() => setShowQuickActions(false), 3000);
    }
  });
  return (
    <div 
      className="relative group touch-manipulation"
      {...(isMobile ? touchHandlers : {})}
    >
      <Link href={link} className="block focus-visible">
        <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 transform hover:hover-lift mobile-card border border-gray-100 dark:border-gray-700">
          {/* Image Container */}
          <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            
            {/* Category Badge */}
            <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${categoryColor} shadow-sm`}>
              {category}
            </div>
            
            {/* Like Button - Mobile optimized with haptic feedback */}
            <button 
              className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 touch-manipulation shadow-sm ${
                isLiked 
                  ? 'bg-red-500 text-white scale-110' 
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
                // Haptic feedback for mobile
                if ('vibrate' in navigator && isMobile) {
                  navigator.vibrate(50);
                }
              }}
            >
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              
              {/* Like animation */}
              {isLiked && (
                <div className="absolute inset-0 animate-ping rounded-full bg-red-500/50" />
              )}
            </button>
            
            {/* Play Overlay for mobile */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base leading-tight">
              {title}
            </h3>
            
            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-medium">{progress}% tamamlandı</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {Math.round((progress / 100) * 10)} / 10
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Mentor Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <img 
                  src={mentor.avatar} 
                  alt={mentor.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full mr-2.5 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{mentor.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mentor</p>
                </div>
              </div>
              
              {/* Continue button for mobile */}
              <div className="flex-shrink-0 ml-2">
                <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Mobile-only quick actions */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between sm:hidden">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Son izleme: 2 gün önce
              </span>
              <button className="text-xs text-green-600 dark:text-green-400 font-medium px-2 py-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors touch-manipulation">
                Devam Et
              </button>
            </div>
            
            {/* Swipe instruction hint - Mobile only */}
            {isMobile && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:hidden">
                <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  ← Hızlı işlemler | Beğen →
                </div>
              </div>
            )}
            
            {/* Quick actions overlay - Triggered by swipe */}
            {showQuickActions && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 animate-fade-in">
                <div className="flex space-x-4">
                  <button 
                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors touch-manipulation"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to bookmarks
                      setShowQuickActions(false);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button 
                    className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors touch-manipulation"
                    onClick={(e) => {
                      e.preventDefault();
                      // Share
                      if (navigator.share && isMobile) {
                        navigator.share({
                          title,
                          text: `${title} - ${mentor.name}`,
                          url: link
                        });
                      }
                      setShowQuickActions(false);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;