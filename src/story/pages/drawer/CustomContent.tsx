import React, { useState } from 'react';
import { Button, Drawer, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Drawer, Button, TextInput } from 'fluxo-ui';

<Drawer
  open={open}
  onClose={() => setOpen(false)}
  header="Edit Profile"
  footer={
    <div className="flex gap-2 justify-end">
      <Button variant="default" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </div>
  }
  size="480px"
>
  <form className="space-y-4">
    <TextInput label="Full Name" value={name} onChange={setName} />
    <TextInput label="Email" value={email} onChange={setEmail} />
  </form>
</Drawer>`;

const CustomContent: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john@example.com');

    return (
        <>
            <ComponentDemo
                title="Custom Header & Footer"
                description="A drawer with a form, custom header, and action buttons in the footer."
            >
                <Button variant="primary" onClick={() => setOpen(true)}>
                    Edit Profile
                </Button>
            </ComponentDemo>
            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                header="Edit Profile"
                footer={
                    <div className="flex gap-2 justify-end">
                        <Button variant="default" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                alert(`Saved: ${name}, ${email}`);
                                setOpen(false);
                            }}
                        >
                            Save
                        </Button>
                    </div>
                }
                size="480px"
            >
                <div className="space-y-4">
                    <TextInput placeholder="Full Name" value={name} onChange={(e) => setName(e.value)} />
                    <TextInput placeholder="Email" value={email} onChange={(e) => setEmail(e.value)} />
                </div>
            </Drawer>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomContent;
