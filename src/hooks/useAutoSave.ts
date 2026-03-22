import { useCallback, useEffect, useRef } from 'react';

export function useAutoSave(
  content: string,
  onSave: (content: string) => Promise<void>,
  delay: number = 500
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef(content);
  const isMountedRef = useRef(false);

  latestContentRef.current = content;

  const save = useCallback(async () => {
    await onSave(latestContentRef.current);
  }, [onSave]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, save, delay]);

  return { saveNow: save };
}
