'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  ChevronDown,
  ChevronUp,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  Flag
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CommentWithUser } from '@/lib/supabase/types';
import CommentInput from './CommentInput';

interface CommentSectionProps {
  articleId: string;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ articleId, onCommentCountChange }: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [totalCommentCount, setTotalCommentCount] = useState(0);

  useEffect(() => {
    checkCurrentUser();
    fetchComments();
  }, [articleId]);

  const checkCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }

      const commentsData = data.comments || [];
      setComments(commentsData);
      
      // Calculate total comment count (root comments + all replies)
      const totalCount = commentsData.reduce((count: number, comment: CommentWithUser) => {
        return count + 1 + (comment.replies?.length || 0);
      }, 0);
      
      setTotalCommentCount(totalCount);
      onCommentCountChange?.(totalCount);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = useCallback(async (commentText: string, parentId?: string, parentUsername?: string) => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    if (!commentText.trim()) return;
    
    // Add mention if replying and not already included
    let finalText = commentText;
    if (parentId && parentUsername && !commentText.includes(`@${parentUsername}`)) {
      finalText = `@${parentUsername} ${commentText}`;
    }
    
    try {
      // Extract mentioned username from comment
      let mentionedUserId = null;
      let parentComment = null;
      let rootParentId = null;
      
      const actualParentId = parentId || replyTo;
      
      if (actualParentId) {
        // Find parent comment (could be root or reply)
        const findComment = (comments: CommentWithUser[], id: string): CommentWithUser | null => {
          for (const comment of comments) {
            if (comment.id === id) return comment;
            if (comment.replies) {
              const found = comment.replies.find(reply => reply.id === id);
              if (found) return found;
            }
          }
          return null;
        };
        
        parentComment = findComment(comments, actualParentId);
        if (parentComment) {
          mentionedUserId = parentComment.user_id;
          
          // If replying to a reply, use the root comment as parent
          // If replying to a root comment, use that comment as parent
          rootParentId = parentComment.parent_id ? 
            comments.find(c => c.replies?.some(r => r.id === actualParentId))?.id : 
            actualParentId;
        }
      }

      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: finalText,
          parent_id: rootParentId || actualParentId,
          mentioned_user_id: mentionedUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      // Add the new comment to the state without refetching everything
      const newCommentData = data.comment;
      
      if (rootParentId || actualParentId) {
        // Add to replies of the root comment
        const targetRootId = rootParentId || actualParentId;
        setComments(prev => {
          return prev.map(comment => {
            if (comment.id === targetRootId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newCommentData],
                reply_count: comment.reply_count + 1
              };
            }
            return comment;
          });
        });
        
        // Auto-expand the root comment to show the new reply
        setExpandedComments(prev => new Set([...prev, targetRootId]));
      } else {
        // Add as new root comment
        setComments(prev => [newCommentData, ...prev]);
      }
      
      if (parentId) {
        setReplyTo(null);
      }
      
      // Update comment count
      const newCount = totalCommentCount + 1;
      setTotalCommentCount(newCount);
      onCommentCountChange?.(newCount);
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Yorum gönderilirken hata oluştu');
      throw error;
    }
  }, [currentUser, router, articleId, comments, onCommentCountChange]);

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            is_liked: !isLiked,
            like_count: isLiked ? c.like_count - 1 : c.like_count + 1,
          };
        }
        // Also check replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => {
              if (r.id === commentId) {
                return {
                  ...r,
                  is_liked: !isLiked,
                  like_count: isLiked ? r.like_count - 1 : r.like_count + 1,
                };
              }
              return r;
            })
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove from local state with proper tree structure handling
      setComments(prev => {
        const removeComment = (comments: CommentWithUser[]): CommentWithUser[] => {
          return comments
            .filter(c => c.id !== commentId)
            .map(c => ({
              ...c,
              replies: c.replies ? removeComment(c.replies) : [],
              reply_count: c.replies ? c.replies.filter(r => r.id !== commentId).length : 0
            }));
        };
        return removeComment(prev);
      });
      
      // Update comment count
      const newCount = totalCommentCount - 1;
      setTotalCommentCount(newCount);
      onCommentCountChange?.(newCount);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Yorum silinirken hata oluştu');
    }
  };

  const CommentItem = React.memo(({ comment, isReply = false }: { comment: CommentWithUser; isReply?: boolean }) => {
    const [showMenu, setShowMenu] = useState(false);
    const isOwner = currentUser?.id === comment.user_id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-3">
          <img
            src={comment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_username}`}
            alt={comment.user_name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          
          <div className="flex-1">
            <div className="bg-card/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="font-medium text-foreground text-sm">{comment.user_name}</span>
                  <span className="text-muted-foreground text-xs ml-2">@{comment.user_username}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  {comment.is_edited && (
                    <span className="text-muted-foreground text-xs ml-2">(düzenlendi)</span>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-1 w-48 bg-card rounded-lg shadow-xl border border-border py-1 z-10"
                      >
                        {isOwner && (
                          <>
                            <button 
                              onClick={() => {
                                // TODO: Implement edit functionality
                                alert('Düzenleme özelliği henüz hazır değil');
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Edit className="w-4 h-4" />
                              Düzenle
                            </button>
                            <button 
                              onClick={() => {
                                setShowMenu(false);
                                handleDeleteComment(comment.id);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </button>
                          </>
                        )}
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white">
                          <Flag className="w-4 h-4" />
                          Bildir
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <p className="body-text text-sm text-card-foreground mt-1">
                {comment.mentioned_username && (
                  <span className="text-green-500 font-medium">@{comment.mentioned_username} </span>
                )}
                {comment.content}
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <motion.button 
                onClick={() => handleLikeComment(comment.id, comment.is_liked)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  comment.is_liked 
                    ? 'text-red-500 hover:text-red-400' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={comment.is_liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart className={`w-3 h-3 transition-all duration-200 ${
                    comment.is_liked ? 'fill-current text-red-500' : ''
                  }`} />
                </motion.div>
                <motion.span
                  key={`${comment.id}-${comment.like_count}`}
                  className="metric-value"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.15 }}
                >
                  {comment.like_count}
                </motion.span>
              </motion.button>
              
              <button
                onClick={() => {
                  if (!currentUser) {
                    router.push('/auth/login');
                    return;
                  }
                  setReplyTo(replyTo === comment.id ? null : comment.id);
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="w-3 h-3" />
                {replyTo === comment.id ? 'İptal' : 'Yanıtla'}
              </button>
              
              {!isReply && comment.reply_count > 0 && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400 transition-colors"
                >
                  {expandedComments.has(comment.id) ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Yanıtları gizle
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      <span className="metric-value">{comment.reply_count}</span> yanıtı göster
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* Reply Form */}
            {replyTo === comment.id && currentUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <CommentInput
                  placeholder="Yanıtınızı yazın..."
                  onSubmit={(text) => handleSubmitComment(text, comment.id, comment.user_username)}
                  currentUser={currentUser}
                  rows={2}
                  autoFocus
                  onCancel={() => setReplyTo(null)}
                  size="small"
                />
              </motion.div>
            )}
            
            {/* Replies */}
            <AnimatePresence>
              {expandedComments.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4"
                >
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="ml-8">
                      <CommentItem comment={reply} isReply />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.comment.id === nextProps.comment.id &&
      prevProps.comment.like_count === nextProps.comment.like_count &&
      prevProps.comment.is_liked === nextProps.comment.is_liked &&
      prevProps.comment.reply_count === nextProps.comment.reply_count &&
      prevProps.isReply === nextProps.isReply &&
      JSON.stringify(prevProps.comment.replies) === JSON.stringify(nextProps.comment.replies)
    );
  });

  if (loading) {
    return (
      <div className="px-8 py-6 space-y-4">
        <h3 className="h3 text-foreground mb-6">Yorumlar</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="h-3 bg-muted/80 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted/80 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <h3 className="h3 text-foreground mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Yorumlar ({totalCommentCount})
      </h3>

      {/* Comment Form */}
      {currentUser ? (
        <div className="mb-6">
          <CommentInput
            placeholder="Yorumunuzu yazın..."
            onSubmit={(text) => handleSubmitComment(text)}
            currentUser={currentUser}
            rows={3}
          />
        </div>
      ) : (
        <div className="bg-card/50 rounded-xl p-4 text-center mb-6">
          <p className="text-muted-foreground mb-3 text-sm">Yorum yapmak için giriş yapmanız gerekiyor.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm btn-text"
          >
            Giriş Yap
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-5">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 text-sm">
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </p>
        ) : (
          <React.Fragment>
            {comments.filter(c => !c.parent_id).map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}