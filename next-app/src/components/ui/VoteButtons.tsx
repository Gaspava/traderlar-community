'use client';

import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useVote } from '@/hooks/useVote';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  targetType: 'topic' | 'post';
  targetId: string;
  initialVoteScore?: number;
  initialUserVote?: number | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  showScore?: boolean;
  downvoteOnly?: boolean; // New prop for downvote only mode
}

export default function VoteButtons({
  targetType,
  targetId,
  initialVoteScore = 0,
  initialUserVote = null,
  className = '',
  size = 'md',
  orientation = 'vertical',
  showScore = true,
  downvoteOnly = false
}: VoteButtonsProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const {
    voteScore,
    userVote,
    isLoading,
    error,
    upvote,
    downvote,
    clearError
  } = useVote({
    targetType,
    targetId,
    initialVoteScore,
    initialUserVote
  });

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const formatScore = (score: number) => {
    if (Math.abs(score) >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  const containerClass = cn(
    'flex items-center gap-1',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    className
  );

  const buttonBaseClass = cn(
    'inline-flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size]
  );

  const upvoteClass = cn(
    buttonBaseClass,
    userVote === 1
      ? (isDarkMode 
          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
          : 'bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30')
      : (isDarkMode 
          ? 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10' 
          : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-500/10')
  );

  const downvoteClass = cn(
    buttonBaseClass,
    userVote === -1
      ? (isDarkMode 
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
          : 'bg-red-500/20 text-red-600 hover:bg-red-500/30')
      : (isDarkMode 
          ? 'text-muted-foreground hover:text-red-400 hover:bg-red-500/10' 
          : 'text-gray-500 hover:text-red-600 hover:bg-red-500/10')
  );

  const scoreClass = cn(
    'font-medium tabular-nums transition-colors',
    size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
    voteScore > 0 
      ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
      : voteScore < 0
      ? (isDarkMode ? 'text-red-400' : 'text-red-600')
      : (isDarkMode ? 'text-muted-foreground' : 'text-gray-500')
  );

  return (
    <div className={containerClass}>
      {error && (
        <div className="text-xs text-red-500 mb-1" onClick={clearError}>
          {error}
        </div>
      )}
      
      <button
        onClick={upvote}
        disabled={isLoading}
        className={upvoteClass}
        title={userVote === 1 ? 'Remove upvote' : 'Upvote'}
        aria-label={userVote === 1 ? 'Remove upvote' : 'Upvote'}
      >
        {isLoading && userVote === 1 ? (
          <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
        ) : (
          <ArrowUp className={iconSizeClasses[size]} />
        )}
      </button>

      {showScore && (
        <span className={scoreClass}>
          {formatScore(voteScore)}
        </span>
      )}

      <button
        onClick={downvote}
        disabled={isLoading}
        className={downvoteClass}
        title={userVote === -1 ? 'Remove downvote' : 'Downvote'}
        aria-label={userVote === -1 ? 'Remove downvote' : 'Downvote'}
      >
        {isLoading && userVote === -1 ? (
          <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
        ) : (
          <ArrowDown className={iconSizeClasses[size]} />
        )}
      </button>
    </div>
  );
}