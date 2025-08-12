import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onNewTrade?: () => void;
  onQuickLong?: () => void;
  onQuickShort?: () => void;
  onTakeProfit?: () => void;
  onStopLoss?: () => void;
  onManualClose?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export function useKeyboardShortcuts({
  onNewTrade,
  onQuickLong,
  onQuickShort,
  onTakeProfit,
  onStopLoss,
  onManualClose,
  onSave,
  onCancel,
}: KeyboardShortcutsOptions) {
  
  const handleKeydown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    // Handle Ctrl/Cmd + key combinations
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault();
          onNewTrade?.();
          break;
        case 'l':
          event.preventDefault();
          onQuickLong?.();
          break;
        case 's':
          // Don't prevent default for Ctrl+S (save page)
          if (!event.shiftKey) {
            event.preventDefault();
            onSave?.();
            return;
          }
          // Ctrl+Shift+S for short
          event.preventDefault();
          onQuickShort?.();
          break;
        case 't':
          event.preventDefault();
          onTakeProfit?.();
          break;
        case 'x':
          event.preventDefault();
          onStopLoss?.();
          break;
        case 'm':
          event.preventDefault();
          onManualClose?.();
          break;
      }
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel?.();
    }
  }, [
    onNewTrade,
    onQuickLong,
    onQuickShort,
    onTakeProfit,
    onStopLoss,
    onManualClose,
    onSave,
    onCancel,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  return {
    shortcuts: [
      { key: 'Ctrl+N', description: 'Yeni işlem ekle', action: onNewTrade },
      { key: 'Ctrl+L', description: 'Hızlı long pozisyon', action: onQuickLong },
      { key: 'Ctrl+Shift+S', description: 'Hızlı short pozisyon', action: onQuickShort },
      { key: 'Ctrl+T', description: 'Take profit', action: onTakeProfit },
      { key: 'Ctrl+X', description: 'Stop loss', action: onStopLoss },
      { key: 'Ctrl+M', description: 'Manuel kapat', action: onManualClose },
      { key: 'Ctrl+S', description: 'Kaydet', action: onSave },
      { key: 'Esc', description: 'İptal', action: onCancel },
    ].filter(shortcut => shortcut.action !== undefined)
  };
}