import { useState, useEffect } from 'react';
import { TableOfContentsItem } from '@/types/markdown';

export function useScrollSpy(
  headings: TableOfContentsItem[],
  containerRef: React.RefObject<HTMLElement | null>
) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      if (headingElements.length === 0) return;

      const containerTop = container.getBoundingClientRect().top;
      let currentActive = headingElements[0].id;

      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        // If heading has passed 120px from top of container
        if (rect.top - containerTop <= 120) {
          currentActive = el.id;
        } else {
          break;
        }
      }

      setActiveId(currentActive);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [headings, containerRef]);

  return activeId;
}
