import {
    AlignCenterIcon,
    AlignJustifyIcon,
    AlignLeftIcon,
    AlignRightIcon,
    BgColorIcon,
    BoldIcon,
    ClearFormatIcon,
    CodeBlockIcon,
    CodeIcon,
    FontFamilyIcon,
    FontSizeIcon,
    HeadingIcon,
    HighlightIcon,
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
    SubscriptIcon,
    SuperscriptIcon,
    TableIcon,
    TextColorIcon,
    UnderlineIcon,
    UndoIcon,
    UnlinkIcon,
} from '../../assets/icons';

export type HtmlToolbarAction =
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strike'
    | 'code'
    | 'superscript'
    | 'subscript'
    | 'highlight'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'heading'
    | 'paragraph'
    | 'quote'
    | 'ul'
    | 'ol'
    | 'task'
    | 'link'
    | 'unlink'
    | 'image'
    | 'codeblock'
    | 'table'
    | 'hr'
    | 'indent'
    | 'outdent'
    | 'alignLeft'
    | 'alignCenter'
    | 'alignRight'
    | 'alignJustify'
    | 'align'
    | 'textColor'
    | 'bgColor'
    | 'fontSize'
    | 'fontFamily'
    | 'clearFormat'
    | 'source'
    | 'undo'
    | 'redo';

export type HtmlToolbarItem = HtmlToolbarAction | 'divider';

export interface HtmlToolbarActionMeta {
    action: HtmlToolbarAction;
    label: string;
    icon: React.FC;
    shortcut?: string;
}

export const HTML_ACTION_META: Record<HtmlToolbarAction, HtmlToolbarActionMeta> = {
    bold: { action: 'bold', label: 'Bold', icon: BoldIcon, shortcut: 'Ctrl+B' },
    italic: { action: 'italic', label: 'Italic', icon: ItalicIcon, shortcut: 'Ctrl+I' },
    underline: { action: 'underline', label: 'Underline', icon: UnderlineIcon, shortcut: 'Ctrl+U' },
    strike: { action: 'strike', label: 'Strikethrough', icon: StrikethroughIcon, shortcut: 'Ctrl+Shift+X' },
    code: { action: 'code', label: 'Inline code', icon: CodeIcon, shortcut: 'Ctrl+E' },
    superscript: { action: 'superscript', label: 'Superscript', icon: SuperscriptIcon, shortcut: 'Ctrl+.' },
    subscript: { action: 'subscript', label: 'Subscript', icon: SubscriptIcon, shortcut: 'Ctrl+,' },
    highlight: { action: 'highlight', label: 'Highlight', icon: HighlightIcon },
    h1: { action: 'h1', label: 'Heading 1', icon: HeadingIcon, shortcut: 'Ctrl+Alt+1' },
    h2: { action: 'h2', label: 'Heading 2', icon: HeadingIcon, shortcut: 'Ctrl+Alt+2' },
    h3: { action: 'h3', label: 'Heading 3', icon: HeadingIcon, shortcut: 'Ctrl+Alt+3' },
    h4: { action: 'h4', label: 'Heading 4', icon: HeadingIcon, shortcut: 'Ctrl+Alt+4' },
    h5: { action: 'h5', label: 'Heading 5', icon: HeadingIcon, shortcut: 'Ctrl+Alt+5' },
    h6: { action: 'h6', label: 'Heading 6', icon: HeadingIcon, shortcut: 'Ctrl+Alt+6' },
    heading: { action: 'heading', label: 'Heading', icon: HeadingIcon },
    paragraph: { action: 'paragraph', label: 'Paragraph', icon: HeadingIcon },
    quote: { action: 'quote', label: 'Blockquote', icon: QuoteIcon, shortcut: 'Ctrl+Shift+.' },
    ul: { action: 'ul', label: 'Bullet list', icon: ListUlIcon, shortcut: 'Ctrl+Shift+8' },
    ol: { action: 'ol', label: 'Numbered list', icon: ListOlIcon, shortcut: 'Ctrl+Shift+7' },
    task: { action: 'task', label: 'Task list', icon: ListCheckIcon, shortcut: 'Ctrl+Shift+9' },
    link: { action: 'link', label: 'Link', icon: LinkIcon, shortcut: 'Ctrl+K' },
    unlink: { action: 'unlink', label: 'Remove link', icon: UnlinkIcon },
    image: { action: 'image', label: 'Image', icon: ImageIcon },
    codeblock: { action: 'codeblock', label: 'Code block', icon: CodeBlockIcon, shortcut: 'Ctrl+Shift+C' },
    table: { action: 'table', label: 'Table', icon: TableIcon },
    hr: { action: 'hr', label: 'Horizontal rule', icon: HorizontalRuleIcon },
    indent: { action: 'indent', label: 'Indent', icon: IndentIcon, shortcut: 'Tab' },
    outdent: { action: 'outdent', label: 'Outdent', icon: OutdentIcon, shortcut: 'Shift+Tab' },
    alignLeft: { action: 'alignLeft', label: 'Align left', icon: AlignLeftIcon },
    alignCenter: { action: 'alignCenter', label: 'Align center', icon: AlignCenterIcon },
    alignRight: { action: 'alignRight', label: 'Align right', icon: AlignRightIcon },
    alignJustify: { action: 'alignJustify', label: 'Justify', icon: AlignJustifyIcon },
    align: { action: 'align', label: 'Alignment', icon: AlignLeftIcon },
    textColor: { action: 'textColor', label: 'Text color', icon: TextColorIcon },
    bgColor: { action: 'bgColor', label: 'Background color', icon: BgColorIcon },
    fontSize: { action: 'fontSize', label: 'Font size', icon: FontSizeIcon },
    fontFamily: { action: 'fontFamily', label: 'Font family', icon: FontFamilyIcon },
    clearFormat: { action: 'clearFormat', label: 'Clear formatting', icon: ClearFormatIcon },
    source: { action: 'source', label: 'View HTML source', icon: CodeBlockIcon, shortcut: 'Ctrl+Shift+S' },
    undo: { action: 'undo', label: 'Undo', icon: UndoIcon, shortcut: 'Ctrl+Z' },
    redo: { action: 'redo', label: 'Redo', icon: RedoIcon, shortcut: 'Ctrl+Y' },
};

export const DEFAULT_HTML_TOOLBAR: HtmlToolbarItem[] = [
    'undo',
    'redo',
    'divider',
    'heading',
    'fontFamily',
    'fontSize',
    'divider',
    'bold',
    'italic',
    'underline',
    'strike',
    'code',
    'divider',
    'textColor',
    'bgColor',
    'highlight',
    'divider',
    'superscript',
    'subscript',
    'divider',
    'link',
    'image',
    'divider',
    'ul',
    'ol',
    'task',
    'divider',
    'align',
    'outdent',
    'indent',
    'divider',
    'quote',
    'codeblock',
    'table',
    'hr',
    'divider',
    'clearFormat',
    'source',
];

export const MINIMAL_HTML_TOOLBAR: HtmlToolbarItem[] = [
    'bold',
    'italic',
    'underline',
    'divider',
    'link',
    'ul',
    'ol',
    'divider',
    'quote',
    'code',
];

export const FONT_FAMILY_OPTIONS: { id: string; label: string; value: string }[] = [
    { id: 'default', label: 'Default', value: '' },
    { id: 'sans', label: 'Sans Serif', value: 'Arial, Helvetica, sans-serif' },
    { id: 'serif', label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
    { id: 'mono', label: 'Monospace', value: 'ui-monospace, "Cascadia Code", Menlo, monospace' },
    { id: 'system', label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
    { id: 'cursive', label: 'Cursive', value: '"Brush Script MT", cursive' },
];

export const FONT_SIZE_OPTIONS: { id: string; label: string; value: string }[] = [
    { id: 'default', label: 'Default', value: '' },
    { id: 'xs', label: 'Extra Small', value: '11px' },
    { id: 'sm', label: 'Small', value: '13px' },
    { id: 'md', label: 'Normal', value: '15px' },
    { id: 'lg', label: 'Large', value: '18px' },
    { id: 'xl', label: 'Extra Large', value: '22px' },
    { id: '2xl', label: 'Huge', value: '28px' },
    { id: '3xl', label: 'Display', value: '36px' },
];

export const TEXT_COLOR_PALETTE: string[] = [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78350f',
];

export const BG_COLOR_PALETTE: string[] = [
    'transparent', '#fef2f2', '#fff7ed', '#fefce8', '#f7fee7', '#f0fdf4',
    '#ecfdf5', '#f0fdfa', '#ecfeff', '#f0f9ff', '#eff6ff', '#eef2ff',
    '#f5f3ff', '#faf5ff', '#fdf4ff', '#fdf2f8', '#fff1f2', '#fafaf9',
    '#fee2e2', '#ffedd5', '#fef3c7', '#dcfce7', '#cffafe', '#dbeafe',
];
