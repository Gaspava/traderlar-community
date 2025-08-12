'use client';

import { useState, useEffect, useRef } from 'react';

export interface MentionTrigger {
  type: 'strategy';
  position: number;
  query: string;
}

export function useMentionDetection(text: string, textareaRef: React.RefObject<HTMLTextAreaElement>) {
  const [mentionTrigger, setMentionTrigger] = useState<MentionTrigger | null>(null);

  useEffect(() => {
    const checkMention = () => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      
      // @strateji pattern'ini ara
      const beforeCursor = text.slice(0, cursorPosition);
      const mentionMatch = beforeCursor.match(/@strateji(\s+\w*)?$/);

      if (mentionMatch) {
        const mentionStart = beforeCursor.length - mentionMatch[0].length;
        const query = mentionMatch[1]?.trim() || '';
        
        setMentionTrigger({
          type: 'strategy',
          position: mentionStart,
          query
        });
      } else {
        setMentionTrigger(null);
      }
    };

    // İlk kontrolü yap
    checkMention();

    // Textarea'ya event listener ekle
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('input', checkMention);
      textarea.addEventListener('keyup', checkMention);
      textarea.addEventListener('click', checkMention);
      
      return () => {
        textarea.removeEventListener('input', checkMention);
        textarea.removeEventListener('keyup', checkMention);  
        textarea.removeEventListener('click', checkMention);
      };
    }
  }, [text, textareaRef]);

  const closeMention = () => {
    setMentionTrigger(null);
  };

  const insertMention = (strategyId: string, strategyName: string) => {
    if (!textareaRef.current || !mentionTrigger) return;

    const textarea = textareaRef.current;
    const beforeMention = text.slice(0, mentionTrigger.position);
    const afterCursor = text.slice(textarea.selectionStart);
    
    // @strateji:ID:Name formatında embed et
    const mentionText = `@strateji:${strategyId}:${strategyName}`;
    const newText = beforeMention + mentionText + ' ' + afterCursor;
    
    // Textarea'yı güncelle
    textarea.value = newText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Cursor'ı mention sonrasına taşı
    const newCursorPosition = beforeMention.length + mentionText.length + 1;
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    textarea.focus();
    
    setMentionTrigger(null);
  };

  return {
    mentionTrigger,
    closeMention,
    insertMention
  };
}