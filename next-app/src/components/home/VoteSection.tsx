'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VoteSectionProps {
  topicId: string;
  initialVoteScore: number;
  initialUserVote: number | null;
}

export default function VoteSection({ topicId, initialVoteScore, initialUserVote }: VoteSectionProps) {
  const [voteScore, setVoteScore] = useState(initialVoteScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const router = useRouter();

  const handleVote = async (type: 'up' | 'down') => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const voteValue = type === 'up' ? 1 : -1;
      const newVoteType = userVote === voteValue ? null : voteValue;

      const response = await fetch(`/api/forum/topics/${topicId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: newVoteType })
      });

      if (!response.ok) {
        return;
      }

      const { vote_score } = await response.json();
      setVoteScore(vote_score);
      setUserVote(newVoteType);
    } catch (error) {
      // Silent error handling
    }
  };

  return (
    <div className="flex flex-col items-center text-center min-w-0 w-10">
      <button 
        onClick={() => handleVote('up')}
        className={`p-1 rounded transition-colors ${
          userVote === 1
            ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
            : 'text-gray-400 hover:bg-gray-100 hover:text-emerald-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-emerald-400'
        }`}
      >
        <ArrowUp className="w-3 h-3" />
      </button>
      <span className={`text-xs font-bold py-1 ${
        voteScore > 0 ? 'text-emerald-500' : voteScore < 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {Math.abs(voteScore) > 1000 ? `${(Math.abs(voteScore)/1000).toFixed(1)}k` : voteScore}
      </span>
      <button 
        onClick={() => handleVote('down')}
        className={`p-1 rounded transition-colors ${
          userVote === -1
            ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
            : 'text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-red-400'
        }`}
      >
        <ArrowDown className="w-3 h-3" />
      </button>
    </div>
  );
}