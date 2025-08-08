'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentInputProps {
  placeholder?: string;
  onSubmit: (text: string) => Promise<void>;
  currentUser: any;
  rows?: number;
  autoFocus?: boolean;
  initialValue?: string;
  onCancel?: () => void;
  size?: 'normal' | 'small';
}

export default function CommentInput({ 
  placeholder = "Yorumunuzu yazın...", 
  onSubmit, 
  currentUser,
  rows = 3,
  autoFocus = false,
  initialValue = '',
  onCancel,
  size = 'normal'
}: CommentInputProps) {
  const [text, setText] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Focus and place cursor at the end when autoFocus is true
  React.useEffect(() => {
    if (autoFocus && initialValue) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(initialValue.length, initialValue.length);
      }
    }
  }, [autoFocus, initialValue]);

  const isSmall = size === 'small';

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-3">
        <img
          src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`}
          alt={currentUser.name}
          className={`rounded-full ${isSmall ? 'w-8 h-8' : 'w-10 h-10'}`}
        />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none ${
              isSmall ? 'px-3 py-2 text-sm' : 'px-4 py-3'
            }`}
            rows={rows}
            autoFocus={autoFocus}
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                İptal
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className={`flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isSmall ? 'px-3 py-1 text-sm' : 'px-4 py-2'
              }`}
            >
              <Send className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
              {submitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}