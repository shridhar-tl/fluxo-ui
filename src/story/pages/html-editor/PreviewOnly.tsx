import React from 'react';
import { HtmlPreview } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sample = `<h1>Preview-only Renderer</h1>
<p>Use <strong>HtmlPreview</strong> when you only need to <em>render</em> sanitized HTML — comments, blog posts, or read-only docs.</p>
<h2>What this renderer supports</h2>
<p>Inline: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>, <code>code</code>, <mark>highlight</mark>, <sup>sup</sup>, <sub>sub</sub>, and <a href="https://fluxo-ui.utilsware.com/">links</a>.</p>
<p>Colors: <span style="color: #3b82f6;">blue</span>, <span style="color: #ef4444;">red</span>, <span style="background-color: #fef3c7;">highlighted</span>.</p>
<h3>Lists</h3>
<ol>
    <li>First top-level item</li>
    <li>Second with nested list
        <ul>
            <li>Nested bullet</li>
            <li>Another nested bullet</li>
        </ul>
    </li>
</ol>
<h3>Blockquote</h3>
<blockquote><p>Blockquotes can span multiple lines and contain <strong>inline formatting</strong>.</p></blockquote>
<h3>Code block</h3>
<pre><code>import { HtmlPreview } from 'fluxo-ui';
&lt;HtmlPreview value={html} /&gt;</code></pre>
<h3>Table</h3>
<table>
    <thead><tr><th>Left</th><th>Center</th><th>Right</th></tr></thead>
    <tbody>
        <tr><td>one</td><td>two</td><td>three</td></tr>
        <tr><td>short</td><td>long</td><td>text</td></tr>
    </tbody>
</table>
<hr/>
<p>Dangerous scripts and <code>javascript:</code> URLs are automatically stripped.</p>`;

const unsafeSample = `<p>Safe paragraph</p><script>alert('xss')</script><p><a href="javascript:alert(1)">click</a></p><p onclick="alert(1)">event handler attempt</p>`;

const code = `import { HtmlPreview } from 'fluxo-ui';

<HtmlPreview value={html} openLinksInNewTab />`;

const PreviewOnly: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Preview Only" description="Render sanitized HTML without the editor — ideal for displaying user-generated content.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 6, background: 'var(--eui-bg)' }}>
                        <HtmlPreview value={sample} />
                    </div>
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 12,
                            color: 'var(--eui-text-muted)',
                        }}
                    >
                        Input: <code>{unsafeSample.replace(/</g, '&lt;')}</code>
                        <div style={{ marginTop: 8, padding: 10, background: 'var(--eui-bg)', borderRadius: 4, border: '1px solid var(--eui-border-subtle)' }}>
                            <HtmlPreview value={unsafeSample} />
                        </div>
                        <div style={{ marginTop: 6 }}>Scripts and unsafe URLs were removed automatically.</div>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default PreviewOnly;
