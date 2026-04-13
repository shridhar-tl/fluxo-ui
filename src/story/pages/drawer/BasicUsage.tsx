import React, { useState } from 'react';
import { Button, Drawer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Drawer, Button } from 'ether-ui';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Drawer</Button>

<Drawer
  open={open}
  onClose={() => setOpen(false)}
  header="Drawer Title"
>
  <p>Drawer body content goes here.</p>
</Drawer>`;

const BasicUsage: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ComponentDemo title="Default Drawer" description="A right-side drawer with header and close button.">
                <Button onClick={() => setOpen(true)}>Open Drawer</Button>
            </ComponentDemo>
            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                header="Drawer Title"
            >
                <div className="space-y-4">
                    <p>This is the drawer body content. You can place any content here including forms, lists, or details panels.</p>
                    <p>Click the X button, press Escape, or click the backdrop to close.</p>
                </div>
            </Drawer>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
