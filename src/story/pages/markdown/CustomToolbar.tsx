import React, { useState } from 'react';
import {
    MarkdownEditor,
    MINIMAL_MARKDOWN_TOOLBAR,
    type MarkdownToolbarItem,
} from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const customToolbar: MarkdownToolbarItem[] = [
    'bold',
    'italic',
    'divider',
    'h2',
    'h3',
    'divider',
    'link',
    'quote',
];

const initial = `# Custom Toolbars

Configure exactly which formatting buttons appear. Pass \`toolbar\` with any subset of actions, or use the built-in \`MINIMAL_MARKDOWN_TOOLBAR\`.

## Try the available formatting

- **bold**, *italic*, ~~strike~~, \`inline code\`
- [Link to docs](https://fluxo-ui.utilsware.com/)
- ![Small image](https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600)

> Quotes still work even when the toolbar is hidden — all keyboard shortcuts are always available.

1. Select some text
2. Press \`Ctrl+B\` for bold
3. Press \`Ctrl+K\` to insert a link`;

const code = `import { MarkdownEditor, MINIMAL_MARKDOWN_TOOLBAR } from 'fluxo-ui';

<MarkdownEditor toolbar={MINIMAL_MARKDOWN_TOOLBAR} />

<MarkdownEditor
  toolbar={['bold', 'italic', 'divider', 'h2', 'h3', 'divider', 'link', 'quote']}
/>

<MarkdownEditor toolbar={false} />`;

const CustomToolbar: React.FC = () => {
    const [a, setA] = useState(initial);
    const [b, setB] = useState(initial);
    const [c, setC] = useState(initial);
    return (
        <>
            <ComponentDemo title="Minimal Toolbar" description="Use the built-in minimal preset for simple comment boxes.">
                <MarkdownEditor value={a} onChange={setA} toolbar={MINIMAL_MARKDOWN_TOOLBAR} maxHeight={320} />
            </ComponentDemo>
            <div className="mt-6">
                <ComponentDemo title="Custom Selection" description="Pass an explicit list of toolbar actions in your preferred order.">
                    <MarkdownEditor value={b} onChange={setB} toolbar={customToolbar} maxHeight={320} />
                </ComponentDemo>
            </div>
            <div className="mt-6">
                <ComponentDemo title="No Toolbar" description="Disable the toolbar entirely — keyboard shortcuts still work.">
                    <MarkdownEditor value={c} onChange={setC} toolbar={false} maxHeight={320} />
                </ComponentDemo>
            </div>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomToolbar;
