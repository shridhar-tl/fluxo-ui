import React from 'react';
import { MarkdownEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sample = `# Read-only Mode

The editor can be rendered in **read-only** mode — the textarea remains selectable, but the toolbar is disabled.

## What you can see

Inline formatting still renders: **bold**, *italic*, ~~strike~~, \`inline code\`, and [links](https://fluxo-ui.utilsware.com/).

![A calm lake](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800)

- Useful for displaying the editor with its chrome intact
- Prevents any formatting changes
- Still allows copy to clipboard

1. Open this in split view
2. Try clicking a toolbar button — it's disabled
3. Text remains selectable so users can copy it

> Read-only doesn't mean "hidden". It means "visible but immutable."

\`\`\`tsx
<MarkdownEditor value={markdown} readOnly defaultView="split" />
\`\`\`

| Behavior         | Read-only |
| ---------------- | :-------: |
| Toolbar enabled  |    no     |
| Text selectable  |    yes    |
| Shortcuts work   |    no     |
| Preview updates  |    yes    |
`;

const code = `<MarkdownEditor value={value} readOnly defaultView="split" />`;

const ReadOnly: React.FC = () => (
    <>
        <ComponentDemo title="Read-only Editor" description="All toolbar actions and keyboard shortcuts are disabled.">
            <MarkdownEditor value={sample} readOnly defaultView="split" maxHeight={420} />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ReadOnly;
