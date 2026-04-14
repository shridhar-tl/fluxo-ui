import React from 'react';
import {
    BoldIcon,
    CodeBlockIcon,
    CodeIcon,
    HeadingIcon,
    HorizontalRuleIcon,
    ImageIcon,
    IndentIcon,
    ItalicIcon,
    LinkIcon,
    ListCheckIcon,
    ListOlIcon,
    ListUlIcon,
    OutdentIcon,
    QuoteIcon,
    RedoIcon,
    StrikethroughIcon,
    TableIcon,
    UndoIcon,
} from '../../assets/icons';

export type MarkdownToolbarAction =
    | 'bold'
    | 'italic'
    | 'strike'
    | 'code'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'heading'
    | 'quote'
    | 'ul'
    | 'ol'
    | 'task'
    | 'link'
    | 'image'
    | 'codeblock'
    | 'table'
    | 'hr'
    | 'indent'
    | 'outdent'
    | 'undo'
    | 'redo';

export type MarkdownToolbarItem = MarkdownToolbarAction | 'divider';

export interface MarkdownToolbarActionMeta {
    action: MarkdownToolbarAction;
    label: string;
    icon: React.FC;
    shortcut?: string;
}

export const MARKDOWN_ACTION_META: Record<MarkdownToolbarAction, MarkdownToolbarActionMeta> = {
    bold: { action: 'bold', label: 'Bold', icon: BoldIcon, shortcut: 'Ctrl+B' },
    italic: { action: 'italic', label: 'Italic', icon: ItalicIcon, shortcut: 'Ctrl+I' },
    strike: { action: 'strike', label: 'Strikethrough', icon: StrikethroughIcon, shortcut: 'Ctrl+Shift+X' },
    code: { action: 'code', label: 'Inline code', icon: CodeIcon, shortcut: 'Ctrl+E' },
    h1: { action: 'h1', label: 'Heading 1', icon: HeadingIcon, shortcut: 'Ctrl+Alt+1' },
    h2: { action: 'h2', label: 'Heading 2', icon: HeadingIcon, shortcut: 'Ctrl+Alt+2' },
    h3: { action: 'h3', label: 'Heading 3', icon: HeadingIcon, shortcut: 'Ctrl+Alt+3' },
    h4: { action: 'h4', label: 'Heading 4', icon: HeadingIcon, shortcut: 'Ctrl+Alt+4' },
    h5: { action: 'h5', label: 'Heading 5', icon: HeadingIcon, shortcut: 'Ctrl+Alt+5' },
    h6: { action: 'h6', label: 'Heading 6', icon: HeadingIcon, shortcut: 'Ctrl+Alt+6' },
    heading: { action: 'heading', label: 'Heading', icon: HeadingIcon },
    quote: { action: 'quote', label: 'Blockquote', icon: QuoteIcon, shortcut: 'Ctrl+Shift+.' },
    ul: { action: 'ul', label: 'Bullet list', icon: ListUlIcon, shortcut: 'Ctrl+Shift+8' },
    ol: { action: 'ol', label: 'Numbered list', icon: ListOlIcon, shortcut: 'Ctrl+Shift+7' },
    task: { action: 'task', label: 'Task list', icon: ListCheckIcon },
    link: { action: 'link', label: 'Link', icon: LinkIcon, shortcut: 'Ctrl+K' },
    image: { action: 'image', label: 'Image', icon: ImageIcon },
    codeblock: { action: 'codeblock', label: 'Code block', icon: CodeBlockIcon, shortcut: 'Ctrl+Shift+C' },
    table: { action: 'table', label: 'Table', icon: TableIcon },
    hr: { action: 'hr', label: 'Horizontal rule', icon: HorizontalRuleIcon },
    indent: { action: 'indent', label: 'Indent', icon: IndentIcon, shortcut: 'Tab' },
    outdent: { action: 'outdent', label: 'Outdent', icon: OutdentIcon, shortcut: 'Shift+Tab' },
    undo: { action: 'undo', label: 'Undo', icon: UndoIcon, shortcut: 'Ctrl+Z' },
    redo: { action: 'redo', label: 'Redo', icon: RedoIcon, shortcut: 'Ctrl+Y' },
};

export const DEFAULT_MARKDOWN_TOOLBAR: MarkdownToolbarItem[] = [
    'undo',
    'redo',
    'divider',
    'heading',
    'divider',
    'bold',
    'italic',
    'strike',
    'code',
    'divider',
    'link',
    'image',
    'divider',
    'ul',
    'ol',
    'task',
    'divider',
    'quote',
    'codeblock',
    'table',
    'hr',
    'divider',
    'outdent',
    'indent',
];

export const MINIMAL_MARKDOWN_TOOLBAR: MarkdownToolbarItem[] = [
    'bold',
    'italic',
    'divider',
    'link',
    'ul',
    'ol',
    'divider',
    'quote',
    'code',
];
