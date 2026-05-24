import classNames from 'classnames';
import React, { forwardRef, memo, useMemo } from 'react';
import { parseMarkdown } from './parser';
import { renderBlocks, type RenderOptions } from './renderer';
import '../eui-base.scss';
import './markdown.scss';

export interface MarkdownPreviewProps {
    value: string;
    className?: string;
    openLinksInNewTab?: boolean;
    sanitizeUrl?: (url: string) => string | null;
    imageResolver?: (src: string) => string;
    emptyFallback?: React.ReactNode;
}

const MarkdownPreviewInner = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
    ({ value, className, openLinksInNewTab = true, sanitizeUrl, imageResolver, emptyFallback }, ref) => {
        const options = useMemo<RenderOptions>(
            () => ({ openLinksInNewTab, sanitizeUrl, imageResolver }),
            [openLinksInNewTab, sanitizeUrl, imageResolver],
        );
        const content = useMemo(() => {
            if (!value || value.trim() === '') return null;
            try {
                const parsed = parseMarkdown(value);
                return renderBlocks(parsed.blocks, options);
            } catch {
                return null;
            }
        }, [value, options]);

        if (content === null && emptyFallback) {
            return (
                <div ref={ref} className={classNames('eui-md-preview is-empty', className)}>
                    {emptyFallback}
                </div>
            );
        }

        return (
            <div ref={ref} className={classNames('eui-md-preview', className)}>
                {content}
            </div>
        );
    },
);

MarkdownPreviewInner.displayName = 'MarkdownPreview';

export const MarkdownPreview = memo(MarkdownPreviewInner);
