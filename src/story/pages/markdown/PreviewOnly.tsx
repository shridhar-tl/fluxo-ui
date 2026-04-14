import React from 'react';
import { MarkdownPreview } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sample = `# Preview-only Renderer

Use **MarkdownPreview** when you only need to *render* markdown — comments, blog posts, or read-only docs.

## What this renderer supports

Inline: **bold**, *italic*, ***bold italic***, ~~strike~~, \`code\`, and [links](https://fluxo-ui.utilsware.com/).

![Ocean sunset](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800 "Golden hour")

### Lists with nesting

1. First top-level item
2. Second with a nested list
   - Nested bullet
   - Another nested bullet
     1. Deep ordered
     2. Deep ordered two
3. Third top-level item

### Task list

- [x] Safe URL sanitization
- [x] Lazy-loaded images
- [ ] Custom image resolver

### Blockquote

> Blockquotes can span multiple lines and contain **inline formatting**.
>
> They can even contain \`code\` and [links](https://fluxo-ui.utilsware.com/).

### Fenced code block

\`\`\`ts
import { MarkdownPreview } from 'fluxo-ui';

<MarkdownPreview value={markdown} openLinksInNewTab />
\`\`\`

### Table with alignment

| Left-aligned | Centered | Right-aligned |
| :----------- | :------: | ------------: |
| one          |   two    |         three |
| short        |   long   |          text |
| a            |    b     |             c |

---

Unsafe URLs like \`javascript:alert(1)\` are automatically blocked.
`;

const code = `import { MarkdownPreview } from 'fluxo-ui';

<MarkdownPreview value={markdown} openLinksInNewTab />`;

const PreviewOnly: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Preview Only" description="Render markdown without the editor — ideal for displaying user-generated content.">
                <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 6, background: 'var(--eui-bg)' }}>
                    <MarkdownPreview value={sample} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default PreviewOnly;
