import React, { useState } from 'react';
import { MarkdownEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initial = `# Markdown Editor Showcase

A **zero-dependency** editor with *full* inline and block formatting.
Inline marks: **bold**, *italic*, ***bold italic***, ~~strikethrough~~, and \`inline code\`.

## Links and images

Visit [FluxoUI on utilsware](https://fluxo-ui.utilsware.com/) — or check an autolink: <https://utilsware.com>.

![Mountain landscape](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800 "A mountain view")

### Lists

Unordered with nesting:

- First item
- Second item
  - Nested one
  - Nested two
    - Even deeper
- Third item

Ordered list:

1. Wire up the toolbar
2. Paste an image
3. Flush uploads on submit

Task list:

- [x] Parser supports GFM
- [x] Split view with mobile tabs
- [ ] Syntax highlighting (coming soon)

### Blockquote

> "Markdown should be easy to write — and even easier to read."
>
> — every documentation author ever

### Fenced code

\`\`\`ts
import { MarkdownEditor } from 'fluxo-ui';

const editor = <MarkdownEditor value={md} onChange={setMd} />;
\`\`\`

### Table

| Feature     | Inline | Block |
| ----------- | :----: | :---: |
| Headings    |   —    |  yes  |
| Images      |  yes   |  yes  |
| Tables      |   —    |  yes  |
| Task lists  |   —    |  yes  |

---

Try editing any of the above, or click the **image**, **link**, or **table** buttons in the toolbar.
`;

const code = `import { MarkdownEditor } from 'fluxo-ui';

const [value, setValue] = useState('# Hello');

<MarkdownEditor
  value={value}
  onChange={setValue}
  defaultView="split"
  minHeight={420}
/>`;

const BasicUsage: React.FC = () => {
    const [value, setValue] = useState(initial);
    return (
        <>
            <ComponentDemo title="Editor with Live Preview" description="Edit and preview markdown with view toggling, keyboard shortcuts, and a complete toolbar.">
                <MarkdownEditor value={value} onChange={setValue} defaultView="split" maxHeight={520} />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
