import React from 'react';
import { HtmlEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sample = `<h1>Read-only Mode</h1>
<p>The editor can be rendered in <strong>read-only</strong> mode — content remains selectable, but the toolbar is disabled.</p>
<h2>What you can see</h2>
<p>Inline formatting still renders: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>, <code>inline code</code>, and <a href="https://fluxo-ui.utilsware.com/">links</a>.</p>
<ul>
    <li>Useful for displaying the editor with its chrome intact</li>
    <li>Prevents any formatting changes</li>
    <li>Still allows copy to clipboard</li>
</ul>
<blockquote><p>Read-only doesn't mean "hidden". It means "visible but immutable."</p></blockquote>`;

const code = `<HtmlEditor value={value} readOnly defaultView="split" />`;

const ReadOnly: React.FC = () => (
    <>
        <ComponentDemo title="Read-only Editor" description="All toolbar actions and keyboard shortcuts are disabled.">
            <HtmlEditor value={sample} readOnly defaultView="split" maxHeight={420} />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ReadOnly;
