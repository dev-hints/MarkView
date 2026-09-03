import { useEffect, useRef } from 'react';
import { useSearchStore } from '@/stores/searchStore';

export function useInDocSearch(containerRef: React.RefObject<HTMLDivElement | null>) {
  const isInDocSearchOpen = useSearchStore((s) => s.isInDocSearchOpen);
  const inDocSearchQuery = useSearchStore((s) => s.inDocSearchQuery);
  const inDocActiveMatch = useSearchStore((s) => s.inDocActiveMatch);
  const setInDocTotalMatches = useSearchStore((s) => s.setInDocTotalMatches);

  const matchesRef = useRef<HTMLElement[]>([]);

  // Function to remove all highlight marks and restore clean text nodes
  const clearHighlights = (container: HTMLElement) => {
    const marks = container.querySelectorAll('mark.doc-search-match');
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize(); // Combine adjacent text nodes
      }
    });
    matchesRef.current = [];
  };

  // Perform highlighting when query changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const markdownBody = container.querySelector<HTMLElement>('.markdown-body');
    if (!markdownBody) return;

    clearHighlights(markdownBody);

    if (!isInDocSearchOpen || !inDocSearchQuery.trim()) {
      setInDocTotalMatches(0);
      return;
    }

    const query = inDocSearchQuery.toLowerCase();
    const walker = document.createTreeWalker(
      markdownBody,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Avoid highlighting inside buttons or inputs
          const parent = node.parentElement;
          if (
            !parent ||
            parent.closest('button') ||
            parent.closest('input') ||
            parent.closest('style') ||
            parent.closest('script')
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodes: Text[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    const createdMarks: HTMLElement[] = [];

    textNodes.forEach((node) => {
      const text = node.nodeValue || '';
      const textLower = text.toLowerCase();
      const index = textLower.indexOf(query);

      if (index !== -1) {
        const parent = node.parentNode;
        if (!parent) return;

        const fragment = document.createDocumentFragment();
        let remaining = text;
        let remainingLower = textLower;

        while (true) {
          const matchIdx = remainingLower.indexOf(query);
          if (matchIdx === -1) {
            fragment.appendChild(document.createTextNode(remaining));
            break;
          }

          if (matchIdx > 0) {
            fragment.appendChild(
              document.createTextNode(remaining.slice(0, matchIdx))
            );
          }

          const mark = document.createElement('mark');
          mark.className = 'doc-search-match';
          mark.textContent = remaining.slice(matchIdx, matchIdx + query.length);
          fragment.appendChild(mark);
          createdMarks.push(mark);

          remaining = remaining.slice(matchIdx + query.length);
          remainingLower = remainingLower.slice(matchIdx + query.length);
        }

        parent.replaceChild(fragment, node);
      }
    });

    matchesRef.current = createdMarks;
    setInDocTotalMatches(createdMarks.length);

    if (createdMarks.length > 0) {
      const first = createdMarks[0];
      first.classList.add('active-match');
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      clearHighlights(markdownBody);
    };
  }, [isInDocSearchOpen, inDocSearchQuery, containerRef, setInDocTotalMatches]);

  // Update active match when inDocActiveMatch changes
  useEffect(() => {
    const matches = matchesRef.current;
    if (matches.length === 0) return;

    matches.forEach((m, idx) => {
      if (idx === inDocActiveMatch) {
        m.classList.add('active-match');
        m.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        m.classList.remove('active-match');
      }
    });
  }, [inDocActiveMatch]);
}
