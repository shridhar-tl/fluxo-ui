import React, { useState } from 'react';
import { HtmlEditor, MINIMAL_HTML_TOOLBAR, type HtmlToolbarItem } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const customToolbar: HtmlToolbarItem[] = [
    'bold',
    'italic',
    'underline',
    'divider',
    'h2',
    'h3',
    'divider',
    'textColor',
    'bgColor',
    'divider',
    'link',
    'quote',
];

const initial = `<h1>Custom Toolbars</h1>
<p>Configure exactly which formatting buttons appear. Pass <code>toolbar</code> with any subset of actions, or use the built-in <code>MINIMAL_HTML_TOOLBAR</code>.</p>
<ul>
    <li><strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s></li>
    <li><a href="https://fluxo-ui.utilsware.com/">Link to docs</a></li>
</ul>
<blockquote><p>Quotes still work even when the toolbar is hidden — all keyboard shortcuts are always available.</p></blockquote>`;

const code = `import { HtmlEditor, MINIMAL_HTML_TOOLBAR } from 'fluxo-ui';

<HtmlEditor toolbar={MINIMAL_HTML_TOOLBAR} />

<HtmlEditor
  toolbar={['bold', 'italic', 'underline', 'divider', 'h2', 'h3', 'divider', 'textColor', 'link', 'quote']}
/>

<HtmlEditor toolbar={false} />`;

const CustomToolbar: React.FC = () => {
    const [a, setA] = useState(initial);
    const [b, setB] = useState(initial);
    const [c, setC] = useState(initial);
    return (
        <>
            <ComponentDemo title="Minimal Toolbar" description="Use the built-in minimal preset for simple comment boxes.">
                <HtmlEditor value={a} onChange={setA} toolbar={MINIMAL_HTML_TOOLBAR} maxHeight={320} />
            </ComponentDemo>
            <div className="mt-6">
                <ComponentDemo title="Custom Selection" description="Pass an explicit list of toolbar actions in your preferred order.">
                    <HtmlEditor value={b} onChange={setB} toolbar={customToolbar} maxHeight={320} />
                </ComponentDemo>
            </div>
            <div className="mt-6">
                <ComponentDemo title="No Toolbar" description="Disable the toolbar entirely — keyboard shortcuts still work.">
                    <HtmlEditor value={c} onChange={setC} toolbar={false} maxHeight={320} />
                </ComponentDemo>
            </div>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomToolbar;
