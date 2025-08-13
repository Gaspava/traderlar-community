'use client';

interface TopicSkeletonProps {
  isDarkMode: boolean;
}

export default function TopicSkeleton({ isDarkMode }: TopicSkeletonProps) {
  return (
    <div className={`rounded-lg border transition-colors duration-200 animate-pulse ${
      isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
    }`}>
      <div className="flex p-3">
        <div className="flex flex-col items-center w-10 mr-3">
          <div className={`w-6 h-6 rounded ${
            isDarkMode ? 'bg-background' : 'bg-gray-200'
          }`}></div>
          <div className={`w-8 h-3 rounded mt-1 ${
            isDarkMode ? 'bg-background' : 'bg-gray-200'
          }`}></div>
          <div className={`w-6 h-6 rounded mt-1 ${
            isDarkMode ? 'bg-background' : 'bg-gray-200'
          }`}></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 rounded-full ${
              isDarkMode ? 'bg-background' : 'bg-gray-200'
            }`}></div>
            <div className={`h-3 rounded w-24 ${
              isDarkMode ? 'bg-background' : 'bg-gray-200'
            }`}></div>
            <div className={`h-3 rounded w-32 ${
              isDarkMode ? 'bg-background' : 'bg-gray-200'
            }`}></div>
          </div>
          
          <div className={`h-4 rounded w-3/4 mb-2 ${
            isDarkMode ? 'bg-background' : 'bg-gray-200'
          }`}></div>
          
          <div className={`h-3 rounded w-full mb-1 ${
            isDarkMode ? 'bg-background' : 'bg-gray-200'
          }`}></div>
          <div className={`h-3 rounded w-2/3 mb-3 ${
            isDarkMode ? 'bg-background' : 'bg-gray-200'
          }`}></div>
          
          <div className="flex items-center gap-4">
            <div className={`h-6 rounded w-20 ${
              isDarkMode ? 'bg-background' : 'bg-gray-200'
            }`}></div>
            <div className={`h-6 rounded w-16 ${
              isDarkMode ? 'bg-background' : 'bg-gray-200'
            }`}></div>
            <div className={`h-6 rounded w-6 ${
              isDarkMode ? 'bg-background' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}