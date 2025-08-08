'use client';

import React from 'react';
import { Send } from 'lucide-react';

interface CommentFormProps {
  currentUser: any;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

const CommentForm = React.memo(({ currentUser, onSubmit, submitting }: CommentFormProps) => {
  const [text, setText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onSubmit(e);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-3">
        <img
          src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            rows={3}
          />
          <div className="flex items-center justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
});

CommentForm.displayName = 'CommentForm';

export default CommentForm;