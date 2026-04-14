import React from 'react';
import type { BlockNode, InlineNode, ListItem } from './parser';

export interface RenderOptions {
    openLinksInNewTab?: boolean;
    sanitizeUrl?: (url: string) => string | null;
    imageResolver?: (src: string) => string;
}

const SAFE_PROTOCOLS = /^(https?:|mailto:|tel:|data:image\/|blob:|#|\/|\.\/|\.\.\/)/i;

function defaultSanitizeUrl(url: string): string | null {
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (SAFE_PROTOCOLS.test(trimmed)) return trimmed;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
    return null;
}

export function renderInline(nodes: InlineNode[], options: RenderOptions, keyPrefix = 'i'): React.ReactNode[] {
    const sanitize = options.sanitizeUrl ?? defaultSanitizeUrl;
    const resolveImg = options.imageResolver ?? ((s) => s);
    return nodes.map((node, idx) => {
        const key = keyPrefix + '-' + idx;
        switch (node.type) {
            case 'text':
                return <React.Fragment key={key}>{node.value}</React.Fragment>;
            case 'strong':
                return <strong key={key}>{renderInline(node.children, options, key)}</strong>;
            case 'em':
                return <em key={key}>{renderInline(node.children, options, key)}</em>;
            case 'del':
                return <del key={key}>{renderInline(node.children, options, key)}</del>;
            case 'code':
                return (
                    <code key={key} className="eui-md-inline-code">
                        {node.value}
                    </code>
                );
            case 'break':
                return <br key={key} />;
            case 'link': {
                const href = sanitize(node.href);
                if (!href) {
                    return <span key={key}>{renderInline(node.children, options, key)}</span>;
                }
                const extra = options.openLinksInNewTab
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {};
                return (
                    <a key={key} href={href} title={node.title} {...extra}>
                        {renderInline(node.children, options, key)}
                    </a>
                );
            }
            case 'image': {
                const src = sanitize(node.src);
                if (!src) {
                    return (
                        <span key={key} className="eui-md-image-placeholder">
                            {node.alt || 'image'}
                        </span>
                    );
                }
                return <img key={key} src={resolveImg(src)} alt={node.alt} title={node.title} loading="lazy" />;
            }
            default:
                return null;
        }
    });
}

function renderListItem(item: ListItem, tight: boolean, options: RenderOptions, key: string): React.ReactNode {
    const isTask = item.checked === true || item.checked === false;
    const content = item.children.map((child, idx) => renderBlock(child, options, key + '-b' + idx, tight));
    return (
        <li key={key} className={isTask ? 'eui-md-task-item' : undefined}>
            {isTask && (
                <input type="checkbox" checked={item.checked === true} readOnly disabled className="eui-md-task-checkbox" />
            )}
            {content}
        </li>
    );
}

export function renderBlock(
    node: BlockNode,
    options: RenderOptions,
    key: string,
    tightParent = false,
): React.ReactNode {
    switch (node.type) {
        case 'heading': {
            const Tag = ('h' + node.depth) as keyof React.JSX.IntrinsicElements;
            return <Tag key={key}>{renderInline(node.children, options, key)}</Tag>;
        }
        case 'paragraph':
            if (tightParent) {
                return (
                    <React.Fragment key={key}>
                        {renderInline(node.children, options, key)}
                    </React.Fragment>
                );
            }
            return <p key={key}>{renderInline(node.children, options, key)}</p>;
        case 'blockquote':
            return (
                <blockquote key={key}>
                    {node.children.map((c, i) => renderBlock(c, options, key + '-c' + i))}
                </blockquote>
            );
        case 'list': {
            const items = node.items.map((item, i) => renderListItem(item, node.tight, options, key + '-l' + i));
            if (node.ordered) {
                return (
                    <ol key={key} start={node.start} className="eui-md-list">
                        {items}
                    </ol>
                );
            }
            return (
                <ul key={key} className="eui-md-list">
                    {items}
                </ul>
            );
        }
        case 'code':
            return (
                <pre key={key} className="eui-md-code-block">
                    <code data-lang={node.lang}>{node.value}</code>
                </pre>
            );
        case 'hr':
            return <hr key={key} />;
        case 'table':
            return (
                <div key={key} className="eui-md-table-wrap">
                    <table className="eui-md-table">
                        <thead>
                            <tr>
                                {node.header.map((cell, i) => (
                                    <th key={'h' + i} style={{ textAlign: node.align[i] ?? undefined }}>
                                        {renderInline(cell, options, key + '-h' + i)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {node.rows.map((row, ri) => (
                                <tr key={'r' + ri}>
                                    {row.map((cell, ci) => (
                                        <td key={'c' + ci} style={{ textAlign: node.align[ci] ?? undefined }}>
                                            {renderInline(cell, options, key + '-r' + ri + 'c' + ci)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        default:
            return null;
    }
}

export function renderBlocks(blocks: BlockNode[], options: RenderOptions): React.ReactNode {
    return blocks.map((block, i) => renderBlock(block, options, 'b' + i));
}
