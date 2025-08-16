'use client';

import { useMemo } from 'react';
import StrategyCard from './StrategyCard';

interface ForumContentRendererProps {
  content: string;
  className?: string;
}

interface ContentPart {
  type: 'text' | 'strategy';
  content: string;
  strategyId?: string;
  strategyName?: string;
}

export default function ForumContentRenderer({ content, className = '' }: ForumContentRendererProps) {
  const parsedContent = useMemo(() => {
    // @strateji:ID:Name formatındaki mention'ları parse et
    const mentionRegex = /@strateji:([^:]+):([^@\s]+)/g;
    const parts: ContentPart[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Mention'dan önceki text'i ekle
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore) {
          parts.push({ type: 'text', content: textBefore });
        }
      }

      // Strateji mention'ını ekle
      parts.push({
        type: 'strategy',
        content: match[0],
        strategyId: match[1],
        strategyName: match[2]
      });

      lastIndex = match.index + match[0].length;
    }

    // Kalan text'i ekle (eğer hiç mention yoksa tüm content buraya girer)
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    // Eğer hiç mention yoksa ve parts boşsa, tüm content'i text olarak ekle
    if (parts.length === 0) {
      parts.push({ type: 'text', content });
    }

    return parts;
  }, [content]);

  return (
    <div className={className}>
      <div className="space-y-2">
        {parsedContent.map((part, index) => (
          <span key={index}>
            {part.type === 'text' ? (
              <span className="text-foreground whitespace-pre-wrap">{part.content}</span>
            ) : (
              <div className="my-2">
                <StrategyCard 
                  strategyId={part.strategyId!}
                  className="w-full sm:max-w-sm"
                />
              </div>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}