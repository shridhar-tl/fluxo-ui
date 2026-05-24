import classNames from 'classnames';
import React, { forwardRef, memo, useMemo } from 'react';
import { sanitizeHtml, type HtmlSanitizerConfig } from './htmlSanitizer';
import '../eui-base.scss';
import './html-editor.scss';

export interface HtmlPreviewProps {
    value: string;
    className?: string;
    sanitize?: (html: string) => string;
    sanitizerConfig?: HtmlSanitizerConfig;
    emptyFallback?: React.ReactNode;
    openLinksInNewTab?: boolean;
}

function applyLinkTarget(html: string): string {
    if (!html) return html;
    return html.replace(/<a\b([^>]*)>/gi, (match, attrs: string) => {
        if (/target\s*=/i.test(attrs)) return match;
        return '<a' + attrs + ' target="_blank" rel="noopener noreferrer">';
    });
}

const HtmlPreviewInner = forwardRef<HTMLDivElement, HtmlPreviewProps>(
    ({ value, className, sanitize, sanitizerConfig, emptyFallback, openLinksInNewTab = true }, ref) => {
        const cleaned = useMemo(() => {
            if (!value || value.trim() === '') return '';
            const sanitizer = sanitize ?? ((h: string) => sanitizeHtml(h, sanitizerConfig));
            let result = sanitizer(value);
            if (openLinksInNewTab) result = applyLinkTarget(result);
            return result;
        }, [value, sanitize, sanitizerConfig, openLinksInNewTab]);

        if (!cleaned) {
            return (
                <div ref={ref} className={classNames('eui-html-preview is-empty', className)}>
                    {emptyFallback}
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={classNames('eui-html-preview', className)}
                dangerouslySetInnerHTML={{ __html: cleaned }}
            />
        );
    },
);

HtmlPreviewInner.displayName = 'HtmlPreview';

export const HtmlPreview = memo(HtmlPreviewInner);
