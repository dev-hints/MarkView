import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import 'katex/dist/katex.min.css';

import { convertFileSrc } from '@tauri-apps/api/core';
import { CodeBlock } from './CodeBlock';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useSearchStore } from '@/stores/searchStore';
import { isMarkdownPath, resolveRelativePath } from '@/utils/paths';
import { openExternalLink, isTauri } from '@/services/filesystem/fsService';
import { slugify } from '@/utils/slug';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderRawHtml = useSettingsStore((s) => s.settings.renderRawHtml);
  const enableKaTeX = useSettingsStore((s) => s.settings.enableKaTeX);
  const openExternalLinksInBrowser = useSettingsStore(
    (s) => s.settings.openExternalLinksInBrowser
  );

  const currentPath = useDocumentStore((s) => s.currentPath);
  const openDocument = useDocumentStore((s) => s.openDocument);
  const inDocQuery = useSearchStore((s) => s.inDocSearchQuery);

  const remarkPlugins = useMemo(() => {
    const plugins: any[] = [remarkGfm];
    if (enableKaTeX) {
      plugins.push(remarkMath);
    }
    return plugins;
  }, [enableKaTeX]);

  const rehypePlugins = useMemo(() => {
    const plugins: any[] = [rehypeSlug];
    if (enableKaTeX) {
      plugins.push(rehypeKatex);
    }
    if (renderRawHtml) {
      plugins.push(rehypeRaw);
      plugins.push([
        rehypeSanitize,
        {
          ...defaultSchema,
          attributes: {
            ...defaultSchema.attributes,
            code: [...(defaultSchema.attributes?.code || []), 'className'],
            span: [...(defaultSchema.attributes?.span || []), 'className', 'style'],
            div: [...(defaultSchema.attributes?.div || []), 'className', 'style'],
            h1: ['id'],
            h2: ['id'],
            h3: ['id'],
            h4: ['id'],
            h5: ['id'],
            h6: ['id'],
          },
        },
      ]);
    }
    return plugins;
  }, [enableKaTeX, renderRawHtml]);

  const handleLinkClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    href?: string
  ) => {
    if (!href) return;

    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
      if (openExternalLinksInBrowser) {
        e.preventDefault();
        await openExternalLink(href);
      }
      return;
    }

    // Relative file link
    if (currentPath && isMarkdownPath(href)) {
      e.preventDefault();
      const resolved = resolveRelativePath(currentPath, href);
      await openDocument(resolved);
    }
  };

  const createHeading = (level: number, Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    return ({ children, id, ...props }: any) => {
      const textContent = React.Children.toArray(children).join('');
      const headingId = id || slugify(textContent);

      return (
        <Tag id={headingId} {...props}>
          <a
            href={`#${headingId}`}
            className="heading-anchor"
            aria-label={`Link to ${textContent}`}
          >
            #
          </a>
          {children}
        </Tag>
      );
    };
  };

  const components = useMemo(
    () => ({
      code({ node, inline, className, children, ...props }: any) {
        if (!inline && (className || String(children).includes('\n'))) {
          return (
            <CodeBlock className={className} node={node} {...props}>
              {children}
            </CodeBlock>
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      a({ href, children, ...props }: any) {
        return (
          <a
            href={href}
            onClick={(e) => handleLinkClick(e, href)}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            {...props}
          >
            {children}
          </a>
        );
      },
      img({ src, alt, ...props }: any) {
        // Resolve relative images relative to markdown file if possible
        let resolvedSrc = src;
        if (
          src &&
          currentPath &&
          !src.startsWith('http://') &&
          !src.startsWith('https://') &&
          !src.startsWith('data:') &&
          !src.startsWith('blob:') &&
          !src.startsWith('asset:')
        ) {
          const absoluteOrResolved = resolveRelativePath(currentPath, src);
          if (isTauri()) {
            try {
              resolvedSrc = convertFileSrc(absoluteOrResolved);
            } catch {
              resolvedSrc = absoluteOrResolved;
            }
          } else {
            resolvedSrc = absoluteOrResolved;
          }
        }

        return (
          <img
            src={resolvedSrc}
            alt={alt || ''}
            loading="lazy"
            onError={(e) => {
              // Graceful image error placeholder
              const target = e.currentTarget;
              target.onerror = null;
              target.alt = `Failed to load image: ${alt || src}`;
              target.classList.add('opacity-40', 'border-red-500/40');
            }}
            {...props}
          />
        );
      },
      h1: createHeading(1, 'h1'),
      h2: createHeading(2, 'h2'),
      h3: createHeading(3, 'h3'),
      h4: createHeading(4, 'h4'),
      h5: createHeading(5, 'h5'),
      h6: createHeading(6, 'h6'),
    }),
    [currentPath, openExternalLinksInBrowser]
  );

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
