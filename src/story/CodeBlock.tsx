import cn from 'classnames';
import React, { useMemo, useState } from 'react';
import { CheckIcon, CopyIcon } from '../assets/icons';
import { useStoryTheme } from './StoryThemeContext';

interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
    className?: string;
}

type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'tag' | 'bracket' | 'type' | 'plain';

interface Token {
    type: TokenType;
    value: string;
}

const darkColors: Record<TokenType, string> = {
    keyword: '#c792ea',
    string: '#c3e88d',
    number: '#f78c6c',
    comment: '#546e7a',
    tag: '#f07178',
    bracket: '#89ddff',
    type: '#ffcb6b',
    plain: '',
};

const lightColors: Record<TokenType, string> = {
    keyword: '#7c3aed',
    string: '#16a34a',
    number: '#ea580c',
    comment: '#9ca3af',
    tag: '#dc2626',
    bracket: '#0891b2',
    type: '#d97706',
    plain: '',
};

const keywords = new Set([
    'import', 'export', 'from', 'const', 'let', 'var', 'function', 'return',
    'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue',
    'new', 'typeof', 'instanceof', 'class', 'extends', 'implements',
    'interface', 'type', 'enum', 'async', 'await', 'try', 'catch', 'throw',
    'null', 'undefined', 'true', 'false', 'void', 'default',
]);

const bracketPattern = /^(?:=>|[{}()\[\]=])/;
const numberPattern = /^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/;
const wordPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*/;
const whitespacePattern = /^(\s+)/;

function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < code.length) {
        const remaining = code.slice(i);

        const wsMatch = remaining.match(whitespacePattern);
        if (wsMatch) {
            tokens.push({ type: 'plain', value: wsMatch[0] });
            i += wsMatch[0].length;
            continue;
        }

        if (remaining.startsWith('//')) {
            const end = remaining.indexOf('\n');
            const comment = end === -1 ? remaining : remaining.slice(0, end);
            tokens.push({ type: 'comment', value: comment });
            i += comment.length;
            continue;
        }

        if (remaining.startsWith('/*')) {
            const end = remaining.indexOf('*/', 2);
            const comment = end === -1 ? remaining : remaining.slice(0, end + 2);
            tokens.push({ type: 'comment', value: comment });
            i += comment.length;
            continue;
        }

        if (remaining[0] === '"' || remaining[0] === "'") {
            const quote = remaining[0];
            let j = 1;
            while (j < remaining.length) {
                if (remaining[j] === '\\') {
                    j += 2;
                    continue;
                }
                if (remaining[j] === quote) {
                    j++;
                    break;
                }
                j++;
            }
            tokens.push({ type: 'string', value: remaining.slice(0, j) });
            i += j;
            continue;
        }

        if (remaining[0] === '`') {
            let j = 1;
            while (j < remaining.length) {
                if (remaining[j] === '\\') {
                    j += 2;
                    continue;
                }
                if (remaining[j] === '`') {
                    j++;
                    break;
                }
                j++;
            }
            tokens.push({ type: 'string', value: remaining.slice(0, j) });
            i += j;
            continue;
        }

        if (remaining[0] === '<') {
            const closingTag = remaining.match(/^<\/([a-zA-Z][a-zA-Z0-9.]*)\s*>/);
            if (closingTag) {
                tokens.push({ type: 'tag', value: closingTag[0] });
                i += closingTag[0].length;
                continue;
            }
            const openTag = remaining.match(/^<([a-zA-Z][a-zA-Z0-9.]*)/);
            if (openTag) {
                tokens.push({ type: 'tag', value: openTag[0] });
                i += openTag[0].length;
                continue;
            }
        }

        if (remaining.startsWith('/>')) {
            tokens.push({ type: 'tag', value: '/>' });
            i += 2;
            continue;
        }

        if (remaining[0] === '>' && i > 0) {
            const prevNonWs = tokens.filter(t => t.type !== 'plain').pop();
            if (prevNonWs && (prevNonWs.type === 'tag' || prevNonWs.type === 'string' || prevNonWs.value === '>' || /^[a-zA-Z"'}]/.test(prevNonWs.value.slice(-1)))) {
                tokens.push({ type: 'tag', value: '>' });
                i += 1;
                continue;
            }
        }

        const bracketMatch = remaining.match(bracketPattern);
        if (bracketMatch) {
            tokens.push({ type: 'bracket', value: bracketMatch[0] });
            i += bracketMatch[0].length;
            continue;
        }

        const numMatch = remaining.match(numberPattern);
        if (numMatch && (i === 0 || /[\s=(:,\[+\-*/<>!&|?;{}]/.test(code[i - 1]))) {
            tokens.push({ type: 'number', value: numMatch[0] });
            i += numMatch[0].length;
            continue;
        }

        const wordMatch = remaining.match(wordPattern);
        if (wordMatch) {
            const word = wordMatch[0];
            if (keywords.has(word)) {
                tokens.push({ type: 'keyword', value: word });
            } else if (/^[A-Z]/.test(word)) {
                tokens.push({ type: 'type', value: word });
            } else {
                tokens.push({ type: 'plain', value: word });
            }
            i += word.length;
            continue;
        }

        tokens.push({ type: 'plain', value: remaining[0] });
        i += 1;
    }

    return tokens;
}

function highlightCode(code: string, dark: boolean): React.ReactNode[] {
    const tokens = tokenize(code);
    const colors = dark ? darkColors : lightColors;

    return tokens.map((token, idx) => {
        const color = colors[token.type];
        if (!color) {
            return <React.Fragment key={idx}>{token.value}</React.Fragment>;
        }
        return (
            <span key={idx} style={{ color }}>
                {token.value}
            </span>
        );
    });
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, title, className = '' }) => {
    const { isDark } = useStoryTheme();
    const [copied, setCopied] = useState(false);

    const highlighted = useMemo(() => highlightCode(code, isDark), [code, isDark]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard access may be denied in some environments
        }
    };

    return (
        <div
            className={cn(
                'eui-story-code-block rounded-xl border overflow-hidden',
                {
                    'border-white/8 bg-[#0d0f14]': isDark,
                    'border-gray-200 bg-white shadow-sm': !isDark,
                },
                className
            )}
        >
            {title && (
                <div
                    className={cn('px-4 py-2.5 border-b flex items-center justify-between', {
                        'border-white/8 bg-white/3': isDark,
                        'border-gray-200 bg-gray-50': !isDark,
                    })}
                >
                    <span
                        className={cn('text-xs font-medium', {
                            'text-gray-400': isDark,
                            'text-gray-500': !isDark,
                        })}
                    >
                        {title}
                    </span>
                </div>
            )}

            <div className="relative group">
                <button
                    onClick={copyToClipboard}
                    aria-label="Copy code"
                    className={cn(
                        'absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100 z-10',
                        {
                            'bg-white/8 hover:bg-white/15 text-gray-500 hover:text-gray-200': isDark,
                            'bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700': !isDark,
                        }
                    )}
                >
                    {copied ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                        <CopyIcon className="w-3.5 h-3.5" />
                    )}
                </button>

                <pre className={cn('overflow-x-auto p-4 text-xs leading-relaxed', {
                    'bg-[#080a0f]': isDark,
                    'bg-gray-50': !isDark,
                })}>
                    <code
                        className={cn('font-mono whitespace-pre', {
                            'text-gray-300': isDark,
                            'text-gray-700': !isDark,
                        })}
                    >
                        {highlighted}
                    </code>
                </pre>
            </div>
        </div>
    );
};
