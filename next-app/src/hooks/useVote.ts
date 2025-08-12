'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface VoteState {
  voteScore: number;
  userVote: number | null;
  isLoading: boolean;
  error: string | null;
  actualScore?: number; // Store the real database score
}

interface UseVoteProps {
  targetType: 'topic' | 'post';
  targetId: string;
  initialVoteScore?: number;
  initialUserVote?: number | null;
}

export function useVote({ 
  targetType, 
  targetId, 
  initialVoteScore = 0, 
  initialUserVote = null 
}: UseVoteProps) {
  const router = useRouter();
  const [state, setState] = useState<VoteState>({
    voteScore: initialVoteScore,
    userVote: initialUserVote,
    isLoading: false,
    error: null
  });

  const vote = useCallback(async (voteType: 1 | -1 | null) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if user is authenticated
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Calculate optimistic update
      const currentVote = state.userVote;
      let optimisticScore = state.voteScore;
      
      if (voteType === null) {
        // Remove vote
        if (currentVote) {
          optimisticScore -= currentVote;
        }
      } else {
        if (currentVote) {
          // Update existing vote
          optimisticScore = optimisticScore - currentVote + voteType;
        } else {
          // New vote
          optimisticScore += voteType;
        }
      }

      // Apply optimistic update
      setState(prev => ({
        ...prev,
        voteScore: optimisticScore,
        userVote: voteType,
        isLoading: true
      }));

      // Send API request
      const response = await fetch('/api/v2/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
          voteType
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Vote failed');
      }

      // Update with API response
      setState(prev => ({
        ...prev,
        voteScore: result.data.voteScore,
        actualScore: result.data.voteScore,
        userVote: result.data.voteType,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      // Revert optimistic update on error
      setState(prev => ({
        ...prev,
        voteScore: initialVoteScore,
        userVote: initialUserVote,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Vote failed'
      }));

      console.error('Vote error:', error);
    }
  }, [targetType, targetId, state.userVote, state.voteScore, initialVoteScore, initialUserVote, router]);

  const upvote = useCallback(() => {
    const newVoteType = state.userVote === 1 ? null : 1;
    vote(newVoteType);
  }, [vote, state.userVote]);

  const downvote = useCallback(() => {
    const newVoteType = state.userVote === -1 ? null : -1;
    vote(newVoteType);
  }, [vote, state.userVote]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    voteScore: state.voteScore,
    userVote: state.userVote,
    isLoading: state.isLoading,
    error: state.error,
    upvote,
    downvote,
    vote,
    clearError
  };
}