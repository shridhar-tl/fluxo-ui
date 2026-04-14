import React, { useState } from 'react';
import { HtmlEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initial = `<h1>HTML Rich Text Editor</h1>
<p>A <strong>WYSIWYG</strong> editor with the <em>full range</em> of rich formatting: <u>underline</u>, <s>strikethrough</s>, <code>inline code</code>, <mark>highlighted text</mark>, <sup>superscript</sup>, <sub>subscript</sub>.</p>
<h2>Text colors &amp; fonts</h2>
<p>You can change <span style="color: #3b82f6;">text color</span>, <span style="background-color: #fef3c7;">background color</span>, <span style="font-size: 22px;">font size</span>, and <span style="font-family: Georgia, serif;">font family</span> on any selection.</p>
<h2>Lists</h2>
<ul>
  <li>Nested unordered lists</li>
  <li>Items with <strong>inline formatting</strong>
    <ul>
      <li>Even deeper</li>
      <li>Multiple levels supported</li>
    </ul>
  </li>
</ul>
<ol>
  <li>Ordered</li>
  <li>Numbered</li>
  <li>Sequences</li>
</ol>
<ul data-task-list="true" class="eui-html-task-list">
  <li data-task-item="true"><input type="checkbox" checked="checked" /> Task lists with checkboxes</li>
  <li data-task-item="true"><input type="checkbox" /> Click the box to toggle</li>
</ul>
<h2>Alignment</h2>
<p style="text-align: left;">Left aligned paragraph.</p>
<p style="text-align: center;">Center aligned paragraph.</p>
<p style="text-align: right;">Right aligned paragraph.</p>
<p style="text-align: justify;">Justified paragraph that stretches across the full width when there is enough content to demonstrate the justification behavior of text blocks.</p>
<h2>Blockquote</h2>
<blockquote><p>"WYSIWYG means what you see is what you get." — every rich text editor ever.</p></blockquote>
<h2>Code block</h2>
<pre><code>const editor = new HtmlEditor();
editor.mount('#root');</code></pre>
<h2>Table</h2>
<table class="eui-html-table">
  <thead><tr><th>Feature</th><th>Inline</th><th>Block</th></tr></thead>
  <tbody>
    <tr><td>Headings</td><td>—</td><td>yes</td></tr>
    <tr><td>Colors</td><td>yes</td><td>yes</td></tr>
    <tr><td>Tables</td><td>—</td><td>yes</td></tr>
  </tbody>
</table>
<hr/>
<p>Try any of the toolbar actions or keyboard shortcuts — <kbd>Ctrl+B</kbd>, <kbd>Ctrl+I</kbd>, <kbd>Ctrl+U</kbd>, <kbd>Ctrl+K</kbd>, <kbd>Ctrl+Alt+1..6</kbd>.</p>`;

const code = `import { HtmlEditor } from 'fluxo-ui';

const [value, setValue] = useState('<h1>Hello</h1>');

<HtmlEditor
  value={value}
  onChange={setValue}
  defaultView="split"
  maxHeight={520}
/>`;

const BasicUsage: React.FC = () => {
    const [value, setValue] = useState(initial);
    return (
        <>
            <ComponentDemo title="Rich Text Editor" description="Full WYSIWYG editing with inline, block, color, font, alignment, list, table, and link/image support.">
                <HtmlEditor value={value} onChange={setValue} defaultView="split" maxHeight={560} />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
